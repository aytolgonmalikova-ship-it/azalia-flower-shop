/*
 * Заказы (Firestore, коллекция orders).
 *
 * Документ:
 *  - items — позиции: productId, name, price, quantity (название и цена на момент покупки);
 *  - customer — name, phone, address (при самовывозе address = «Самовывоз из магазина»);
 *  - deliveryMethod — «Курьерская доставка» или «Самовывоз»;
 *  - comment — комментарий клиента (может быть пустым);
 *  - totalPrice — сумма заказа в сомах (товары + доставка, если она платная);
 *  - status — new | processing | delivering | completed | cancelled;
 *  - createdAt — время сервера;
 *  - userId — UID покупателя, если он вошёл на сайт, иначе null.
 *
 * Создать заказ со статусом new может любой посетитель; читать все заказы, менять статус
 * и удалять — только администратор; вошедший пользователь читает свои заказы
 * (firestore.rules в корне проекта).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore/lite';
import { ORDER_STATUSES } from '../data/admin';
import { sendOrderNotification } from './api';
import { db } from './firebase';

const COLLECTION = 'orders';

// Ограничения те же, что в firestore.rules.
export const ORDER_NAME_MIN = 2;
export const ORDER_NAME_MAX = 60;
export const ORDER_PHONE_MIN_DIGITS = 9;
export const ORDER_PHONE_MAX = 30;
export const ORDER_ADDRESS_MIN = 5;
export const ORDER_ADDRESS_MAX = 200;
export const ORDER_COMMENT_MAX = 500;
export const ORDER_ITEMS_MAX = 50;
export const ORDER_QUANTITY_MAX = 99;

// Способ получения: ключ — значение переключателя на /cart, в документ пишется название.
export const DELIVERY_METHODS = { delivery: 'Курьерская доставка', pickup: 'Самовывоз' };
export const PICKUP_ADDRESS = 'Самовывоз из магазина';
// Стоимость курьерской доставки в сомах; 0 — бесплатно. Самовывоз всегда бесплатный.
export const DELIVERY_PRICE = 0;

export const deliveryCost = (deliveryType) => (deliveryType === 'pickup' ? 0 : DELIVERY_PRICE);

export const ORDER_ERROR_INVALID = 'order/invalid-data';

const orderError = (code) => Object.assign(new Error(code), { code });

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

// Короткий номер заказа для людей: делается из ID документа, отдельного поля нет.
export const formatOrderNumber = (id) => `AZ-${id.slice(0, 6).toUpperCase()}`;

function toOrder(snapshot) {
  const data = snapshot.data();
  const items = (Array.isArray(data.items) ? data.items : [])
    .map((item, index) => ({
      productId: asText(item?.productId) || `item-${index}`,
      name: asText(item?.name),
      price: Number(item?.price) || 0,
      quantity: Number(item?.quantity) || 0,
    }))
    .filter((item) => item.quantity > 0);

  return {
    id: snapshot.id,
    number: formatOrderNumber(snapshot.id),
    status: ORDER_STATUSES.includes(data.status) ? data.status : 'new',
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    customer: {
      name: asText(data.customer?.name),
      phone: asText(data.customer?.phone),
      address: asText(data.customer?.address),
    },
    items,
    comment: asText(data.comment),
    totalPrice: Number(data.totalPrice) || 0,
    userId: data.userId ?? null,
  };
}

/*
 * Оформить заказ с сайта. items: [{ productId, name, price, quantity }].
 * deliveryType — 'delivery' (курьер, нужен customer.address) или 'pickup' (самовывоз).
 * userId — UID вошедшего покупателя (или null для гостя); email — его почта, если известна:
 * в заказ не сохраняется, нужна только для письма администратору.
 * Возвращает ID и номер созданного заказа.
 */
export async function createOrder({
  items,
  customer,
  deliveryType = 'delivery',
  comment = '',
  userId = null,
  email = '',
}) {
  if (!Object.hasOwn(DELIVERY_METHODS, deliveryType)) throw orderError(ORDER_ERROR_INVALID);
  const isPickup = deliveryType === 'pickup';
  const deliveryPrice = deliveryCost(deliveryType);

  const lines = (items ?? []).map((item) => ({
    productId: String(item.productId),
    name: asText(item.name),
    price: Math.round(Number(item.price)),
    quantity: Math.round(Number(item.quantity)),
  }));
  const data = {
    items: lines,
    customer: {
      name: asText(customer?.name),
      phone: asText(customer?.phone),
      address: isPickup ? PICKUP_ADDRESS : asText(customer?.address),
    },
    deliveryMethod: DELIVERY_METHODS[deliveryType],
    comment: asText(comment),
    totalPrice:
      lines.reduce((sum, { price, quantity }) => sum + price * quantity, 0) + deliveryPrice,
    status: 'new',
    userId: userId ?? null,
  };

  const validLines =
    lines.length > 0 &&
    lines.length <= ORDER_ITEMS_MAX &&
    lines.every(
      ({ name, price, quantity }) =>
        name && price > 0 && quantity >= 1 && quantity <= ORDER_QUANTITY_MAX,
    );
  const { name, phone, address } = data.customer;
  if (
    !validLines ||
    name.length < ORDER_NAME_MIN ||
    name.length > ORDER_NAME_MAX ||
    phone.replace(/\D/g, '').length < ORDER_PHONE_MIN_DIGITS ||
    phone.length > ORDER_PHONE_MAX ||
    address.length < ORDER_ADDRESS_MIN ||
    address.length > ORDER_ADDRESS_MAX ||
    data.comment.length > ORDER_COMMENT_MAX
  ) {
    throw orderError(ORDER_ERROR_INVALID);
  }

  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp() });
  const number = formatOrderNumber(ref.id);

  // Письмо администратору не должно мешать оформлению: заказ уже сохранён,
  // поэтому отправку не ждём, а её сбой (ошибка EmailJS, исчерпан лимит) только логируем.
  try {
    sendOrderNotification({
      ...data,
      number,
      isPickup,
      deliveryPrice,
      email: asText(email),
    }).catch((error) => {
      console.error('Не удалось отправить письмо о заказе', number, error);
    });
  } catch (error) {
    console.error('Не удалось отправить письмо о заказе', number, error);
  }

  return { id: ref.id, number };
}

// Все заказы для админ-панели: от новых к старым.
export async function fetchOrders() {
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(toOrder);
}

export async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) throw orderError(ORDER_ERROR_INVALID);
  await updateDoc(doc(db, COLLECTION, id), { status });
}

export const deleteOrder = (id) => deleteDoc(doc(db, COLLECTION, id));

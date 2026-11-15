/*
 * API-слой сайта.
 *
 * Сейчас настоящего сервера нет, поэтому функции ниже ИМИТИРУЮТ запросы:
 * ждут небольшую паузу и возвращают демонстрационные данные.
 * Никакие данные никуда не отправляются.
 *
 * Чтобы подключить настоящий сервер, замените тела функций на fetch-запросы,
 * например:
 *
 *   export async function sendContactMessage(payload) {
 *     const response = await fetch(`${API_URL}/contact`, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload),
 *     });
 *     if (!response.ok) throw new ApiError('Request failed');
 *     return response.json();
 *   }
 *
 * Компоненты при этом менять не придётся.
 */
import emailjs from '@emailjs/browser';
import { productText } from '../data/products';
import { SERVICES } from '../data/services';
import i18n from '../i18n';

const MOCK_DELAY_MS = 900;

// Для проверки состояний ошибки: VITE_MOCK_ERROR=services,contact npm run dev
const forcedErrors = (import.meta.env.VITE_MOCK_ERROR ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

function mockRequest(name, result) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (offline || forcedErrors.includes(name)) {
        reject(new ApiError(`Mock request "${name}" failed`));
        return;
      }
      resolve(result);
    }, MOCK_DELAY_MS);
  });
}

export function getServices() {
  return mockRequest('services', SERVICES);
}

export async function sendContactMessage(payload) {
  const result = await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );

  if (result.status !== 200) {
    throw new ApiError('Не удалось отправить сообщение');
  }

  return { ok: true };
}

const ORDER_FALLBACK_EMAIL = 'no-reply@azalia.kg';

/*
 * Письмо администратору о новом заказе. Идёт через тот же сервис и шаблон EmailJS,
 * что и форма обратной связи (переменные шаблона: from_name, email, phone, message).
 * order: { number, items, customer, deliveryMethod, isPickup, deliveryPrice, comment,
 * totalPrice, email }. Способ получения дополнительно уходит отдельной переменной
 * delivery_method — её можно вывести в шаблоне EmailJS.
 */
export function sendOrderNotification(order) {
  // Письмо читает администратор, поэтому названия товаров и суммы — по-русски.
  const t = i18n.getFixedT('ru');
  const numberFormat = new Intl.NumberFormat('ru');
  const som = (value) => `${numberFormat.format(value)} сом`;

  const { customer, items, isPickup } = order;

  const message = [
    `Новый заказ № ${order.number}`,
    '',
    'Состав заказа:',
    ...items.map(
      (item, index) =>
        `${index + 1}. ${productText(t, item.name) || item.name} — ${item.quantity} шт. × ${som(item.price)} = ${som(item.price * item.quantity)}`,
    ),
    '',
    `Способ получения: ${order.deliveryMethod}`,
    ...(isPickup
      ? []
      : [
          `Адрес доставки: ${customer.address}`,
          `Стоимость доставки: ${order.deliveryPrice > 0 ? som(order.deliveryPrice) : 'Бесплатно'}`,
        ]),
    `Способ оплаты: ${isPickup ? 'Оплата при получении' : 'Оплата при получении курьеру'}`,
    ...(order.comment ? [`Комментарий к заказу: ${order.comment}`] : []),
    '',
    `Итого: ${som(order.totalPrice)}`,
  ].join('\n');

  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: `${customer.name} (Новый заказ)`,
      email: order.email || ORDER_FALLBACK_EMAIL,
      phone: customer.phone,
      delivery_method: order.deliveryMethod,
      message,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}
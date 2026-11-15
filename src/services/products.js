/*
 * Товары каталога (Firestore, коллекция products).
 *
 * Документ:
 *  - name, description — текст или ключ перевода catalog.products.<id>.* (стартовый каталог);
 *  - price — цена в сомах, целое число больше нуля;
 *  - category, color — значения фильтров каталога (data/products.js); у старых документов
 *    category может быть прежней (по виду цветка) — она переводится в раздел (normalizeCategory);
 *  - oldPrice — цена до скидки или null; isHit, isNew — подборки на главной;
 *  - image — ссылка на фото или data:-адрес сжатого фото, загруженного из панели;
 *  - localImage — id фотографии из стартового каталога (если своё фото не задано);
 *  - imagePosition — точка кадрирования фото в карточке;
 *  - inStock — в наличии; isVisible — показывать на витрине;
 *  - order — порядок в каталоге (меньше — выше); createdAt, updatedAt.
 *
 * Читать товары может любой посетитель, менять — только администратор
 * (firestore.rules в корне проекта).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import {
  isRemoteImage,
  LOCAL_PRODUCT_IMAGES,
  normalizeCategory,
  PRODUCT_CATEGORIES,
  PRODUCT_COLORS,
  PRODUCTS,
} from '../data/products';
import { db } from './firebase';

const COLLECTION = 'products';

// Ограничения те же, что в firestore.rules.
export const PRODUCT_NAME_MAX = 120;
export const PRODUCT_DESCRIPTION_MAX = 1000;
// Документ Firestore не больше 1 МБ, поэтому фото в виде data:-адреса ограничено.
export const PRODUCT_IMAGE_MAX_LENGTH = 700_000;

export const PRODUCT_ERROR_INVALID = 'product/invalid-data';

const productError = (code) => Object.assign(new Error(code), { code });

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

function toProduct(snapshot) {
  const data = snapshot.data();
  const price = Number(data.price);
  const oldPrice = Number(data.oldPrice);
  return {
    id: snapshot.id,
    name: asText(data.name),
    description: asText(data.description),
    price: Number.isFinite(price) ? price : 0,
    oldPrice: Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : undefined,
    category: normalizeCategory(data.category),
    color: PRODUCT_COLORS.includes(data.color) ? data.color : PRODUCT_COLORS[0],
    image: asText(data.image) || LOCAL_PRODUCT_IMAGES[data.localImage] || '',
    imagePosition: asText(data.imagePosition) || undefined,
    // Поля может не быть у документа, созданного вручную в консоли: считаем товар доступным.
    inStock: data.inStock !== false,
    isVisible: data.isVisible !== false,
    isHit: data.isHit === true,
    isNew: data.isNew === true,
    order: Number.isFinite(data.order) ? data.order : 0,
  };
}

const byOrder = (a, b) => a.order - b.order || a.id.localeCompare(b.id);

// Проверяет и приводит к виду документа только переданные поля (для создания — все).
function toDocData(values, { partial }) {
  const data = {};
  const has = (key) => !partial || key in values;

  if (has('name')) {
    data.name = asText(values.name);
    if (!data.name || data.name.length > PRODUCT_NAME_MAX) throw productError(PRODUCT_ERROR_INVALID);
  }
  if (has('description')) {
    data.description = asText(values.description);
    if (data.description.length > PRODUCT_DESCRIPTION_MAX) {
      throw productError(PRODUCT_ERROR_INVALID);
    }
  }
  if (has('price')) {
    data.price = Math.round(Number(values.price));
    if (!Number.isFinite(data.price) || data.price <= 0) throw productError(PRODUCT_ERROR_INVALID);
  }
  if (has('category')) {
    if (!PRODUCT_CATEGORIES.includes(values.category)) throw productError(PRODUCT_ERROR_INVALID);
    data.category = values.category;
  }
  if (has('color')) {
    if (!PRODUCT_COLORS.includes(values.color)) throw productError(PRODUCT_ERROR_INVALID);
    data.color = values.color;
  }
  // Новое фото заменяет и фотографию стартового каталога, и её кадрирование.
  if (has('image')) {
    data.image = asText(values.image);
    if (data.image.length > PRODUCT_IMAGE_MAX_LENGTH) throw productError(PRODUCT_ERROR_INVALID);
    data.localImage = null;
    data.imagePosition = null;
  }
  // Старая цена: пусто — скидки нет. Она должна быть больше текущей.
  if (has('oldPrice')) {
    const oldPrice = values.oldPrice == null || values.oldPrice === '' ? null : Math.round(Number(values.oldPrice));
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
      throw productError(PRODUCT_ERROR_INVALID);
    }
    data.oldPrice = oldPrice;
  }
  if (has('isHit')) data.isHit = Boolean(values.isHit);
  if (has('isNew')) data.isNew = Boolean(values.isNew);
  if (has('inStock')) data.inStock = Boolean(values.inStock);
  if (has('isVisible')) data.isVisible = Boolean(values.isVisible);
  return data;
}

// Поля документа в том виде, в каком их отдаёт toProduct (для обновления списка в памяти).
function toLocalPatch(data) {
  const { localImage: _localImage, imagePosition, ...rest } = data;
  const patch = 'image' in data ? { ...rest, imagePosition: imagePosition ?? undefined } : rest;
  if ('oldPrice' in data) patch.oldPrice = data.oldPrice ?? undefined;
  return patch;
}

// Все товары, включая скрытые: витрина сама отбирает видимые (hooks/useProducts.js).
export async function fetchProducts() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(toProduct).sort(byOrder);
}

// Новый товар встаёт в начало каталога. Возвращает товар в том же виде, что fetchProducts.
export async function addProduct(values) {
  const data = { ...toDocData(values, { partial: false }), order: -Date.now() };
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...toLocalPatch(data) };
}

// Изменить любые поля товара. Возвращает изменения для списка в памяти.
export async function updateProduct(id, patch) {
  const data = toDocData(patch, { partial: true });
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
  return toLocalPatch(data);
}

// Быстрые переключатели из таблицы товаров.
export const setProductStock = (id, inStock) => updateProduct(id, { inStock });
export const setProductVisibility = (id, isVisible) => updateProduct(id, { isVisible });

export const deleteProduct = (id) => deleteDoc(doc(db, COLLECTION, id));

// Поля документа для товара стартового каталога.
function starterDoc(product, index) {
  const remote = isRemoteImage(product.image);
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice ?? null,
    category: product.category,
    color: product.color,
    image: remote ? product.image : '',
    localImage: remote ? null : product.id,
    imagePosition: product.imagePosition ?? null,
    isHit: product.isHit,
    isNew: product.isNew,
    inStock: product.inStock,
    isVisible: true,
    order: index,
  };
}

/*
 * Подборки и раздел для товара стартового каталога, записанного до их появления.
 * Трогаем только то, чего в документе ещё нет (или прежнюю категорию по виду цветка),
 * чтобы не перезаписать изменения администратора.
 */
function starterPatch(product, data) {
  const patch = {};
  if (!('isHit' in data)) patch.isHit = product.isHit;
  if (!('isNew' in data)) patch.isNew = product.isNew;
  if (!('oldPrice' in data)) patch.oldPrice = product.oldPrice ?? null;
  if (!PRODUCT_CATEGORIES.includes(data.category)) patch.category = normalizeCategory(data.category);
  return patch;
}

// Сколько товаров стартового каталога ещё нет в списке (для кнопки дозагрузки в панели).
export function countMissingStarters(items) {
  const ids = new Set(items.map((item) => item.id));
  return PRODUCTS.filter((product) => !ids.has(product.id)).length;
}

/*
 * Первичная инициализация и дозагрузка: переносит стартовый каталог (data/products.js)
 * в Firestore. ID документов совпадают с id товаров, поэтому повторный запуск ничего
 * не дублирует: записываются только товары, которых в коллекции ещё нет, а у уже
 * записанных дополняются подборки и раздел (см. starterPatch).
 * Возвращает количество добавленных товаров.
 */
export async function seedProducts() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const existing = new Map(snapshot.docs.map((entry) => [entry.id, entry.data()]));
  const starters = PRODUCTS.map((product, index) => ({ product, index }));
  const missing = starters.filter(({ product }) => !existing.has(product.id));
  const outdated = starters
    .filter(({ product }) => existing.has(product.id))
    .map(({ product }) => ({ id: product.id, patch: starterPatch(product, existing.get(product.id)) }))
    .filter(({ patch }) => Object.keys(patch).length > 0);

  // Отдельные запросы, а не пакет: у пакетной записи жёсткий лимит обращений
  // к документам в правилах безопасности, а проверка isAdmin() их использует.
  const results = await Promise.allSettled([
    ...missing.map(({ product, index }) =>
      setDoc(doc(db, COLLECTION, product.id), {
        ...starterDoc(product, index),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
    ...outdated.map(({ id, patch }) =>
      updateDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: serverTimestamp() }),
    ),
  ]);

  const failure = results.find((result) => result.status === 'rejected');
  if (failure) throw failure.reason;
  return missing.length;
}

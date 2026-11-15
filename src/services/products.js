/*
 * Товары каталога (Firestore, коллекция products).
 *
 * Документ:
 *  - name, description — текст или ключ перевода catalog.products.<id>.* (стартовый каталог);
 *  - price — цена в сомах, целое число больше нуля;
 *  - category, color — значения фильтров каталога (data/products.js);
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
  LOCAL_PRODUCT_IMAGES,
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
  return {
    id: snapshot.id,
    name: asText(data.name),
    description: asText(data.description),
    price: Number.isFinite(price) ? price : 0,
    category: PRODUCT_CATEGORIES.includes(data.category) ? data.category : PRODUCT_CATEGORIES[0],
    color: PRODUCT_COLORS.includes(data.color) ? data.color : PRODUCT_COLORS[0],
    image: asText(data.image) || LOCAL_PRODUCT_IMAGES[data.localImage] || '',
    imagePosition: asText(data.imagePosition) || undefined,
    // Поля может не быть у документа, созданного вручную в консоли: считаем товар доступным.
    inStock: data.inStock !== false,
    isVisible: data.isVisible !== false,
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
  if (has('inStock')) data.inStock = Boolean(values.inStock);
  if (has('isVisible')) data.isVisible = Boolean(values.isVisible);
  return data;
}

// Поля документа в том виде, в каком их отдаёт toProduct (для обновления списка в памяти).
function toLocalPatch(data) {
  const { localImage: _localImage, imagePosition, ...rest } = data;
  return 'image' in data ? { ...rest, imagePosition: imagePosition ?? undefined } : rest;
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

/*
 * Первичная инициализация: переносит стартовый каталог (data/products.js) в Firestore.
 * ID документов совпадают с id товаров, поэтому повторный запуск ничего не дублирует:
 * записываются только те товары, которых в коллекции ещё нет.
 * Возвращает количество добавленных товаров.
 */
export async function seedProducts() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const existing = new Set(snapshot.docs.map((entry) => entry.id));
  const missing = PRODUCTS.map((product, index) => ({ product, index })).filter(
    ({ product }) => !existing.has(product.id),
  );

  // Отдельные запросы, а не пакет: у пакетной записи жёсткий лимит обращений
  // к документам в правилах безопасности, а проверка isAdmin() их использует.
  const results = await Promise.allSettled(
    missing.map(({ product, index }) =>
      setDoc(doc(db, COLLECTION, product.id), {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        color: product.color,
        image: '',
        localImage: product.id,
        imagePosition: product.imagePosition ?? null,
        inStock: true,
        isVisible: true,
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
  );

  const failure = results.find((result) => result.status === 'rejected');
  if (failure) throw failure.reason;
  return missing.length;
}

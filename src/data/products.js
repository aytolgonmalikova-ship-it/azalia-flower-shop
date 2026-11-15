import rosesBlush from '../assets/images/roses-blush.jpg';
import rosesRed from '../assets/images/roses-red.jpg';
import rosesPeach from '../assets/images/roses-peach.jpg';
import rosesCream from '../assets/images/roses-cream.jpg';
import peoniesPink from '../assets/images/peonies-pink.jpg';
import peoniesWhite from '../assets/images/peonies-white.jpg';
import tulipsYellow from '../assets/images/tulips-yellow.jpg';
import tulipsPlum from '../assets/images/tulips-plum.jpg';
import tulipsPink from '../assets/images/tulips-pink.jpg';
import tulipsMixed from '../assets/images/tulips-hands.jpg';
import daisiesWhite from '../assets/images/daisies-white.jpg';
import daisiesLilac from '../assets/images/daisies-lilac.jpg';
import gerberasPink from '../assets/images/gerberas-pink.jpg';
import callaWhite from '../assets/images/calla-white.jpg';
import orchidWhite from '../assets/images/orchid-white.jpg';
import orchidPurple from '../assets/images/orchid-purple.jpg';
import bouquetBlush from '../assets/images/bouquet-blush.jpg';
import bouquetWrapped from '../assets/images/bouquet-wrapped.jpg';
import bouquetGarden from '../assets/images/bouquet-garden.jpg';
import bouquetLilac from '../assets/images/bouquet-lilac.jpg';
import bouquetBurgundy from '../assets/images/bouquet-burgundy.jpg';

// Значения фильтров. Подписи лежат в переводах: catalog.colors.<id>, catalog.categories.<id>.
export const PRODUCT_COLORS = [
  'pink',
  'white',
  'red',
  'yellow',
  'purple',
  'lilac',
  'peach',
  'mixed',
];

export const PRODUCT_CATEGORIES = [
  'roses',
  'peonies',
  'tulips',
  'daisies',
  'lilies',
  'orchids',
  'author',
];

/*
 * Стартовый каталог. Настоящие товары лежат в Firestore (коллекция products,
 * см. services/products.js); этот список нужен в двух случаях:
 *  - витрина показывает его, пока Firestore загружается, недоступен или ещё пуст;
 *  - кнопка «Загрузить стартовый каталог» в админ-панели переносит его в Firestore.
 *
 * name и description — ключи переводов (тексты на трёх языках лежат в locales/<язык>/translation.json),
 * color и category — значения, по которым работает фильтр,
 * imagePosition — необязательная точка кадрирования фотографии в карточке.
 */
function product(id, category, color, price, image, imagePosition) {
  return {
    id,
    name: `catalog.products.${id}.name`,
    description: `catalog.products.${id}.description`,
    price,
    image,
    color,
    category,
    imagePosition,
    inStock: true,
    isVisible: true,
  };
}

export const PRODUCTS = [
  product('blushBouquet', 'author', 'pink', 6200, bouquetBlush),
  product('pinkPeonies', 'peonies', 'pink', 5400, peoniesPink),
  product('wrappedBouquet', 'author', 'peach', 4800, bouquetWrapped, '50% 48%'),
  product('blushRoses', 'roses', 'pink', 3200, rosesBlush),
  product('lilacBouquet', 'author', 'lilac', 3600, bouquetLilac, '50% 58%'),
  product('whitePeonies', 'peonies', 'white', 5900, peoniesWhite),
  product('redRoses', 'roses', 'red', 3900, rosesRed),
  product('plumTulips', 'tulips', 'purple', 2300, tulipsPlum, '50% 82%'),
  product('whiteOrchid', 'orchids', 'white', 4200, orchidWhite, '40% 50%'),
  product('gardenBouquet', 'author', 'mixed', 5600, bouquetGarden, '72% 50%'),
  product('creamRoses', 'roses', 'white', 4600, rosesCream),
  product('whiteCallas', 'lilies', 'white', 3400, callaWhite),
  product('pinkTulips', 'tulips', 'pink', 2100, tulipsPink),
  product('whiteDaisies', 'daisies', 'white', 1500, daisiesWhite),
  product('peachRoses', 'roses', 'peach', 2900, rosesPeach),
  product('burgundyBouquet', 'author', 'red', 5200, bouquetBurgundy),
  product('lilacDaisies', 'daisies', 'lilac', 1700, daisiesLilac),
  product('yellowTulips', 'tulips', 'yellow', 1900, tulipsYellow),
  product('purpleOrchid', 'orchids', 'purple', 3800, orchidPurple),
  product('mixedTulips', 'tulips', 'mixed', 2600, tulipsMixed, '50% 30%'),
  product('pinkGerberas', 'daisies', 'pink', 2400, gerberasPink, '50% 62%'),
];

// Фотографии стартового каталога по id товара. В Firestore у таких товаров хранится
// только id (поле localImage): адрес файла меняется при каждой сборке сайта.
export const LOCAL_PRODUCT_IMAGES = Object.fromEntries(
  PRODUCTS.map(({ id, image }) => [id, image]),
);

// Название и описание: у товаров стартового каталога это ключ перевода (три языка),
// у добавленных или переименованных в панели — обычный текст.
const TRANSLATION_KEY_PREFIX = 'catalog.products.';

export function productText(t, value) {
  if (typeof value !== 'string') return '';
  return value.startsWith(TRANSLATION_KEY_PREFIX) ? t(value) : value;
}

// Товары для блока на главной странице.
export const FEATURED_PRODUCT_IDS = ['blushBouquet', 'pinkPeonies', 'lilacBouquet', 'wrappedBouquet'];

/*
 * Фильтрация по реальным полям товара.
 * Внутри одной группы значения объединяются по «или» (розовые или белые),
 * между группами — по «и» (розовые или белые) и (розы или пионы).
 * Пустая группа ничего не ограничивает.
 */
export function filterProducts(products, { colors = [], categories = [] } = {}) {
  return products.filter(
    (item) =>
      (colors.length === 0 || colors.includes(item.color)) &&
      (categories.length === 0 || categories.includes(item.category)),
  );
}

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
import bouquetFestive from '../assets/images/bouquet-festive.jpg';
import bridalBouquet from '../assets/images/bridal-bouquet.jpg';
import tulipsVase from '../assets/images/tulips-vase.jpg';
import peoniesPale from '../assets/images/peonies-pale.jpg';
import pinkDaisies from '../assets/images/pink-daisies.jpg';
import chamomileBouquet from '../assets/images/chamomile-bouquet.jpg';
import ranunculusImage from '../assets/images/ranunculus.jpg';
import gerberaPastel from '../assets/images/gerbera.jpg';
import rosesWrapped from '../assets/images/roses-bouquet.jpg';
import rosesEnglish from '../assets/images/hero-peonies.jpg';
import rosesCoral from '../assets/images/peach-roses.jpg';

// Фотографии с Unsplash (бесплатная лицензия Unsplash, см. CREDITS.md). Размер под карточку.
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=75`;

// Значения фильтров. Подписи лежат в переводах: catalog.colors.<id>, catalog.categories.<id>.
export const PRODUCT_COLORS = [
  'pink',
  'white',
  'red',
  'yellow',
  'purple',
  'lilac',
  'peach',
  'green',
  'mixed',
];

// Разделы каталога (порядок — как во вкладках витрины).
export const PRODUCT_CATEGORIES = ['author', 'roses', 'mono', 'plants', 'gifts'];

/*
 * Прежние категории (по виду цветка) из документов Firestore, созданных до перехода
 * на разделы. Такие товары показываются в новом разделе; при сохранении из панели
 * категория перезаписывается.
 */
const LEGACY_CATEGORIES = {
  peonies: 'mono',
  tulips: 'mono',
  daisies: 'mono',
  lilies: 'mono',
  orchids: 'plants',
};

export function normalizeCategory(value) {
  if (PRODUCT_CATEGORIES.includes(value)) return value;
  return LEGACY_CATEGORIES[value] ?? PRODUCT_CATEGORIES[0];
}

/*
 * Стартовый каталог. Настоящие товары лежат в Firestore (коллекция products,
 * см. services/products.js); этот список нужен в двух случаях:
 *  - витрина показывает его, пока Firestore загружается, недоступен или ещё пуст;
 *  - кнопка «Загрузить стартовый каталог» в админ-панели переносит его в Firestore
 *    (повторное нажатие дозаписывает только недостающие товары).
 *
 * name и description — ключи переводов (тексты на трёх языках лежат в locales/<язык>/translation.json),
 * color и category — значения, по которым работает фильтр.
 * Необязательные поля (options):
 *  - imagePosition — точка кадрирования фотографии в карточке;
 *  - oldPrice — цена до скидки (товар попадает в подборку «Скидки»);
 *  - isHit, isNew — подборки «Хиты продаж» и «Новинки» на главной;
 *  - inStock: false — «Нет в наличии».
 */
function product(id, category, color, price, image, options = {}) {
  const { imagePosition, oldPrice, isHit = false, isNew = false, inStock = true } = options;
  return {
    id,
    name: `catalog.products.${id}.name`,
    description: `catalog.products.${id}.description`,
    price,
    oldPrice,
    image,
    color,
    category,
    imagePosition,
    isHit,
    isNew,
    inStock,
    isVisible: true,
  };
}

export const PRODUCTS = [
  // Авторские букеты
  product('blushBouquet', 'author', 'pink', 6200, bouquetBlush, { isHit: true }),
  product('peachCloud', 'author', 'peach', 5800, unsplash('1563241527-3004b7be0ffd'), {
    isNew: true,
    imagePosition: '50% 40%',
  }),
  product('wrappedBouquet', 'author', 'peach', 4800, bouquetWrapped, {
    imagePosition: '50% 48%',
  }),
  product('lilacBouquet', 'author', 'lilac', 3600, bouquetLilac, {
    imagePosition: '50% 58%',
    oldPrice: 4200,
    isHit: true,
  }),
  product('gardenBouquet', 'author', 'mixed', 5600, bouquetGarden, { imagePosition: '72% 50%' }),
  product('sunflowerCraft', 'author', 'yellow', 3900, unsplash('1567696153798-9111f9cd3d0d'), {
    isNew: true,
  }),
  product('burgundyBouquet', 'author', 'red', 5200, bouquetBurgundy),
  product('brideBouquet', 'author', 'pink', 7400, bridalBouquet, { isNew: true }),
  product('eustomaBouquet', 'author', 'pink', 6800, bouquetFestive, {
    imagePosition: '52% 50%',
    isHit: true,
  }),
  product('springVase', 'author', 'mixed', 4900, tulipsVase, { imagePosition: '64% 50%' }),

  // Розы
  product('redRoses', 'roses', 'red', 3900, rosesRed, { isHit: true }),
  product('blushRoses', 'roses', 'pink', 3200, rosesBlush),
  product('peonyRoses', 'roses', 'pink', 6500, unsplash('1582794543139-8ac9cb0f7b11'), {
    isNew: true,
    isHit: true,
  }),
  product('creamRoses', 'roses', 'white', 4600, rosesCream),
  product('peachRoses', 'roses', 'peach', 2900, rosesPeach, { oldPrice: 3400 }),
  product('roseVase', 'roses', 'mixed', 4400, unsplash('1591886960571-74d43a9d4166'), {
    isNew: true,
  }),
  product('pinkRosesWrap', 'roses', 'pink', 2700, rosesWrapped, { imagePosition: '54% 50%' }),
  product('englishRoses', 'roses', 'pink', 5600, rosesEnglish, {
    imagePosition: '50% 52%',
    isNew: true,
  }),
  product('coralRoses', 'roses', 'peach', 3500, rosesCoral, {
    imagePosition: '75% 50%',
    oldPrice: 3900,
  }),

  // Монобукеты
  product('pinkPeonies', 'mono', 'pink', 5400, peoniesPink, { isHit: true }),
  product('whitePeonies', 'mono', 'white', 5900, peoniesWhite),
  product('plumTulips', 'mono', 'purple', 2300, tulipsPlum, { imagePosition: '50% 82%' }),
  product('pinkTulips', 'mono', 'pink', 2100, tulipsPink, { oldPrice: 2500 }),
  product('yellowTulips', 'mono', 'yellow', 1900, tulipsYellow),
  product('mixedTulips', 'mono', 'mixed', 2600, tulipsMixed, { imagePosition: '50% 30%' }),
  product('sunflowers', 'mono', 'yellow', 2800, unsplash('1455659817273-f96807779a8a'), {
    isNew: true,
  }),
  product('whiteCallas', 'mono', 'white', 3400, callaWhite, { inStock: false }),
  product('whiteDaisies', 'mono', 'white', 1500, daisiesWhite),
  product('lilacDaisies', 'mono', 'lilac', 1700, daisiesLilac, { oldPrice: 2000 }),
  product('pinkGerberas', 'mono', 'pink', 2400, gerberasPink, { imagePosition: '50% 62%' }),
  product('palePeonies', 'mono', 'pink', 5200, peoniesPale, {
    imagePosition: '0% 50%',
    oldPrice: 5900,
  }),
  product('ranunculus', 'mono', 'mixed', 3600, ranunculusImage, {
    imagePosition: '63% 50%',
    isHit: true,
  }),
  product('sprayChrysanthemums', 'mono', 'pink', 2200, pinkDaisies, { imagePosition: '40% 50%' }),
  product('matricaria', 'mono', 'white', 1800, chamomileBouquet, {
    imagePosition: '75% 50%',
    isNew: true,
  }),
  product('pastelGerbera', 'mono', 'pink', 300, gerberaPastel, { imagePosition: '90% 50%' }),

  // Комнатные растения
  product('whiteOrchid', 'plants', 'white', 4200, orchidWhite, {
    imagePosition: '40% 50%',
    isHit: true,
  }),
  product('monstera', 'plants', 'green', 4500, unsplash('1614594975525-e45190c55d0b'), {
    isNew: true,
  }),
  product('purpleOrchid', 'plants', 'purple', 3800, orchidPurple),
  product('ficusGinseng', 'plants', 'green', 3600, unsplash('1512428813834-c702c7702b78')),
  product('chlorophytum', 'plants', 'green', 1800, unsplash('1572688484438-313a6e50c333'), {
    oldPrice: 2200,
    imagePosition: '30% 50%',
  }),
  product('haworthia', 'plants', 'green', 1200, unsplash('1485955900006-10f4d324d411'), {
    inStock: false,
  }),

  // Подарки и дополнения
  product('macarons', 'gifts', 'pink', 1400, unsplash('1569864358642-9d1684040f43'), {
    isHit: true,
  }),
  product('chocolates', 'gifts', 'mixed', 1900, unsplash('1481391319762-47dff72954d9')),
  product('balloons', 'gifts', 'mixed', 1500, unsplash('1530103862676-de8c9debad1d'), {
    oldPrice: 1800,
  }),
  product('candle', 'gifts', 'white', 1600, unsplash('1603006905003-be475563bc59'), {
    isNew: true,
  }),
];

export const isRemoteImage = (image) => /^https?:\/\//i.test(image ?? '');

// Фотографии стартового каталога из папки assets по id товара. В Firestore у таких
// товаров хранится только id (поле localImage): адрес файла меняется при каждой сборке.
// Фото с Unsplash записываются в документ обычной ссылкой (поле image).
export const LOCAL_PRODUCT_IMAGES = Object.fromEntries(
  PRODUCTS.filter(({ image }) => !isRemoteImage(image)).map(({ id, image }) => [id, image]),
);

// Название и описание: у товаров стартового каталога это ключ перевода (три языка),
// у добавленных или переименованных в панели — обычный текст.
const TRANSLATION_KEY_PREFIX = 'catalog.products.';

export function productText(t, value) {
  if (typeof value !== 'string') return '';
  return value.startsWith(TRANSLATION_KEY_PREFIX) ? t(value) : value;
}

// Подборки для вкладок на главной странице.
export const SHOWCASE_TABS = ['hits', 'new', 'sale'];

export const isOnSale = (item) => Number(item.oldPrice) > Number(item.price);

const SHOWCASE_FILTERS = {
  hits: (item) => item.isHit,
  new: (item) => item.isNew,
  sale: isOnSale,
};

export const SHOWCASE_LIMIT = 8;

/*
 * Товары подборки. Если отмеченных товаров в Firestore нет (каталог загружен
 * до появления подборок), «Хиты» дополняются первыми товарами каталога,
 * чтобы блок на главной не был пустым.
 */
export function pickShowcase(products, tab) {
  const picked = products.filter(SHOWCASE_FILTERS[tab] ?? (() => false));
  if (tab === 'hits' && picked.length < 4) {
    const rest = products.filter((item) => !picked.includes(item));
    return [...picked, ...rest].slice(0, SHOWCASE_LIMIT);
  }
  return picked.slice(0, SHOWCASE_LIMIT);
}

// Сортировка каталога. Значения — параметр sort в адресной строке.
export const PRODUCT_SORTS = ['default', 'priceAsc', 'priceDesc', 'new'];

export function sortProducts(products, sort) {
  const list = [...products];
  // Товары не в наличии всегда в конце списка.
  const stock = (a, b) => Number(b.inStock !== false) - Number(a.inStock !== false);
  const compare = {
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    new: (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)),
  }[sort];
  return list.sort((a, b) => stock(a, b) || (compare ? compare(a, b) : 0));
}

/*
 * Фильтрация по реальным полям товара.
 * Внутри одной группы значения объединяются по «или» (розовые или белые),
 * между группами — по «и» (розовые или белые) и (розы или монобукеты).
 * Пустая группа ничего не ограничивает.
 */
export function filterProducts(products, { colors = [], categories = [] } = {}) {
  return products.filter(
    (item) =>
      (colors.length === 0 || colors.includes(item.color)) &&
      (categories.length === 0 || categories.includes(item.category)),
  );
}

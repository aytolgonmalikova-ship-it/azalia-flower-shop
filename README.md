# Цветочный магазин «Азалия»

Одностраничное приложение (SPA) цветочного магазина: главная, «О нас», «Каталог», «Услуги» и «Контакты».
Три языка (кыргызский, русский, английский), светлая и тёмная темы, форма обратной связи с проверкой полей и связь через WhatsApp.

## Запуск

Нужен Node.js 20.19+ (или 22.12+) и npm.

```bash
npm install        # установить зависимости
npm run dev        # режим разработки: http://localhost:5173
npm run build      # production-сборка в папку dist/
npm run preview    # локальный просмотр собранной версии: http://localhost:4173
```

## Что важно знать

- **Форма отправляет данные в демонстрационном режиме.** Настоящего сервера нет: `src/services/api.js`
  имитирует запрос (пауза и ответ «успешно»), сообщение никуда не передаётся. Об этом сказано и в самой форме.
  Чтобы подключить сервер, замените тела функций в `src/services/api.js` на `fetch`-запросы — пример есть в комментарии
  в начале файла. Компоненты менять не нужно.
- **Каталог и заказы хранятся в Firestore.** Товары лежат в коллекции `products` (`src/services/products.js`),
  заказы — в `orders` (`src/services/orders.js`); ими управляет админ-панель (`/admin/products`, `/admin/orders`).
  `src/data/products.js` — стартовый каталог: витрина показывает его, пока Firestore загружается, недоступен или пуст,
  а кнопка «Загрузить стартовый каталог» в админ-панели переносит его в Firestore. Товар с `inStock: false` показан
  с меткой «Нет в наличии» и не добавляется в корзину, товар с `isVisible: false` на витрину не попадает.
  Покупатель складывает товары в корзину (`/cart`) и оформляет заказ; кнопка WhatsApp в карточке открывает чат
  с готовым текстом. Права доступа задаёт `firestore.rules` — после изменения файл нужно опубликовать в Firebase Console
  (Firestore Database → Rules → Publish).
  Фильтры по цвету и категории работают по полям `color` и `category` каждого товара; выбранные
  фильтры хранятся в адресе страницы (`/catalog?color=pink,white&category=roses`), поэтому подборкой можно поделиться.
- **Ссылки на Instagram и Telegram — демонстрационные.** Реальные адреса указываются в `src/data/contacts.js`.
  Там же лежат телефон и ссылка WhatsApp (`+996 504 88 99 91`, `https://wa.me/996504889991`).
- **Адрес, email и часы работы магазина на сайте не указаны** — этих данных не было в задании.
- **Хостинг.** Сайт использует `BrowserRouter`, поэтому на сервере все пути (`/about`, `/catalog`, `/services`, `/contact`)
  должны отдавать `index.html`. На Netlify и Vercel это настраивается одним правилом перенаправления.
- **Кыргызский перевод** стоит показать носителю языка перед публикацией.

### Как увидеть состояния ошибки

- Отключите интернет (или включите Offline в DevTools → Network) и отправьте форму либо откройте «Услуги».
- Либо запустите с переменной окружения: `VITE_MOCK_ERROR=services,contact npm run dev`.

## Технологии

React 19, Vite 8, JavaScript (ES6+), React Router DOM 7, i18next + react-i18next, Lucide React (иконки интерфейса),
React Icons (фирменные иконки WhatsApp, Instagram, Telegram), обычный CSS с переменными, шрифты Cormorant Garamond
и Nunito (подключены локально через `@fontsource`, без внешних CDN).

## Структура проекта

```
index.html            — HTML-оболочка; ранний скрипт применяет тему до первой отрисовки
public/               — favicon
src/
  main.jsx            — точка входа: роутер, провайдер темы, i18n, стили
  App.jsx             — маршруты: /, /about, /catalog, /services, /contact и страница 404
  i18n.js             — настройка i18next, выбор и сохранение языка
  assets/images/      — фотографии (источники — в CREDITS.md)
  components/         — переиспользуемые компоненты: Header, Footer, Button, ContactForm, ServiceCard,
                        ProductCard, ProductFilters, ThemeToggle, LanguageSwitcher, PetalsBackground, Reveal и др.
  sections/           — крупные блоки страниц: Hero, Welcome, FeaturedProducts, CatalogSection, AboutSection,
                        ServicesSection, ContactSection, CtaBanner
  pages/              — страницы, собранные из секций
  context/            — ThemeContext: светлая/тёмная тема
  hooks/              — useServices (загрузка услуг), useProductFilters (фильтры каталога в адресной строке),
                        useReveal (появление при прокрутке), useMediaQuery
  services/api.js     — API-слой (сейчас имитация запросов)
  data/               — демонстрационные данные: услуги, товары каталога, контакты, навигация, языки
  locales/            — переводы: ru/, ky/, en/ (translation.json)
  styles/             — variables.css (палитры обеих тем), base, buttons, layout, sections, contact, effects,
                        petal-cards (формы карточек-лепестков), catalog (фильтры и карточки товаров)
  utils/              — validation.js (проверка формы), storage.js (безопасный localStorage)
```

## Настройки, которые сохраняются в браузере

- `azalia-lang` — выбранный язык. При первом посещении берётся язык браузера (если это ky/ru/en), иначе русский.
- `azalia-theme` — выбранная тема. Пока тема не выбрана вручную, сайт следует системной настройке.

Анимации (падающие лепестки, появление блоков) отключаются, если в системе включено «Уменьшение движения».

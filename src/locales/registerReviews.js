import i18n from '../i18n';
import ru from './ru/reviews.json';
import ky from './ky/reviews.json';
import en from './en/reviews.json';

// Переводы раздела «Отзывы» на главной странице. Все ключи лежат в ветке reviews.* общего словаря.
Object.entries({ ru, ky, en }).forEach(([language, resources]) => {
  i18n.addResourceBundle(language, 'translation', { reviews: resources }, true, true);
});

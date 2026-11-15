import i18n from '../i18n';
import ru from './ru/admin.json';
import ky from './ky/admin.json';
import en from './en/admin.json';

// Переводы админ-панели подгружаются вместе с ней и не утяжеляют публичный сайт.
// Все ключи лежат в ветке admin.* общего словаря.
Object.entries({ ru, ky, en }).forEach(([language, resources]) => {
  i18n.addResourceBundle(language, 'translation', { admin: resources }, true, true);
});

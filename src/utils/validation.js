export const NAME_MIN_LENGTH = 2;
export const MESSAGE_MIN_LENGTH = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Код страны зафиксирован в поле, клиент вводит только 9 цифр после него.
export const PHONE_COUNTRY_CODE = '+996';
export const PHONE_LOCAL_DIGITS = 9;

const ERRORS = 'contact.form.errors';

// Каждый валидатор возвращает null или { key, params } — ключ перевода,
// чтобы текст ошибки менялся вместе с языком интерфейса.
const validators = {
  name(value) {
    const name = value.trim();
    if (!name) return { key: `${ERRORS}.nameRequired` };
    if (name.length < NAME_MIN_LENGTH) {
      return { key: `${ERRORS}.nameShort`, params: { min: NAME_MIN_LENGTH } };
    }
    return null;
  },
  email(value) {
    const email = value.trim();
    if (!email) return { key: `${ERRORS}.emailRequired` };
    if (!EMAIL_PATTERN.test(email)) return { key: `${ERRORS}.emailInvalid` };
    return null;
  },
  // value — только цифры номера без кода страны.
  phone(value) {
    const digits = value.trim();
    if (!digits) return { key: `${ERRORS}.phoneRequired` };
    if (!/^\d+$/.test(digits) || digits.length !== PHONE_LOCAL_DIGITS) {
      return { key: `${ERRORS}.phoneInvalid` };
    }
    return null;
  },
  message(value) {
    const message = value.trim();
    if (!message) return { key: `${ERRORS}.messageRequired` };
    if (message.length < MESSAGE_MIN_LENGTH) {
      return { key: `${ERRORS}.messageShort`, params: { min: MESSAGE_MIN_LENGTH } };
    }
    return null;
  },
};

export function validateField(name, value) {
  return validators[name] ? validators[name](value) : null;
}

export function validateContactForm(values) {
  const errors = {};
  Object.keys(validators).forEach((name) => {
    const error = validateField(name, values[name] ?? '');
    if (error) errors[name] = error;
  });
  return errors;
}

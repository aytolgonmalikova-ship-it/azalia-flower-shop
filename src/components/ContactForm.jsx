import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, CircleCheck, Info, LoaderCircle, Send } from 'lucide-react';
import Button from './Button.jsx';
import FormField from './FormField.jsx';
import { sendContactMessage } from '../services/api';
import {
  PHONE_COUNTRY_CODE,
  PHONE_LOCAL_DIGITS,
  validateContactForm,
  validateField,
} from '../utils/validation';

const EMPTY_VALUES = { name: '', email: '', phone: '', message: '' };
const FIELD_ORDER = ['name', 'email', 'phone', 'message'];
// В поле телефона код страны показан всегда, в состоянии хранятся только 9 цифр.
const PHONE_PREFIX = `${PHONE_COUNTRY_CODE} `;
const COUNTRY_CODE_DIGITS = PHONE_COUNTRY_CODE.replace(/\D/g, '');

// Достаёт из содержимого поля цифры номера без кода страны.
function extractPhoneDigits(raw, currentDigits, inputType = '') {
  let digits;
  if (raw.startsWith(PHONE_COUNTRY_CODE)) {
    digits = raw.slice(PHONE_COUNTRY_CODE.length).replace(/\D/g, '');
  } else if (raw && inputType.startsWith('delete')) {
    // Попытка стереть часть кода страны — оставляем номер как был.
    return currentDigits;
  } else {
    // Поле заменено целиком (вставка, автозаполнение): убираем код страны
    // или ведущий ноль местного формата, если номер вставлен вместе с ними.
    digits = raw.replace(/\D/g, '');
    if (digits.length > PHONE_LOCAL_DIGITS && digits.startsWith(COUNTRY_CODE_DIGITS)) {
      digits = digits.slice(COUNTRY_CODE_DIGITS.length);
    } else if (digits.length === PHONE_LOCAL_DIGITS + 1 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
  }
  return digits.slice(0, PHONE_LOCAL_DIGITS);
}

// status: 'idle' | 'loading' | 'success' | 'error'
export default function ContactForm({ serviceId = null }) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');

  const isLoading = status === 'loading';

  const setFieldError = (name, error) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleChange = (event) => {
    const { name } = event.target;
    const value =
      name === 'phone'
        ? extractPhoneDigits(event.target.value, values.phone, event.nativeEvent?.inputType)
        : event.target.value;
    setValues((current) => ({ ...current, [name]: value }));
    // После первой проверки поля исправления подсвечиваются сразу.
    if (touched[name]) setFieldError(name, validateField(name, value));
    if (status === 'error') setStatus('idle');
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const value = name === 'phone' ? values.phone : event.target.value;
    setTouched((current) => ({ ...current, [name]: true }));
    setFieldError(name, validateField(name, value));
  };

  // Не даём поставить курсор или выделение внутрь кода страны.
  const keepCaretAfterPrefix = (event) => {
    const input = event.target;
    const min = PHONE_PREFIX.length;
    if (input.selectionStart < min) {
      input.setSelectionRange(min, Math.max(input.selectionEnd, min));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    const firstInvalid = FIELD_ORDER.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setStatus('loading');
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: `${PHONE_COUNTRY_CODE}${values.phone}`,
        message: values.message.trim(),
        service: serviceId,
      });
      setValues(EMPTY_VALUES);
      setTouched({});
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="form-result" role="status">
        <span className="form-result__icon" aria-hidden="true">
          <CircleCheck size={34} />
        </span>
        <h3 className="form-result__title">{t('contact.form.successTitle')}</h3>
        <p className="form-result__text">{t('contact.form.successText')}</p>
        <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
          {t('contact.form.sendAnother')}
        </Button>
      </div>
    );
  }

  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: isLoading,
  });

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
      {serviceId && (
        <p className="contact-form__service">
          {t('contact.form.selectedService', { service: t(`services.items.${serviceId}.title`) })}
        </p>
      )}

      <FormField
        {...fieldProps('name')}
        label={t('contact.form.name')}
        placeholder={t('contact.form.namePlaceholder')}
        type="text"
        autoComplete="name"
      />
      <div className="contact-form__row">
        <FormField
          {...fieldProps('email')}
          label={t('contact.form.email')}
          placeholder={t('contact.form.emailPlaceholder')}
          type="email"
          inputMode="email"
          autoComplete="email"
        />
        <FormField
          {...fieldProps('phone')}
          value={`${PHONE_PREFIX}${values.phone}`}
          onSelect={keepCaretAfterPrefix}
          label={t('contact.form.phone')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>
      <FormField
        {...fieldProps('message')}
        label={t('contact.form.message')}
        placeholder={t('contact.form.messagePlaceholder')}
        multiline
        rows={5}
      />

      {status === 'error' && (
        <div className="form-alert" role="alert">
          <CircleAlert size={22} aria-hidden="true" />
          <div>
            <p className="form-alert__title">{t('contact.form.errorTitle')}</p>
            <p>{t('contact.form.errorText')}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="contact-form__submit"
        disabled={isLoading}
        aria-busy={isLoading}
        icon={isLoading ? <LoaderCircle size={19} className="spinner" /> : <Send size={18} />}
      >
        {isLoading ? t('contact.form.sending') : t('contact.form.submit')}
      </Button>

      <p className="contact-form__note">
        <Info size={16} aria-hidden="true" />
        <span>{t('contact.form.demoNote')}</span>
      </p>
    </form>
  );
}

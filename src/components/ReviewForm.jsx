import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, CircleCheck, Info, LoaderCircle, Send } from 'lucide-react';
import Button from './Button.jsx';
import FormField from './FormField.jsx';
import RatingStars from './RatingStars.jsx';
import {
  REVIEW_MAX_RATING,
  REVIEW_NAME_MAX_LENGTH,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from '../data/reviews';
import { reviewsStore } from '../utils/reviewsStore';
import { validateField } from '../utils/validation';

const EMPTY_VALUES = { name: '', text: '' };
const FIELD_ORDER = ['name', 'text'];
const ERRORS = 'reviews.form.errors';

const validators = {
  // Имя проверяется по тем же правилам, что и в форме обратной связи.
  name: (value) => validateField('name', value),
  text(value) {
    const text = value.trim();
    if (!text) return { key: `${ERRORS}.textRequired` };
    if (text.length < REVIEW_TEXT_MIN_LENGTH) {
      return { key: `${ERRORS}.textShort`, params: { min: REVIEW_TEXT_MIN_LENGTH } };
    }
    return null;
  },
};

// Форма отзыва клиента. Отзыв сохраняется в Firestore со статусом «На модерации».
// status: 'idle' | 'loading' | 'success' | 'error'
export default function ReviewForm({ onClose }) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [rating, setRating] = useState(REVIEW_MAX_RATING);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const isLoading = status === 'loading';

  // Форма раскрывается по кнопке — сразу переводим фокус в первое поле.
  useEffect(() => {
    formRef.current?.elements.name?.focus();
  }, []);

  const setFieldError = (name, error) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setFieldError(name, validators[name](value));
    if (status === 'error') setStatus('idle');
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value.trim()) setFieldError(name, validators[name](value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const validationErrors = {};
    FIELD_ORDER.forEach((name) => {
      const error = validators[name](values[name]);
      if (error) validationErrors[name] = error;
    });
    setErrors(validationErrors);

    const firstInvalid = FIELD_ORDER.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setStatus('loading');
    try {
      await reviewsStore.add({ author: values.name.trim(), rating, text: values.text.trim() });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(EMPTY_VALUES);
    setRating(REVIEW_MAX_RATING);
    setErrors({});
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <div className="form-result" role="status">
        <span className="form-result__icon" aria-hidden="true">
          <CircleCheck size={34} />
        </span>
        <h3 className="form-result__title">{t('reviews.form.successTitle')}</h3>
        <p className="form-result__text">{t('reviews.form.successText')}</p>
        <Button variant="secondary" size="sm" onClick={reset}>
          {t('reviews.form.sendAnother')}
        </Button>
      </div>
    );
  }

  const fieldProps = (name) => ({
    id: `review-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: isLoading,
  });

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
      <h3 className="card__title">{t('reviews.form.title')}</h3>

      <FormField
        {...fieldProps('name')}
        label={t('reviews.form.name')}
        placeholder={t('reviews.form.namePlaceholder')}
        type="text"
        autoComplete="given-name"
        maxLength={REVIEW_NAME_MAX_LENGTH}
      />

      <fieldset className="field review-form__rating">
        <legend className="field__label">{t('reviews.form.rating')}</legend>
        <RatingStars name="rating" rating={rating} onChange={setRating} disabled={isLoading} />
      </fieldset>

      <FormField
        {...fieldProps('text')}
        label={t('reviews.form.text')}
        placeholder={t('reviews.form.textPlaceholder')}
        maxLength={REVIEW_TEXT_MAX_LENGTH}
        multiline
        rows={4}
      />

      {status === 'error' && (
        <div className="form-alert" role="alert">
          <CircleAlert size={22} aria-hidden="true" />
          <div>
            <p className="form-alert__title">{t('reviews.form.errorTitle')}</p>
            <p>{t('reviews.form.errorText')}</p>
          </div>
        </div>
      )}

      <div className="review-form__actions">
        <Button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          icon={isLoading ? <LoaderCircle size={19} className="spinner" /> : <Send size={18} />}
        >
          {isLoading ? t('reviews.form.sending') : t('reviews.form.submit')}
        </Button>
        <Button variant="secondary" disabled={isLoading} onClick={onClose}>
          {t('reviews.form.cancel')}
        </Button>
      </div>

      <p className="contact-form__note">
        <Info size={16} aria-hidden="true" />
        <span>{t('reviews.form.note')}</span>
      </p>
    </form>
  );
}

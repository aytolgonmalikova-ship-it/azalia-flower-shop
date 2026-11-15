import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import Button from '../Button.jsx';
import FlowerIcon from '../FlowerIcon.jsx';
import FormField from '../FormField.jsx';
import Modal from './Modal.jsx';
import SelectField from './SelectField.jsx';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../../data/products';
import { useAdminFormat } from '../../hooks/useAdminFormat';
import {
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_IMAGE_MAX_LENGTH,
  PRODUCT_NAME_MAX,
} from '../../services/products';
import { compressImage } from '../../utils/image';

const ERRORS = 'admin.errors';
const FIELDS = ['title', 'description', 'price', 'oldPrice', 'imageUrl'];

const isLink = (value) => /^https?:\/\//i.test(value);

function validate(values) {
  const errors = {};
  const title = values.title.trim();
  if (!title) errors.title = { key: `${ERRORS}.productNameRequired` };
  else if (title.length > PRODUCT_NAME_MAX) {
    errors.title = { key: `${ERRORS}.productNameTooLong`, params: { max: PRODUCT_NAME_MAX } };
  }
  if (values.description.trim().length > PRODUCT_DESCRIPTION_MAX) {
    errors.description = {
      key: `${ERRORS}.productDescriptionTooLong`,
      params: { max: PRODUCT_DESCRIPTION_MAX },
    };
  }
  const price = Number(values.price);
  if (!values.price || !Number.isFinite(price) || price <= 0) {
    errors.price = { key: `${ERRORS}.priceInvalid` };
  }
  // Старая цена необязательна; если указана — она больше текущей (иначе это не скидка).
  if (values.oldPrice) {
    const oldPrice = Number(values.oldPrice);
    if (!Number.isFinite(oldPrice) || oldPrice <= 0 || (Number.isFinite(price) && oldPrice <= price)) {
      errors.oldPrice = { key: `${ERRORS}.oldPriceInvalid` };
    }
  }
  const image = values.image.trim();
  if (image && !isLink(image) && !image.startsWith('data:image/') && image !== values.initialImage) {
    errors.imageUrl = { key: `${ERRORS}.imageUrlInvalid` };
  } else if (image.length > PRODUCT_IMAGE_MAX_LENGTH) {
    errors.imageUrl = { key: `${ERRORS}.imageTooLarge` };
  }
  return errors;
}

/*
 * Форма добавления и редактирования товара. product = null — новый товар.
 * onSave(data) возвращает Promise: пока он выполняется, окно остаётся открытым,
 * а при ошибке показывает её и даёт повторить сохранение.
 */
export default function ProductFormModal({ product = null, onSave, onClose }) {
  const { t } = useTranslation();
  const { text } = useAdminFormat();
  const formRef = useRef(null);
  const fileRef = useRef(null);
  const [values, setValues] = useState(() => ({
    title: text(product?.name),
    description: text(product?.description),
    category: product?.category ?? PRODUCT_CATEGORIES[0],
    color: product?.color ?? PRODUCT_COLORS[0],
    price: product ? String(product.price) : '',
    oldPrice: product?.oldPrice ? String(product.oldPrice) : '',
    isHit: product?.isHit ?? false,
    isNew: product?.isNew ?? false,
    image: product?.image ?? '',
    // Фото, с которым открыли форму: если его не меняли, поле фото не перезаписывается.
    initialImage: product?.image ?? '',
    // Текст в поле «Ссылка на изображение» (у загруженного с устройства фото ссылки нет).
    imageUrl: isLink(product?.image ?? '') ? product.image : '',
    inStock: product?.inStock ?? true,
    isVisible: product?.isVisible ?? true,
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const busy = saving || processingPhoto;

  const clearError = (name) => {
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    setSubmitError(null);
  };

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    clearError(name);
  };

  const setImage = (image, imageUrl = '') => {
    setValues((current) => ({ ...current, image, imageUrl }));
    clearError('imageUrl');
  };

  const handleChange = (event) => setValue(event.target.name, event.target.value);

  // Фото с устройства сжимается и хранится прямо в документе товара.
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setProcessingPhoto(true);
    try {
      const image = await compressImage(file);
      if (image.length > PRODUCT_IMAGE_MAX_LENGTH) {
        setErrors((current) => ({ ...current, imageUrl: { key: `${ERRORS}.imageTooLarge` } }));
      } else {
        setImage(image);
      }
    } catch {
      setErrors((current) => ({ ...current, imageUrl: { key: `${ERRORS}.imageReadFailed` } }));
    } finally {
      setProcessingPhoto(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    const firstInvalid = FIELDS.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    const title = values.title.trim();
    const description = values.description.trim();
    const image = values.image.trim();
    const data = {
      // Если текст не меняли, оставляем ключ перевода — товар останется на трёх языках.
      name: product && title === text(product.name) ? product.name : title,
      description:
        product && description === text(product.description) ? product.description : description,
      category: values.category,
      color: values.color,
      price: Math.round(Number(values.price)),
      oldPrice: values.oldPrice ? Math.round(Number(values.oldPrice)) : null,
      isHit: values.isHit,
      isNew: values.isNew,
      inStock: values.inStock,
      isVisible: values.isVisible,
    };
    // Фото записывается, только если его меняли: вместе с ним сбрасывается кадрирование
    // прежней фотографии.
    if (!product || image !== values.initialImage) data.image = image;

    setSaving(true);
    setSubmitError(null);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      setSaving(false);
      setSubmitError(
        error?.code === 'permission-denied'
          ? `${ERRORS}.productDenied`
          : `${ERRORS}.productSaveFailed`,
      );
    }
  };

  // Пока идёт запрос, окно не закрывается: иначе результат остался бы без ответа.
  const close = () => {
    if (!saving) onClose();
  };

  const options = (group, ids) =>
    ids.map((id) => ({ value: id, label: t(`catalog.${group}.${id}`) }));

  return (
    <Modal
      title={t(product ? 'admin.products.form.editTitle' : 'admin.products.form.addTitle')}
      size="lg"
      onClose={close}
    >
      <form ref={formRef} className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-modal__body admin-form__grid">
          <div className="admin-photo">
            <span className="field__label">{t('admin.products.form.photo')}</span>
            <div className="admin-photo__preview">
              {values.image ? (
                <img src={values.image} alt="" />
              ) : (
                <span className="admin-photo__empty">
                  <FlowerIcon size={40} />
                  <span>{t('admin.products.form.noPhoto')}</span>
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handleFile}
            />
            <div className="admin-photo__actions">
              <button
                type="button"
                className="admin-action"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                {processingPhoto ? (
                  <LoaderCircle size={17} className="spinner" aria-hidden="true" />
                ) : (
                  <ImagePlus size={17} aria-hidden="true" />
                )}
                {t(
                  values.image
                    ? 'admin.products.form.replacePhoto'
                    : 'admin.products.form.uploadPhoto',
                )}
              </button>
              {values.image && (
                <button
                  type="button"
                  className="admin-action admin-action--danger"
                  disabled={busy}
                  onClick={() => setImage('')}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  {t('admin.products.form.removePhoto')}
                </button>
              )}
            </div>
            <p className="admin-photo__hint">{t('admin.products.form.photoHint')}</p>
            <FormField
              id="product-image-url"
              name="imageUrl"
              label={t('admin.products.form.imageUrl')}
              placeholder="https://"
              hint={t('admin.products.form.imageUrlHint')}
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              required={false}
              value={values.imageUrl}
              error={errors.imageUrl}
              onChange={(event) => setImage(event.target.value.trim(), event.target.value)}
            />
          </div>

          <div className="admin-form__fields">
            <FormField
              id="product-title"
              name="title"
              label={t('admin.products.form.name')}
              placeholder={t('admin.products.form.namePlaceholder')}
              type="text"
              maxLength={PRODUCT_NAME_MAX}
              value={values.title}
              error={errors.title}
              onChange={handleChange}
            />
            <FormField
              id="product-description"
              name="description"
              label={t('admin.products.form.description')}
              placeholder={t('admin.products.form.descriptionPlaceholder')}
              value={values.description}
              error={errors.description}
              onChange={handleChange}
              required={false}
              multiline
              rows={3}
            />
            <div className="admin-form__row">
              <SelectField
                id="product-category"
                name="category"
                label={t('admin.products.form.category')}
                options={options('categories', PRODUCT_CATEGORIES)}
                value={values.category}
                onChange={handleChange}
              />
              <SelectField
                id="product-color"
                name="color"
                label={t('admin.products.form.color')}
                options={options('colors', PRODUCT_COLORS)}
                value={values.color}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form__row">
              <FormField
                id="product-price"
                name="price"
                label={t('admin.products.form.price')}
                placeholder="0"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={values.price}
                error={errors.price}
                onChange={handleChange}
              />
              <FormField
                id="product-old-price"
                name="oldPrice"
                label={t('admin.products.form.oldPrice')}
                hint={t('admin.products.form.oldPriceHint')}
                placeholder="—"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                required={false}
                value={values.oldPrice}
                error={errors.oldPrice}
                onChange={handleChange}
              />
            </div>
            {[
              ['isHit', 'admin.products.form.isHit'],
              ['isNew', 'admin.products.form.isNew'],
            ].map(([name, label]) => (
              <label key={name} className="admin-switch">
                <input
                  type="checkbox"
                  role="switch"
                  className="admin-switch__input"
                  checked={values[name]}
                  onChange={(event) => setValue(name, event.target.checked)}
                />
                <span className="admin-switch__track" aria-hidden="true" />
                <span>{t(label)}</span>
              </label>
            ))}
            <label className="admin-switch">
              <input
                type="checkbox"
                role="switch"
                className="admin-switch__input"
                checked={values.inStock}
                onChange={(event) => setValue('inStock', event.target.checked)}
              />
              <span className="admin-switch__track" aria-hidden="true" />
              <span>{t('admin.products.form.inStock')}</span>
            </label>
            <label className="admin-switch">
              <input
                type="checkbox"
                role="switch"
                className="admin-switch__input"
                checked={values.isVisible}
                onChange={(event) => setValue('isVisible', event.target.checked)}
              />
              <span className="admin-switch__track" aria-hidden="true" />
              <span>{t('admin.products.form.isVisible')}</span>
            </label>
            {submitError && (
              <p className="field__error" role="alert">
                {t(submitError)}
              </p>
            )}
          </div>
        </div>

        <div className="admin-modal__footer">
          <Button variant="secondary" size="sm" disabled={saving} onClick={close}>
            {t('admin.common.cancel')}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={busy}
            aria-busy={saving}
            icon={saving ? <LoaderCircle size={18} className="spinner" /> : <Check size={18} />}
          >
            {t(saving ? 'admin.common.saving' : 'admin.common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

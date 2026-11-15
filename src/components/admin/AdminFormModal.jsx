import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderCircle, UserPlus } from 'lucide-react';
import Button from '../Button.jsx';
import FormField from '../FormField.jsx';
import Modal from './Modal.jsx';
import {
  ADMIN_ERROR_EXISTS,
  ADMIN_NAME_MAX,
  isValidAdminEmail,
  isValidAdminUid,
} from '../../services/admins';

const ERRORS = 'admin.errors';
const FIELDS = ['uid', 'name', 'email'];

function validate(values) {
  const errors = {};
  const uid = values.uid.trim();
  const name = values.name.trim();
  const email = values.email.trim();

  if (!uid) errors.uid = { key: `${ERRORS}.adminUidRequired` };
  else if (!isValidAdminUid(uid)) errors.uid = { key: `${ERRORS}.adminUidInvalid` };

  if (!name) errors.name = { key: `${ERRORS}.adminNameRequired` };
  else if (name.length > ADMIN_NAME_MAX) {
    errors.name = { key: `${ERRORS}.adminNameTooLong`, params: { max: ADMIN_NAME_MAX } };
  }

  if (!email) errors.email = { key: `${ERRORS}.adminEmailRequired` };
  else if (!isValidAdminEmail(email)) errors.email = { key: `${ERRORS}.adminEmailInvalid` };

  return errors;
}

/*
 * Форма «Добавить администратора». onSave(values) возвращает Promise: пока он
 * выполняется, окно остаётся открытым, а при ошибке показывает её и даёт исправить данные.
 */
export default function AdminFormModal({ onSave, onClose }) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const [values, setValues] = useState({ uid: '', name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    setSubmitError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    const firstInvalid = FIELDS.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await onSave({
        uid: values.uid.trim(),
        name: values.name.trim(),
        email: values.email.trim(),
      });
      onClose();
    } catch (error) {
      setSaving(false);
      if (error?.code === ADMIN_ERROR_EXISTS) {
        setErrors({ uid: { key: `${ERRORS}.adminExists` } });
        formRef.current?.elements.uid?.focus();
      } else {
        setSubmitError(
          error?.code === 'permission-denied'
            ? `${ERRORS}.adminDenied`
            : `${ERRORS}.adminSaveFailed`,
        );
      }
    }
  };

  // Пока идёт запрос, окно не закрывается: иначе результат остался бы без ответа.
  const close = () => {
    if (!saving) onClose();
  };

  return (
    <Modal title={t('admin.admins.form.title')} onClose={close}>
      <form ref={formRef} className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-modal__body admin-form__fields">
          <FormField
            id="admin-uid"
            name="uid"
            label={t('admin.admins.form.uid')}
            placeholder={t('admin.admins.form.uidPlaceholder')}
            hint={t('admin.admins.form.uidHint')}
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={values.uid}
            error={errors.uid}
            onChange={handleChange}
          />
          <FormField
            id="admin-name"
            name="name"
            label={t('admin.admins.form.name')}
            placeholder={t('admin.admins.form.namePlaceholder')}
            type="text"
            autoComplete="off"
            maxLength={ADMIN_NAME_MAX}
            value={values.name}
            error={errors.name}
            onChange={handleChange}
          />
          <FormField
            id="admin-email"
            name="email"
            label={t('admin.admins.form.email')}
            placeholder={t('admin.admins.form.emailPlaceholder')}
            type="email"
            inputMode="email"
            autoComplete="off"
            value={values.email}
            error={errors.email}
            onChange={handleChange}
          />
          {submitError && (
            <p className="field__error" role="alert">
              {t(submitError)}
            </p>
          )}
        </div>

        <div className="admin-modal__footer">
          <Button variant="secondary" size="sm" icon={null} disabled={saving} onClick={close}>
            {t('admin.common.cancel')}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            icon={
              saving ? <LoaderCircle size={18} className="spinner" /> : <UserPlus size={18} />
            }
          >
            {t(saving ? 'admin.admins.form.submitting' : 'admin.admins.form.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

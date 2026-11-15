import { useTranslation } from 'react-i18next';

// Поле формы с подписью, необязательной подсказкой (hint) и сообщением об ошибке рядом с полем.
export default function FormField({
  id,
  name,
  label,
  error,
  hint,
  multiline = false,
  required = true,
  ...inputProps
}) {
  const { t } = useTranslation();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ');
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="field__required" aria-hidden="true">
              *
            </span>
            <span className="visually-hidden"> ({t('contact.form.required')})</span>
          </>
        )}
      </label>
      <Control
        id={id}
        name={name}
        className="field__control"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        aria-required={required}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {t(error.key, error.params)}
        </p>
      )}
    </div>
  );
}

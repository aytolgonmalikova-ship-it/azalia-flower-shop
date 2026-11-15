import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/*
 * Модальное окно на нативном <dialog>: браузер сам удерживает фокус внутри
 * и закрывает окно по Escape. Клик по затемнению тоже закрывает окно.
 */
export default function Modal({ title, onClose, size = 'md', children }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.classList.add('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`admin-modal admin-modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="admin-modal__inner">
        <header className="admin-modal__header">
          <h2 id={titleId} className="admin-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label={t('admin.common.close')}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

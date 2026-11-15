import { useTranslation } from 'react-i18next';
import { Check, Trash2 } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from './Modal.jsx';

// Подтверждение действия. danger — для удаления.
export default function ConfirmDialog({
  title,
  text,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation();

  return (
    <Modal title={title} size="sm" onClose={onClose}>
      <div className="admin-modal__body">
        <p className="admin-modal__text">{text}</p>
      </div>
      <div className="admin-modal__footer">
        <Button variant="secondary" size="sm" icon={null} onClick={onClose}>
          {t('admin.common.cancel')}
        </Button>
        <Button
          size="sm"
          className={danger ? 'btn--danger' : ''}
          icon={danger ? <Trash2 size={17} /> : <Check size={18} />}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel ?? t('admin.common.delete')}
        </Button>
      </div>
    </Modal>
  );
}

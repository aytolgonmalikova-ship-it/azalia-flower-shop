import { CircleAlert, Flower2 } from 'lucide-react';
import Button from './Button.jsx';

// Блок для состояний «ошибка» и «нет данных».
export default function StatusMessage({ type = 'empty', title, text, actionLabel, onAction }) {
  const Icon = type === 'error' ? CircleAlert : Flower2;

  return (
    <div
      className={`status-message status-message--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className="status-message__icon" aria-hidden="true">
        <Icon size={28} />
      </span>
      <h3 className="status-message__title">{title}</h3>
      {text && <p className="status-message__text">{text}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

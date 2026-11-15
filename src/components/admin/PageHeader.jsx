import FlowerIcon from '../FlowerIcon.jsx';

// Заголовок раздела админ-панели с местом для основной кнопки.
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="admin-page-header">
      <div>
        {eyebrow && (
          <p className="eyebrow">
            <FlowerIcon size={16} />
            <span>{eyebrow}</span>
          </p>
        )}
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle && <p className="admin-page-header__subtitle">{subtitle}</p>}
      </div>
      {children && <div className="admin-page-header__actions">{children}</div>}
    </div>
  );
}

// Цветная метка статуса заказа, отзыва или наличия товара.
export default function StatusBadge({ tone, children }) {
  return (
    <span className={`admin-badge admin-badge--${tone}`}>
      <span className="admin-badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Карточка статистики на главной странице панели. Ведёт в соответствующий раздел.
export default function StatCard({ to, icon: Icon, label, value, hint }) {
  return (
    <Link to={to} className="admin-stat">
      <span className="admin-stat__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span className="admin-stat__label">{label}</span>
      <span className="admin-stat__value">{value}</span>
      <span className="admin-stat__hint">
        <span>{hint}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

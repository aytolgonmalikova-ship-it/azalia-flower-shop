import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Экран ожидания, пока Firebase проверяет сохранённый вход.
export function AuthChecking() {
  const { t } = useTranslation();

  return (
    <section className="section">
      <div className="container">
        <p className="auth-checking" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('auth.checking')}</span>
        </p>
      </div>
    </section>
  );
}

// Защищённый маршрут: гостя отправляет на форму входа и запоминает, куда он шёл.
export default function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthChecking />;
  if (status === 'signedOut') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

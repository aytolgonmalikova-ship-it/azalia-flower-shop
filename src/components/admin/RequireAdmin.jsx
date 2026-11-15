import { useTranslation } from 'react-i18next';
import { LoaderCircle, LogOut, RefreshCw } from 'lucide-react';
import Button from '../Button.jsx';
import AuthScreen from './AuthScreen.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminLoginPage from '../../pages/admin/AdminLoginPage.jsx';

/*
 * Пропускает в панель только администраторов (главного и обычных).
 * Это защита интерфейса; сами данные защищают правила Firestore (firestore.rules).
 */
export default function RequireAdmin({ children }) {
  const { t } = useTranslation();
  const { status, roleStatus, user, isAdmin, retryRole, signOut } = useAuth();

  if (status === 'signedOut') return <AdminLoginPage />;

  if (status === 'loading' || roleStatus === 'loading') {
    return (
      <AuthScreen title={t('admin.title')}>
        <p className="admin-auth__status" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('admin.auth.checking')}</span>
        </p>
      </AuthScreen>
    );
  }

  const signOutButton = (
    <Button variant="secondary" icon={<LogOut size={18} />} onClick={signOut}>
      {t('admin.auth.signOut')}
    </Button>
  );

  if (roleStatus === 'error') {
    return (
      <AuthScreen title={t('admin.auth.roleErrorTitle')} subtitle={t('admin.auth.roleErrorText')}>
        <Button icon={<RefreshCw size={18} />} onClick={retryRole}>
          {t('admin.common.retry')}
        </Button>
        {signOutButton}
      </AuthScreen>
    );
  }

  if (!isAdmin) {
    return (
      <AuthScreen
        title={t('admin.auth.deniedTitle')}
        subtitle={t('admin.auth.deniedText', { email: user.email })}
      >
        {signOutButton}
      </AuthScreen>
    );
  }

  return children;
}

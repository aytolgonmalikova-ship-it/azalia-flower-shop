import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, Crown, Info, LoaderCircle, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import StatusMessage from '../../components/StatusMessage.jsx';
import AdminFormModal from '../../components/admin/AdminFormModal.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ADMIN_ROLE_MAIN } from '../../data/admin';
import { useAdminFormat } from '../../hooks/useAdminFormat';
import { ADMIN_ERROR_PROTECTED } from '../../services/admins';

// Имя может быть не заполнено, если документ администратора создан вручную в консоли Firebase.
const getTitle = (admin) => admin.name || admin.email || admin.uid;

const getInitials = (title) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

/*
 * Список администраторов из Firestore. Раздел доступен только главному администратору:
 * он добавляет и удаляет администраторов и может передать свои полномочия.
 * Главного администратора и самого себя удалить нельзя (см. также firestore.rules).
 */
export default function AdminAdminsPage() {
  const { t } = useTranslation();
  const { date } = useAdminFormat();
  const { user } = useAuth();
  const {
    admins,
    adminsStatus,
    adminsError,
    reloadAdmins,
    createAdmin,
    deleteAdmin,
    transferMainAdmin,
    notify,
  } = useAdmin();
  const [promoting, setPromoting] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const isLoading = adminsStatus === 'loading' || adminsStatus === 'idle';
  const ownerMissing = admins.some((admin) => admin.role === ADMIN_ROLE_MAIN && !admin.inAdmins);

  const promote = async (admin) => {
    setBusy(true);
    try {
      // После успеха текущий пользователь перестаёт быть главным и раздел закрывается.
      await transferMainAdmin(admin.uid);
      notify(t('admin.admins.toast.mainChanged', { name: getTitle(admin) }));
    } catch {
      notify(t('admin.admins.toast.error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  // Ошибки формы показывает само окно; сюда попадает только успех.
  const add = async (values) => {
    await createAdmin(values);
    notify(t('admin.admins.toast.added', { name: values.name }));
  };

  const remove = async (admin) => {
    setBusy(true);
    try {
      await deleteAdmin(admin.uid);
      notify(t('admin.admins.toast.removed', { name: getTitle(admin) }));
    } catch (error) {
      const key =
        error?.code === 'permission-denied'
          ? 'denied'
          : error?.code === ADMIN_ERROR_PROTECTED
            ? 'protected'
            : 'removeError';
      notify(t(`admin.admins.toast.${key}`), 'error');
    } finally {
      setBusy(false);
    }
  };

  const denied = adminsError === 'denied';

  return (
    <>
      <PageHeader title={t('admin.admins.title')} subtitle={t('admin.admins.subtitle')}>
        <button
          type="button"
          className="admin-action"
          disabled={isLoading || busy}
          onClick={reloadAdmins}
        >
          {isLoading ? (
            <LoaderCircle size={16} className="spinner" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          {t('admin.common.refresh')}
        </button>
        <button
          type="button"
          className="admin-action"
          disabled={adminsStatus !== 'ready' || busy}
          onClick={() => setAdding(true)}
        >
          <UserPlus size={16} aria-hidden="true" />
          {t('admin.admins.add')}
        </button>
      </PageHeader>

      {adminsStatus === 'error' ? (
        <StatusMessage
          type="error"
          title={t(denied ? 'admin.admins.deniedTitle' : 'admin.admins.loadErrorTitle')}
          text={t(denied ? 'admin.admins.deniedText' : 'admin.admins.loadErrorText')}
          actionLabel={t('admin.common.retry')}
          onAction={reloadAdmins}
        />
      ) : isLoading && admins.length === 0 ? (
        <p className="admin-loading" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('admin.common.loading')}</span>
        </p>
      ) : admins.length === 0 ? (
        <StatusMessage
          title={t('admin.admins.emptyTitle')}
          text={t('admin.admins.emptyText')}
          actionLabel={t('admin.admins.add')}
          onAction={() => setAdding(true)}
        />
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t('admin.admins.columns.name')}</th>
                <th scope="col">{t('admin.admins.columns.role')}</th>
                <th scope="col">{t('admin.admins.columns.added')}</th>
                <th scope="col" className="admin-table__actions-head">
                  {t('admin.common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isMain = admin.role === ADMIN_ROLE_MAIN;
                const isSelf = admin.uid === user?.uid;
                const title = getTitle(admin);
                // Для собственной строки email известен из входа, даже если в документе его нет.
                const email = admin.email || (isSelf ? user.email : '');
                return (
                  <tr key={admin.uid}>
                    <td className="admin-table__primary">
                      <div className="admin-person">
                        <span
                          className={`admin-avatar${isMain ? ' admin-avatar--main' : ''}`}
                          aria-hidden="true"
                        >
                          {getInitials(admin.name || email || title)}
                        </span>
                        <div>
                          <span className="admin-strong">
                            {admin.name || email || admin.uid}
                            {isSelf && ` (${t('admin.admins.you')})`}
                          </span>
                          {admin.name && email && (
                            <span className="admin-sub admin-break">{email}</span>
                          )}
                          <span className="admin-sub admin-break">UID: {admin.uid}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label={t('admin.admins.columns.role')}>
                      <StatusBadge tone={isMain ? 'main' : 'neutral'}>
                        {isMain && <Crown size={14} aria-hidden="true" />}
                        {t(`admin.admins.roles.${admin.role}`)}
                      </StatusBadge>
                    </td>
                    <td data-label={t('admin.admins.columns.added')} className="admin-nowrap">
                      {admin.addedAt ? date(admin.addedAt) : '—'}
                    </td>
                    <td className="admin-table__actions">
                      {!isMain && (
                        <button
                          type="button"
                          className="admin-action"
                          disabled={busy || ownerMissing}
                          onClick={() => setPromoting(admin)}
                        >
                          <Crown size={16} aria-hidden="true" />
                          {t('admin.admins.makeMain')}
                        </button>
                      )}
                      {/* Главного администратора и самого себя удалить нельзя. */}
                      {!isMain && !isSelf && (
                        <button
                          type="button"
                          className="admin-action admin-action--danger"
                          disabled={busy}
                          onClick={() => setRemoving(admin)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          {t('admin.admins.remove')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ownerMissing && (
        <p className="admin-hint" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          <span>{t('admin.admins.ownerMissing', { uid: user?.uid })}</span>
        </p>
      )}

      <p className="admin-hint">
        <Info size={16} aria-hidden="true" />
        <span>{t('admin.admins.hint')}</span>
      </p>

      {adding && <AdminFormModal onSave={add} onClose={() => setAdding(false)} />}

      {removing && (
        <ConfirmDialog
          danger
          title={t('admin.admins.removeTitle')}
          text={t('admin.admins.removeText', { name: getTitle(removing) })}
          confirmLabel={t('admin.admins.remove')}
          onConfirm={() => remove(removing)}
          onClose={() => setRemoving(null)}
        />
      )}

      {promoting && (
        <ConfirmDialog
          title={t('admin.admins.makeMainTitle')}
          text={t('admin.admins.makeMainText', { name: getTitle(promoting) })}
          confirmLabel={t('admin.admins.makeMainConfirm')}
          onConfirm={() => promote(promoting)}
          onClose={() => setPromoting(null)}
        />
      )}
    </>
  );
}

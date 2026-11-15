import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_ROLE_MAIN } from '../data/admin';
import { fetchAdminRole } from '../services/admins';
import {
  registerUser,
  signInAdmin,
  signInUser,
  signOutAdmin,
  subscribeToAuth,
} from '../services/auth';
import { reviewsStore } from '../utils/reviewsStore';

/*
 * Состояние входа (Firebase Authentication) и роль пользователя — общее для сайта
 * и админ-панели: провайдер стоит в main.jsx.
 * status: 'loading' — Firebase ещё проверяет сохранённый вход,
 *         'signedOut' — входа нет, 'signedIn' — пользователь вошёл.
 * roleStatus: 'loading' — роль ещё читается из Firestore, 'ready', 'error' — сбой чтения.
 * role: 'main' — главный администратор, 'admin' — администратор,
 *       null — обычный клиент сайта (в панель доступа нет).
 *
 * Роль здесь нужна только интерфейсу; права проверяют правила Firestore.
 */
const AuthContext = createContext(null);

const ROLE_LOADING = { uid: null, status: 'loading', role: null };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });
  const [access, setAccess] = useState(ROLE_LOADING);
  const [attempt, setAttempt] = useState(0);
  const uid = state.user?.uid ?? null;

  useEffect(
    () =>
      subscribeToAuth((user) => {
        if (!user) reviewsStore.clearAll();
        setState({ status: user ? 'signedIn' : 'signedOut', user });
      }),
    [],
  );

  useEffect(() => {
    if (!uid) {
      setAccess(ROLE_LOADING);
      return undefined;
    }
    let cancelled = false;
    setAccess({ uid, status: 'loading', role: null });
    fetchAdminRole(uid).then(
      (role) => {
        if (!cancelled) setAccess({ uid, status: 'ready', role });
      },
      () => {
        if (!cancelled) setAccess({ uid, status: 'error', role: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uid, attempt]);

  // Повторить проверку после сбоя (с экраном загрузки).
  const retryRole = useCallback(() => setAttempt((current) => current + 1), []);

  // Тихо перечитать роль, не закрывая панель: например, после передачи полномочий.
  const refreshRole = useCallback(async () => {
    if (!uid) return;
    const role = await fetchAdminRole(uid);
    setAccess((current) => (current.uid === uid ? { uid, status: 'ready', role } : current));
  }, [uid]);

  // Имя записывается в учётную запись уже после того, как Firebase сообщил о входе,
  // и о смене имени не уведомляет. Обновляем состояние сами, чтобы имя появилось в шапке.
  const register = useCallback(async (values) => {
    try {
      return await registerUser(values);
    } finally {
      setState((current) => ({ ...current }));
    }
  }, []);

  const value = useMemo(() => {
    // Роль от предыдущего пользователя не должна достаться следующему.
    const current = access.uid === uid ? access : ROLE_LOADING;
    return {
      status: state.status,
      user: state.user,
      roleStatus: current.status,
      role: current.role,
      isAdmin: current.role !== null,
      isMainAdmin: current.role === ADMIN_ROLE_MAIN,
      retryRole,
      refreshRole,
      signIn: signInAdmin,
      signOut: signOutAdmin,
      // Клиенты сайта: вход и регистрация вместе с профилем users/{uid}.
      signInUser,
      register,
    };
  }, [state, access, uid, retryRole, refreshRole, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

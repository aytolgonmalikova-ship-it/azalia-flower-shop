import { Navigate, Route, Routes } from 'react-router-dom';
import '../../locales/registerAdmin';
import '../../styles/admin.css';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import RequireAdmin from '../../components/admin/RequireAdmin.jsx';
import { AdminProvider } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminDashboardPage from './AdminDashboardPage.jsx';
import AdminProductsPage from './AdminProductsPage.jsx';
import AdminOrdersPage from './AdminOrdersPage.jsx';
import AdminReviewsPage from './AdminReviewsPage.jsx';
import AdminAdminsPage from './AdminAdminsPage.jsx';

/*
 * Админ-панель (/admin). Загружается отдельным чанком — только когда её открывают,
 * поэтому публичный сайт не становится тяжелее.
 * Внутрь попадают только вошедшие администраторы (RequireAdmin).
 * Состояние входа общее с сайтом: AuthProvider подключён в main.jsx.
 */

// Раздел только для главного администратора; остальных возвращает на главную панели.
function MainAdminOnly({ children }) {
  const { isMainAdmin } = useAuth();
  return isMainAdmin ? children : <Navigate to="/admin" replace />;
}

export default function AdminApp() {
  return (
    <RequireAdmin>
      <AdminProvider>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route
              path="admins"
              element={
                <MainAdminOnly>
                  <AdminAdminsPage />
                </MainAdminOnly>
              }
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AdminProvider>
    </RequireAdmin>
  );
}

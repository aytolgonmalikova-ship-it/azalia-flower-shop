import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CartPage from './pages/CartPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';

// Админ-панель живёт отдельно от публичного сайта и подгружается только по адресу /admin.
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

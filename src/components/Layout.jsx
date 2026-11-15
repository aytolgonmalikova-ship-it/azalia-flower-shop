import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import PetalsBackground from './PetalsBackground.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import BackToTop from './BackToTop.jsx';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="layout">
      <a href="#main" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <ScrollToTop />
      <PetalsBackground />
      <Header />
      <main id="main" className="layout__main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

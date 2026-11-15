import { lazy, Suspense } from 'react';
import Hero from '../sections/Hero.jsx';
import Welcome from '../sections/Welcome.jsx';
import FeaturedProducts from '../sections/FeaturedProducts.jsx';
import ServicesSection from '../sections/ServicesSection.jsx';
import CtaBanner from '../sections/CtaBanner.jsx';

// Раздел отзывов работает с Firestore и стоит ниже первого экрана, поэтому
// подгружается отдельно и не замедляет открытие сайта.
const ReviewsSection = lazy(() => import('../sections/ReviewsSection.jsx'));

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Welcome />
      <ServicesSection />
      <Suspense fallback={null}>
        <ReviewsSection />
      </Suspense>
      <CtaBanner />
    </>
  );
}

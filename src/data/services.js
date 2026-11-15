import festiveBouquet from '../assets/images/bouquet-festive.jpg';
import studioBouquet from '../assets/images/bouquet-studio.jpg';
import bridalBouquet from '../assets/images/bridal-bouquet.jpg';
import ranunculus from '../assets/images/ranunculus.jpg';

// Демонстрационные данные услуг (mock data).
// Названия и описания лежат в файлах переводов: services.items.<id>.
export const SERVICES = [
  { id: 'festive', image: festiveBouquet },
  { id: 'custom', image: studioBouquet },
  { id: 'ribbons', image: bridalBouquet },
  { id: 'choice', image: ranunculus },
];

export const SERVICE_IDS = SERVICES.map((service) => service.id);

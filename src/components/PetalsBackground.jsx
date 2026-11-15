import { useMemo } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

// Лепестков немного: фон должен оставаться спокойным, а анимация — лёгкой для телефонов.
const PETALS_DESKTOP = 15;
const PETALS_MOBILE = 8;

// Три «плана» создают глубину: дальние — мелкие и медленные, ближние — крупные и быстрее.
const LAYERS = [
  { name: 'far', size: [17, 23], duration: [25, 33], swing: [8, 12] },
  { name: 'mid', size: [24, 31], duration: [19, 26], swing: [11, 16] },
  { name: 'near', size: [32, 42], duration: [14, 20], swing: [14, 20] },
];
const TONES = 4;

function random([min, max]) {
  return min + Math.random() * (max - min);
}

function createPetals(count) {
  return Array.from({ length: count }, (_, index) => {
    const layer = LAYERS[index % LAYERS.length];
    const duration = random(layer.duration);
    const direction = Math.random() < 0.5 ? -1 : 1;
    return {
      id: index,
      layer: layer.name,
      // Чередуем оттенки так, чтобы они не совпадали с планами.
      tone: (index * 3 + Math.floor(index / LAYERS.length)) % TONES,
      style: {
        // Равномерно распределяем по ширине, чтобы лепестки не слипались.
        '--petal-left': `${(((index * 7) % count) + random([0.15, 0.85])) * (100 / count)}%`,
        '--petal-size': `${random(layer.size).toFixed(1)}px`,
        '--petal-duration': `${duration.toFixed(1)}s`,
        // Отрицательная задержка — лепестки уже «в полёте» при загрузке.
        '--petal-delay': `${(-random([0, duration])).toFixed(1)}s`,
        '--petal-drift': `${random([-90, 90]).toFixed(0)}px`,
        '--petal-tilt': `${random([-40, 40]).toFixed(0)}deg`,
        '--petal-spin': `${(direction * random([150, 380])).toFixed(0)}deg`,
        '--petal-sway': `${random([3.8, 6.8]).toFixed(1)}s`,
        '--petal-swing': `${random(layer.swing).toFixed(0)}px`,
      },
    };
  });
}

// Нежные лепестки, медленно падающие на фоне страницы.
// Лежат под контентом и не перехватывают клики.
export default function PetalsBackground() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const count = isMobile ? PETALS_MOBILE : PETALS_DESKTOP;
  const petals = useMemo(() => createPetals(count), [count]);

  if (reducedMotion) return null;

  return (
    <div className="petals" aria-hidden="true">
      {petals.map(({ id, style, tone, layer }) => (
        <span key={id} className={`petal petal--${layer}`} style={style}>
          <span className={`petal__shape petal__shape--${tone}`} />
        </span>
      ))}
    </div>
  );
}

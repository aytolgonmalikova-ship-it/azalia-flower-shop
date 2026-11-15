// Маленький пятилепестковый цветок — фирменный декоративный элемент «Азалии».
const PETAL_ANGLES = [0, 72, 144, 216, 288];

export default function FlowerIcon({ className = '', size = 18 }) {
  return (
    <svg
      className={`flower-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="-32 -32 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <g className="flower-icon__petals">
        {PETAL_ANGLES.map((angle) => (
          <path
            key={angle}
            d="M0 0C-10-8-9-23 0-28 9-23 10-8 0 0Z"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle className="flower-icon__core" r="5" />
    </svg>
  );
}

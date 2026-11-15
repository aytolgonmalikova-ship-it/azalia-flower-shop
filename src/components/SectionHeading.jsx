import FlowerIcon from './FlowerIcon.jsx';
import Reveal from './Reveal.jsx';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: TitleTag = 'h2',
  align = 'center',
  id,
}) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      {eyebrow && (
        <p className="eyebrow">
          <FlowerIcon size={16} />
          <span>{eyebrow}</span>
        </p>
      )}
      <TitleTag id={id} className="section-heading__title">
        {title}
      </TitleTag>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </Reveal>
  );
}

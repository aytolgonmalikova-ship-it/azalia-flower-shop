import { Link } from 'react-router-dom';
import FlowerIcon from './FlowerIcon.jsx';

/*
 * Авторская «лепестковая» кнопка: из-под краёв выглядывают лепестки,
 * которые раскрываются при наведении.
 * Рендерится как <Link> (to), <a> (href) или <button>.
 */
export default function Button({
  to,
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className="btn__petal btn__petal--a" aria-hidden="true" />
      <span className="btn__petal btn__petal--b" aria-hidden="true" />
      <span className="btn__petal btn__petal--c" aria-hidden="true" />
      <span className="btn__icon" aria-hidden="true">
        {icon ?? <FlowerIcon size={18} />}
      </span>
      <span className="btn__label">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a href={href} className={classes} {...externalProps} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

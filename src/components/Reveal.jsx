import { useReveal } from '../hooks/useReveal';

// Плавное появление содержимого при прокрутке.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, visible] = useReveal();
  const classes = ['reveal', visible ? 'is-visible' : '', className].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={classes} style={{ '--reveal-delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

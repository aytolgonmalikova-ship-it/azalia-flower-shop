import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/*
 * Горизонтальная лента с прокруткой «по карточкам» (scroll-snap).
 * На телефоне листается пальцем (видно край следующей карточки), на компьютере —
 * ещё и кнопками «назад/вперёд». children — элементы <li>.
 */
export default function Carousel({ label, className = '', children }) {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const count = Children.count(children);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    updateEdges();
    track.addEventListener('scroll', updateEdges, { passive: true });
    const observer = 'ResizeObserver' in window ? new ResizeObserver(updateEdges) : null;
    observer?.observe(track);
    return () => {
      track.removeEventListener('scroll', updateEdges);
      observer?.disconnect();
    };
  }, [updateEdges, count]);

  const scrollByPage = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.9,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const hasOverflow = !(edges.start && edges.end);

  return (
    <div className={`carousel ${className}`.trim()}>
      <ul ref={trackRef} className="carousel__track" aria-label={label}>
        {children}
      </ul>
      {hasOverflow && (
        <div className="carousel__controls">
          <button
            type="button"
            className="carousel__button"
            aria-label={t('common.carouselPrev')}
            disabled={edges.start}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="carousel__button"
            aria-label={t('common.carouselNext')}
            disabled={edges.end}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

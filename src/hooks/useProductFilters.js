import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../data/products';

// Имя параметра адресной строки и допустимые значения для каждой группы фильтров.
const GROUPS = {
  colors: { param: 'color', allowed: PRODUCT_COLORS },
  categories: { param: 'category', allowed: PRODUCT_CATEGORIES },
};

function readGroup(searchParams, { param, allowed }) {
  const selected = (searchParams.get(param) ?? '').split(',');
  // Порядок берём из справочника и отбрасываем неизвестные значения.
  return allowed.filter((value) => selected.includes(value));
}

/*
 * Выбранные фильтры каталога хранятся в адресной строке (/catalog?color=pink,white&category=roses):
 * страница не перезагружается, а ссылкой с подборкой можно поделиться.
 */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();

  const filters = useMemo(() => {
    const params = new URLSearchParams(query);
    return {
      colors: readGroup(params, GROUPS.colors),
      categories: readGroup(params, GROUPS.categories),
    };
  }, [query]);

  const toggle = useCallback(
    (group, value) => {
      const config = GROUPS[group];
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          const selected = readGroup(next, config);
          const updated = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
          if (updated.length > 0) next.set(config.param, updated.join(','));
          else next.delete(config.param);
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.values(GROUPS).forEach(({ param }) => next.delete(param));
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setSearchParams]);

  const activeCount = filters.colors.length + filters.categories.length;

  return { filters, toggle, reset, activeCount };
}

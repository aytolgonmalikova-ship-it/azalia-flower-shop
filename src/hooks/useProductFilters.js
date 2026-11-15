import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SORTS } from '../data/products';

// Имя параметра адресной строки и допустимые значения для каждой группы фильтров.
const GROUPS = {
  colors: { param: 'color', allowed: PRODUCT_COLORS },
  categories: { param: 'category', allowed: PRODUCT_CATEGORIES },
};

const SORT_PARAM = 'sort';
const DEFAULT_SORT = PRODUCT_SORTS[0];

const URL_OPTIONS = { replace: true, preventScrollReset: true };

function readGroup(searchParams, { param, allowed }) {
  const selected = (searchParams.get(param) ?? '').split(',');
  // Порядок берём из справочника и отбрасываем неизвестные значения.
  return allowed.filter((value) => selected.includes(value));
}

function writeGroup(params, { param }, values) {
  if (values.length > 0) params.set(param, values.join(','));
  else params.delete(param);
}

/*
 * Выбранные фильтры и сортировка каталога хранятся в адресной строке
 * (/catalog?category=roses&color=pink,white&sort=priceAsc): страница не перезагружается,
 * а ссылкой с подборкой можно поделиться (её же используют быстрые ссылки на главной).
 */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();

  const { filters, sort } = useMemo(() => {
    const params = new URLSearchParams(query);
    const sortValue = params.get(SORT_PARAM);
    return {
      filters: {
        colors: readGroup(params, GROUPS.colors),
        categories: readGroup(params, GROUPS.categories),
      },
      sort: PRODUCT_SORTS.includes(sortValue) ? sortValue : DEFAULT_SORT,
    };
  }, [query]);

  const update = useCallback(
    (change) =>
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        change(next);
        return next;
      }, URL_OPTIONS),
    [setSearchParams],
  );

  // Отметить или снять одно значение (несколько цветов сразу).
  const toggle = useCallback(
    (group, value) =>
      update((next) => {
        const config = GROUPS[group];
        const selected = readGroup(next, config);
        writeGroup(
          next,
          config,
          selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
        );
      }),
    [update],
  );

  // Вкладки разделов: выбран один раздел или все (category = null).
  const setCategory = useCallback(
    (category) => update((next) => writeGroup(next, GROUPS.categories, category ? [category] : [])),
    [update],
  );

  const setSort = useCallback(
    (value) =>
      update((next) => {
        if (value === DEFAULT_SORT || !PRODUCT_SORTS.includes(value)) next.delete(SORT_PARAM);
        else next.set(SORT_PARAM, value);
      }),
    [update],
  );

  // Сброс фильтров (сортировка остаётся).
  const reset = useCallback(
    () => update((next) => Object.values(GROUPS).forEach(({ param }) => next.delete(param))),
    [update],
  );

  const resetColors = useCallback(
    () => update((next) => next.delete(GROUPS.colors.param)),
    [update],
  );

  const activeCount = filters.colors.length + filters.categories.length;

  return { filters, sort, toggle, setCategory, setSort, reset, resetColors, activeCount };
}

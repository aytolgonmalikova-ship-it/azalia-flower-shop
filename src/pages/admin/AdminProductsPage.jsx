import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatabaseZap, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import Button from '../../components/Button.jsx';
import FlowerIcon from '../../components/FlowerIcon.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ProductFormModal from '../../components/admin/ProductFormModal.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { PRODUCT_CATEGORIES } from '../../data/products';
import { useAdminFormat } from '../../hooks/useAdminFormat';
import { countMissingStarters } from '../../services/products';

const ALL = 'all';

// Быстрое изменение цены прямо в таблице: сохраняется по Enter или при уходе из поля.
function PriceInput({ value, label, disabled, onCommit }) {
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const next = Math.round(Number(draft));
    if (draft && Number.isFinite(next) && next > 0) {
      setDraft(String(next));
      if (next !== value) onCommit(next);
    } else {
      setDraft(String(value));
    }
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min="1"
      step="1"
      className="field__control admin-price-input"
      aria-label={label}
      disabled={disabled}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') setDraft(String(value));
      }}
    />
  );
}

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const { text } = useAdminFormat();
  const {
    products,
    productsStatus,
    productsError,
    reloadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    seedProducts,
    notify,
  } = useAdmin();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  // form: null — закрыта, { product: null } — новый товар, { product } — редактирование.
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  // id товаров, по которым сейчас идёт запрос к Firestore.
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [seeding, setSeeding] = useState(false);
  // Не все товары стартового каталога записались: кнопка загрузки остаётся для повтора.
  const [seedIncomplete, setSeedIncomplete] = useState(false);
  // Меняется после неудачного сохранения цены, чтобы поле вернуло прежнее значение.
  const [priceResets, setPriceResets] = useState(0);
  const isLoading = productsStatus === 'loading' || productsStatus === 'idle';
  const denied = productsError === 'denied';

  const search = query.trim().toLowerCase();
  const visible = products.filter(
    (product) =>
      (category === ALL || product.category === category) &&
      (!search || text(product.name).toLowerCase().includes(search)),
  );

  const notifyError = (error) =>
    notify(
      t(
        error?.code === 'permission-denied'
          ? 'admin.products.toast.denied'
          : 'admin.products.toast.error',
      ),
      'error',
    );

  // Быстрые действия из таблицы: на время запроса строка блокируется.
  // Возвращает true, если изменение записано в Firestore.
  const run = async (id, action, successMessage) => {
    setBusyIds((current) => new Set(current).add(id));
    try {
      await action();
      notify(successMessage);
      return true;
    } catch (error) {
      notifyError(error);
      return false;
    } finally {
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  // Ошибки формы показывает само окно; сюда попадает только успех.
  const handleSave = async (data) => {
    if (form.product) {
      await updateProduct(form.product.id, data);
      notify(t('admin.products.toast.updated'));
    } else {
      await addProduct(data);
      notify(t('admin.products.toast.added'));
    }
  };

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const count = await seedProducts();
      setSeedIncomplete(false);
      notify(t('admin.products.toast.seeded', { count }));
    } catch (error) {
      setSeedIncomplete(true);
      notify(
        t(
          error?.code === 'permission-denied'
            ? 'admin.products.toast.denied'
            : 'admin.products.toast.seedError',
        ),
        'error',
      );
    } finally {
      setSeeding(false);
    }
  };

  const isEmpty = productsStatus === 'ready' && products.length === 0;
  // Кнопка видна, пока в Firestore нет части стартового каталога (например, новых позиций).
  const missingStarters = productsStatus === 'ready' ? countMissingStarters(products) : 0;
  const canSeed = productsStatus === 'ready' && (missingStarters > 0 || seedIncomplete);

  const resetFilters = () => {
    setQuery('');
    setCategory(ALL);
  };

  return (
    <>
      <PageHeader title={t('admin.products.title')} subtitle={t('admin.products.subtitle')}>
        <button
          type="button"
          className="admin-action"
          disabled={isLoading || seeding}
          onClick={reloadProducts}
        >
          {isLoading ? (
            <LoaderCircle size={16} className="spinner" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          {t('admin.common.refresh')}
        </button>
        {canSeed && (
          <button type="button" className="admin-action" disabled={seeding} onClick={handleSeed}>
            {seeding ? (
              <LoaderCircle size={16} className="spinner" aria-hidden="true" />
            ) : (
              <DatabaseZap size={16} aria-hidden="true" />
            )}
            {seeding
              ? t('admin.products.seeding')
              : products.length === 0
                ? t('admin.products.seed')
                : t('admin.products.seedMissing', { count: missingStarters })}
          </button>
        )}
        <Button
          size="sm"
          icon={<Plus size={18} />}
          disabled={productsStatus !== 'ready'}
          onClick={() => setForm({ product: null })}
        >
          {t('admin.products.add')}
        </Button>
      </PageHeader>

      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="visually-hidden">{t('admin.products.searchLabel')}</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            className="field__control admin-control"
            placeholder={t('admin.products.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="field__control admin-control admin-select"
          aria-label={t('admin.products.categoryFilter')}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value={ALL}>{t('admin.products.allCategories')}</option>
          {PRODUCT_CATEGORIES.map((id) => (
            <option key={id} value={id}>
              {t(`catalog.categories.${id}`)}
            </option>
          ))}
        </select>
        <p className="admin-toolbar__count" aria-live="polite">
          {visible.length} / {products.length}
        </p>
      </div>

      {productsStatus === 'error' ? (
        <StatusMessage
          type="error"
          title={t(denied ? 'admin.products.deniedTitle' : 'admin.products.loadErrorTitle')}
          text={t(denied ? 'admin.products.deniedText' : 'admin.products.loadErrorText')}
          actionLabel={t('admin.common.retry')}
          onAction={reloadProducts}
        />
      ) : isLoading && products.length === 0 ? (
        <p className="admin-loading" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('admin.common.loading')}</span>
        </p>
      ) : isEmpty ? (
        <StatusMessage
          title={t('admin.products.seedTitle')}
          text={t('admin.products.seedText')}
          actionLabel={t(seeding ? 'admin.products.seeding' : 'admin.products.seed')}
          onAction={handleSeed}
        />
      ) : visible.length === 0 ? (
        <StatusMessage
          title={t('admin.products.emptyTitle')}
          text={t('admin.products.emptyText')}
          actionLabel={search || category !== ALL ? t('catalog.filters.reset') : undefined}
          onAction={resetFilters}
        />
      ) : (
        <div className="admin-panel">
          <table className="admin-table admin-table--products">
            <thead>
              <tr>
                <th scope="col">{t('admin.products.columns.name')}</th>
                <th scope="col">{t('admin.products.columns.category')}</th>
                <th scope="col">{t('admin.products.columns.price')}</th>
                <th scope="col">{t('admin.products.columns.stock')}</th>
                <th scope="col" className="admin-table__actions-head">
                  {t('admin.common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const name = text(product.name);
                const busy = busyIds.has(product.id);
                return (
                  <tr key={product.id}>
                    <td className="admin-table__primary">
                      <div className="admin-product">
                        {product.image ? (
                          <img
                            className="admin-product__thumb"
                            src={product.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width="56"
                            height="56"
                            style={
                              product.imagePosition
                                ? { objectPosition: product.imagePosition }
                                : undefined
                            }
                          />
                        ) : (
                          <span className="admin-product__thumb admin-product__thumb--empty">
                            <FlowerIcon size={26} />
                          </span>
                        )}
                        <div>
                          <span className="admin-strong">{name}</span>
                          <span className="admin-sub">
                            <span
                              className={`color-dot color-dot--${product.color}`}
                              aria-hidden="true"
                            />
                            {t(`catalog.colors.${product.color}`)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label={t('admin.products.columns.category')}>
                      {t(`catalog.categories.${product.category}`)}
                    </td>
                    <td data-label={t('admin.products.columns.price')}>
                      <PriceInput
                        key={`${product.price}-${priceResets}`}
                        value={product.price}
                        label={t('admin.products.priceLabel', { name })}
                        disabled={busy}
                        onCommit={async (price) => {
                          const saved = await run(
                            product.id,
                            () => updateProduct(product.id, { price }),
                            t('admin.products.toast.priceUpdated'),
                          );
                          if (!saved) setPriceResets((current) => current + 1);
                        }}
                      />
                    </td>
                    <td
                      data-label={t('admin.products.columns.stock')}
                      className="admin-table__switches"
                    >
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          role="switch"
                          className="admin-switch__input"
                          checked={product.inStock}
                          disabled={busy}
                          aria-label={t('admin.products.stockLabel', { name })}
                          onChange={(event) => {
                            const inStock = event.target.checked;
                            run(
                              product.id,
                              () => updateProduct(product.id, { inStock }),
                              t(
                                inStock
                                  ? 'admin.products.toast.inStock'
                                  : 'admin.products.toast.outOfStock',
                              ),
                            );
                          }}
                        />
                        <span className="admin-switch__track" aria-hidden="true" />
                        <span className="admin-switch__text">
                          {t(product.inStock ? 'admin.products.inStock' : 'admin.products.outOfStock')}
                        </span>
                      </label>
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          role="switch"
                          className="admin-switch__input"
                          checked={product.isVisible}
                          disabled={busy}
                          aria-label={t('admin.products.visibilityLabel', { name })}
                          onChange={(event) => {
                            const isVisible = event.target.checked;
                            run(
                              product.id,
                              () => updateProduct(product.id, { isVisible }),
                              t(
                                isVisible
                                  ? 'admin.products.toast.shown'
                                  : 'admin.products.toast.hidden',
                              ),
                            );
                          }}
                        />
                        <span className="admin-switch__track" aria-hidden="true" />
                        <span className="admin-switch__text">
                          {t(product.isVisible ? 'admin.products.visible' : 'admin.products.hidden')}
                        </span>
                      </label>
                    </td>
                    <td className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        aria-label={t('admin.products.editLabel', { name })}
                        title={t('admin.common.edit')}
                        disabled={busy}
                        onClick={() => setForm({ product })}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        aria-label={t('admin.products.deleteLabel', { name })}
                        title={t('admin.common.delete')}
                        disabled={busy}
                        onClick={() => setDeleting(product)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <ProductFormModal product={form.product} onSave={handleSave} onClose={() => setForm(null)} />
      )}

      {deleting && (
        <ConfirmDialog
          danger
          title={t('admin.products.deleteTitle')}
          text={t('admin.products.deleteText', { name: text(deleting.name) })}
          onConfirm={() =>
            run(deleting.id, () => deleteProduct(deleting.id), t('admin.products.toast.deleted'))
          }
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

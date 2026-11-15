import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { productText } from '../data/products';

// Сумма считается по позициям заказа: это то, что администратор видит в составе.
export function getOrderTotal(order) {
  return order.items.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
}

export function getOrderItemsCount(order) {
  return order.items.reduce((sum, { quantity }) => sum + quantity, 0);
}

// Форматирование для админ-панели: цены, даты и названия товаров на языке интерфейса.
export function useAdminFormat() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    const numberFormat = new Intl.NumberFormat(language);
    const dateFormat = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const dateTimeFormat = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      // Товары из каталога хранят ключ перевода, добавленные в панели — обычный текст.
      text: (value) => productText(t, value),
      price: (value) => t('catalog.price', { price: numberFormat.format(value) }),
      // Даты может не быть: например, у документа, созданного вручную в консоли.
      date: (iso) => (iso ? dateFormat.format(new Date(iso)) : '—'),
      dateTime: (iso) => (iso ? dateTimeFormat.format(new Date(iso)) : '—'),
    };
  }, [t, language]);
}

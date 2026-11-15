// Безопасная обёртка над localStorage: в приватном режиме или при запрете
// хранилища сайт продолжит работать, просто без сохранения настроек.
export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* хранилище недоступно — пропускаем */
  }
}

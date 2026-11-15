/*
 * Администраторы панели (Firestore).
 *
 *  - admins/{uid} — документ есть, значит пользователь администратор.
 *    Поля: name, email, addedAt. У документов, созданных вручную в консоли, их может не быть.
 *  - adminConfig/primary — поле ownerUid: UID главного администратора.
 *
 * Главный администратор добавляет и удаляет администраторов прямо из панели и может
 * передать свои полномочия. Кто что может, решают правила Firestore (firestore.rules
 * в корне проекта); проверки здесь нужны лишь для понятных сообщений в интерфейсе.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import { ADMIN_ROLE_ADMIN, ADMIN_ROLE_MAIN } from '../data/admin';
import { db } from './firebase';

const ADMINS = 'admins';
const primaryRef = () => doc(db, 'adminConfig', 'primary');

const isDenied = (result) =>
  result.status === 'rejected' && result.reason?.code === 'permission-denied';

// Роль вошедшего пользователя: 'main', 'admin' или null (не администратор).
export async function fetchAdminRole(uid) {
  const results = await Promise.allSettled([getDoc(doc(db, ADMINS, uid)), getDoc(primaryRef())]);
  // Отказ правил — ожидаемый ответ для не администратора. Остальное — сбой (например, сеть).
  const failure = results.find((result) => result.status === 'rejected' && !isDenied(result));
  if (failure) throw failure.reason;

  const [own, primary] = results;
  if (primary.status === 'fulfilled' && primary.value.data()?.ownerUid === uid) {
    return ADMIN_ROLE_MAIN;
  }
  if (own.status === 'fulfilled' && own.value.exists()) return ADMIN_ROLE_ADMIN;
  return null;
}

function toIsoDate(value) {
  const date = value?.toDate?.() ?? (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

// Список администраторов. Запрос проходит только у главного администратора.
// inAdmins: false — у главного нет документа в admins (его нужно добавить).
export async function fetchAdmins() {
  const [snapshot, primary] = await Promise.all([
    getDocs(collection(db, ADMINS)),
    getDoc(primaryRef()),
  ]);
  const ownerUid = primary.data()?.ownerUid ?? null;

  const admins = snapshot.docs.map((entry) => {
    const { name, email, addedAt } = entry.data();
    return {
      uid: entry.id,
      name: asText(name),
      email: asText(email),
      addedAt: toIsoDate(addedAt),
      role: entry.id === ownerUid ? ADMIN_ROLE_MAIN : ADMIN_ROLE_ADMIN,
      inAdmins: true,
    };
  });

  if (ownerUid && !admins.some((admin) => admin.uid === ownerUid)) {
    admins.push({
      uid: ownerUid,
      name: '',
      email: '',
      addedAt: null,
      role: ADMIN_ROLE_MAIN,
      inAdmins: false,
    });
  }

  const label = (admin) => admin.name || admin.email || admin.uid;
  return admins.sort(
    (a, b) =>
      Number(b.role === ADMIN_ROLE_MAIN) - Number(a.role === ADMIN_ROLE_MAIN) ||
      label(a).localeCompare(label(b)),
  );
}

// Передать полномочия главного администратора. Правила пропустят запрос только
// от текущего главного и только если у нового главного есть документ в admins.
export const transferOwnership = (uid) => updateDoc(primaryRef(), { ownerUid: uid });

// Коды собственных ошибок сервиса (рядом с кодами Firestore вроде 'permission-denied').
export const ADMIN_ERROR_EXISTS = 'admin/already-exists';
export const ADMIN_ERROR_PROTECTED = 'admin/protected';
export const ADMIN_ERROR_INVALID = 'admin/invalid-data';

const adminError = (code) => Object.assign(new Error(code), { code });

// Ограничения те же, что в firestore.rules.
export const ADMIN_NAME_MAX = 60;
export const ADMIN_EMAIL_MAX = 254;
// UID становится ID документа: без пробелов и «/», не длиннее 128 символов (как в Firebase Auth).
export const isValidAdminUid = (uid) => /^[^\s/]{1,128}$/.test(uid) && !/^\.+$/.test(uid);
export const isValidAdminEmail = (email) =>
  email.length <= ADMIN_EMAIL_MAX && /^[^\s@]+@[^\s@]+$/.test(email);

// Добавить администратора: документ admins/{uid} с полями name, email, addedAt.
// uid — UID пользователя из Firebase Authentication. Существует ли такой пользователь,
// из браузера проверить нельзя: при опечатке в UID доступ просто никому не достанется.
export async function addAdmin({ uid, name, email }) {
  const data = { uid: asText(uid), name: asText(name), email: asText(email) };
  if (
    !isValidAdminUid(data.uid) ||
    !data.name ||
    data.name.length > ADMIN_NAME_MAX ||
    !isValidAdminEmail(data.email)
  ) {
    throw adminError(ADMIN_ERROR_INVALID);
  }

  const ref = doc(db, ADMINS, data.uid);
  // setDoc перезаписал бы существующий документ (и дату добавления), поэтому сначала проверяем.
  if ((await getDoc(ref)).exists()) throw adminError(ADMIN_ERROR_EXISTS);

  await setDoc(ref, { name: data.name, email: data.email, addedAt: serverTimestamp() });
}

// Удалить администратора. Главного администратора и самого себя удалить нельзя
// (то же самое запрещают правила Firestore).
export async function removeAdmin(uid, currentUid) {
  if (uid === currentUid) throw adminError(ADMIN_ERROR_PROTECTED);
  const primary = await getDoc(primaryRef());
  if (primary.data()?.ownerUid === uid) throw adminError(ADMIN_ERROR_PROTECTED);

  await deleteDoc(doc(db, ADMINS, uid));
}

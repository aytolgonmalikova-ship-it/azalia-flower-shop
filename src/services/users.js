/*
 * Профили пользователей сайта (Firestore, коллекция users).
 *
 * users/{uid}: uid, name, email, phone (необязательно), createdAt.
 * Профиль создаётся при регистрации (и при первом входе, если его ещё нет).
 * По этой коллекции главный администратор видит зарегистрированных пользователей
 * и может взять UID, чтобы выдать права администратора (документ admins/{uid}).
 *
 * Права проверяют правила Firestore (firestore.rules): пользователь читает и пишет
 * только свой документ, а email в нём обязан совпадать с email учётной записи.
 */
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { db } from './firebase';

const userRef = (uid) => doc(db, 'users', uid);

// Создать профиль нового пользователя. user — пользователь Firebase Authentication.
export function createUserProfile(user, { name, phone } = {}) {
  const profile = {
    uid: user.uid,
    name: (name ?? user.displayName ?? '').trim(),
    email: user.email,
    createdAt: serverTimestamp(),
  };
  const phoneText = phone?.trim();
  if (phoneText) profile.phone = phoneText;
  return setDoc(userRef(user.uid), profile);
}

// Создать профиль, если его ещё нет: например, учётная запись заведена в консоли Firebase.
export async function ensureUserProfile(user) {
  const snapshot = await getDoc(userRef(user.uid));
  if (!snapshot.exists()) await createUserProfile(user);
}

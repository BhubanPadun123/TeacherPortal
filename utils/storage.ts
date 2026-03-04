import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Read the persisted `auth` entry in a safe, cross-platform way.
 * Returns the raw JSON string or null.
 */
export async function getPersistedAuth(): Promise<string | null> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      return (globalThis as any).localStorage.getItem('auth');
    }

    return await SecureStore.getItemAsync('auth');
  } catch (e) {
    // non-fatal; return null to indicate missing/invalid
    // eslint-disable-next-line no-console
    console.warn('getPersistedAuth failed', e);
    return null;
  }
}

export async function setPersistedAuth(payload: string): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.setItem('auth', payload);
      return;
    }

    await SecureStore.setItemAsync('auth', payload);
  } catch (e) {
    // non-fatal
    // eslint-disable-next-line no-console
    console.warn('setPersistedAuth failed', e);
  }
}

export async function removePersistedAuth(): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.removeItem('auth');
      return;
    }

    await SecureStore.deleteItemAsync('auth');
  } catch (e) {
    // non-fatal
    // eslint-disable-next-line no-console
    console.warn('removePersistedAuth failed', e);
  }
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Read the auth token from storage (web localStorage or native SecureStore).
 * Falls back to the legacy `auth` payload if present.
 */
export async function getStoredAuthToken(): Promise<string | null> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      const raw = (globalThis as any).localStorage.getItem(AUTH_TOKEN_KEY);
      if (raw) return raw.replace(/^"|"$/g, '');
    } else {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) return token.replace(/^"|"$/g, '');
    }

    // legacy fallback
    const legacy = await getPersistedAuth();
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return parsed?.token ?? null;
    }
  } catch (e) {
    console.warn('getStoredAuthToken failed', e);
  }
  return null;
}

export async function setStoredAuthToken(token: string): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.setItem(AUTH_TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.warn('setStoredAuthToken failed', e);
  }
}

export async function removeStoredAuthToken(): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (e) {
    console.warn('removeStoredAuthToken failed', e);
  }
}

/**
 * Read user data from storage (web localStorage or native SecureStore).
 * Falls back to legacy `auth` payload.
 */
export async function getStoredUserData<T = any>(): Promise<T | null> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      const raw = (globalThis as any).localStorage.getItem(USER_DATA_KEY);
      if (raw) return JSON.parse(raw);
    } else {
      const raw = await SecureStore.getItemAsync(USER_DATA_KEY);
      if (raw) return JSON.parse(raw);
    }

    const legacy = await getPersistedAuth();
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return (parsed?.user_data ?? parsed?.user_data ?? null) as T | null;
    }
  } catch (e) {
    console.warn('getStoredUserData failed', e);
  }
  return null;
}

export async function setStoredUserData(data: any): Promise<void> {
  try {
    const payload = JSON.stringify(data);
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.setItem(USER_DATA_KEY, payload);
      return;
    }

    await SecureStore.setItemAsync(USER_DATA_KEY, payload);
  } catch (e) {
    console.warn('setStoredUserData failed', e);
  }
}

export async function removeStoredUserData(): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.removeItem(USER_DATA_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (e) {
    console.warn('removeStoredUserData failed', e);
  }
}

/**
 * Safely read a value from localStorage on web (returns null if unavailable).
 */
export function getLocalStorageItem(key: string): string | null {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      return (globalThis as any).localStorage.getItem(key);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('getLocalStorageItem failed', e);
  }
  return null;
}

/**
 * Safely store a value in localStorage on web (no-op on native).
 */
export function setLocalStorageItem(key: string, value: string): void {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.setItem(key, value);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('setLocalStorageItem failed', e);
  }
}

/**
 * Safely remove a value from localStorage on web (no-op on native).
 */
export function removeLocalStorageItem(key: string): void {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.removeItem(key);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('removeLocalStorageItem failed', e);
  }
}

export default {
  getPersistedAuth,
  setPersistedAuth,
  removePersistedAuth,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  getStoredAuthToken,
  setStoredAuthToken,
  removeStoredAuthToken,
  getStoredUserData,
  setStoredUserData,
  removeStoredUserData,
};

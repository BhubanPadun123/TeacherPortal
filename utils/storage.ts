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

export default {
  getPersistedAuth,
  setPersistedAuth,
  removePersistedAuth,
};

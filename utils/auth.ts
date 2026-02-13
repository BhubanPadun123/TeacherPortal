import { clearAuth } from '@/store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Safely remove persisted auth across platforms.
 */
export async function clearPersistedAuth(): Promise<void> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as any).localStorage !== 'undefined'
    ) {
      (globalThis as any).localStorage.removeItem('auth');
    } else {
      await SecureStore.deleteItemAsync('auth');
    }
  } catch (e) {
    // non-fatal — log for debugging
    // eslint-disable-next-line no-console
    console.warn('clearPersistedAuth: failed to clear persisted auth', e);
  }
}

/**
 * Convenience function to perform a logout: clear persisted auth, clear redux state
 * (if dispatch provided) and navigate to login (if router provided).
 */
export async function performLogout(
  dispatch?: any,
  // router from expo-router has a polymorphic replace signature; accept any to be flexible
  router?: any,
): Promise<void> {
  await clearPersistedAuth();

  try {
    if (dispatch) dispatch(clearAuth());
  } catch (e) {
    // ignore
  }

  try {
    if (router && typeof router.replace === 'function') {
      router.replace('/login');
    }
  } catch (e) {
    // ignore
  }
}

export default {
  clearPersistedAuth,
  performLogout,
};

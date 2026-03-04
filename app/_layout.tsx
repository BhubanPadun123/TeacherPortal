import { getStoredAuthToken, getStoredUserData } from '@/utils/storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  function AuthLoader() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const token = await getStoredAuthToken();
          const user = await getStoredUserData();

          if (!mounted) return;

          if (token && user) {
            dispatch(setAuth({ token, user }));
            // stay on current route (let app continue)
          } else {
            // no token/user -> go to login
            router.replace('/login');
          }
        } catch (e) {
          // on error, send to login
          try {
            router.replace('/login');
          } catch {}
        } finally {
          if (mounted) setLoaded(true);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [dispatch, router]);

    // Render nothing; this just performs the check. We could show a splash/loading.
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}

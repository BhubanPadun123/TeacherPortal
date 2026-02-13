import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useUserLoginMutation } from '@/store/services/api'
import { setAuth } from '@/store/slices/authSlice'
import { performLogout } from '@/utils/auth'
import { setPersistedAuth } from '@/utils/storage'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const auth = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userLogin, { isLoading }] = useUserLoginMutation()

  const validate = () => {
    setError(null);
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

    if (!emailRe.test(email.trim())) {
      setError('Please enter a valid email address.')
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return false
    }

    return true
  }

  const onSignIn = async () => {
    if (!validate()) return;

    setError(null);

    try {
      const result = await userLogin({
        email: email.trim(),
        password,
      }).unwrap()

      // normalize user data
      const user = (result as any).user ?? (result as any).user_data ?? null;

      if (!result?.token || !user) {
        setError('Invalid login response from server.');
        return;
      }

      // check allowed user types if available
      try {
        const meta = user.meta_data ?? user.meta ?? null;
        const user_type = meta?.user_type ?? null;
        if (user_type && !['admin', 'teacher', 'owner'].includes(user_type)) {
          setError('You are not allowed to access the teacher portal.');
          return;
        }
      } catch (e) {
        // ignore
      }

      // save to redux
      dispatch(setAuth({ token: result.token, user }));

      // persist auth for rehydration (store token + user_data to match older code)
      const payloadToStore = { token: result.token, user_data: user };
      try {
        await setPersistedAuth(JSON.stringify(payloadToStore));
      } catch (e) {
        // non-fatal; continue
        console.warn('Failed to persist auth', e);
      }

      // finally navigate into app
      router.replace('/');

    } catch (err: any) {
      console.log(err)
      const msg =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Login failed';
      setError(String(msg));
    }
  }

  const onLogout = async () => {
    try {
      await performLogout(dispatch, router)
    } catch (e) {
      console.warn('Logout failed', e)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <FontAwesome name="user-circle" size={54} color="#0a84ff" />

        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Teacher Portal
        </ThemedText>

        <View style={styles.form}>
          {/* Email */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            importantForAutofill="yes"
            textContentType={Platform.select({
              ios: 'username',
              android: 'emailAddress',
            })}
          />

          {/* Password with show/hide */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              importantForAutofill="yes"
              textContentType={Platform.select({
                ios: 'password',
                android: 'password',
              })}
            />

            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome
                name={showPassword ? 'eye' : 'eye-slash'}
                size={18}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                Sign in
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Logout (visible when already signed in) */}
          {auth?.token ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
            >
              <ThemedText style={styles.logoutText}>Log out</ThemedText>
            </TouchableOpacity>
          ) : null}

          {/* Forgot Password */}
          {/* <View style={styles.row}>
            <Link href={'/forgot-password' as any}>
              <Link.Trigger>
                <ThemedText type="link">
                  Forgot password?
                </ThemedText>
              </Link.Trigger>
            </Link>
          </View> */}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#f5f7fb',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 18,
    padding: 22,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    alignItems: 'center',
  },

  title: {
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    marginBottom: 18,
    color: '#777',
    fontSize: 14,
  },

  form: {
    width: '100%',
    gap: 14,
  },

  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: '#e2e5ea',
    fontSize: 15,
  },

  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

  passwordInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 42,
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: '#e2e5ea',
    fontSize: 15,
  },

  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  logoutButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e5ea',
  },

  logoutText: {
    color: '#0a84ff',
    fontWeight: '700',
    fontSize: 14,
  },

  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  error: {
    color: '#d0342c',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
});

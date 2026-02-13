import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

type LoaderProps = {
  message?: string;
  size?: 'small' | 'large' | number;
  fullscreen?: boolean;
};

export default function Loader({ message, size = 'large', fullscreen = false }: LoaderProps) {
  return (
    <ThemedView style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size as any} />
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height:"100%",
    width:"100%",
    position:"absolute",
    zIndex:999
  },
  fullscreen: {
    flex: 1,
  },
  message: {
    marginTop: 10,
    color: '#666',
  },
});

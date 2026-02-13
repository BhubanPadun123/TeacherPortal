import { Stack } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import { useAppSelector } from '@/store/hooks';
import { useLazyGetClassesQuery } from '@/store/services/api';
import { getPersistedAuth } from '@/utils/storage';
import { Link } from 'expo-router';
import React, { useEffect } from 'react';

export default function ClassesScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const [getClasses, { data: classes, isLoading }] = useLazyGetClassesQuery();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer Redux user (rehydrated), otherwise read from storage
        let userData: any = user ?? null;
        if (!userData) {
          let raw: string | null = null;
          raw = await getPersistedAuth();
          if (!raw) return;
          const parsed = JSON.parse(raw);
          userData = parsed.user_data ?? parsed.user ?? null;
        }

        if (!mounted || !userData) return;
        const meta = userData.meta_data ?? userData.meta ?? null;
        const platformId = meta?.user_platform ?? meta?.platform_id ?? null;
        if (platformId) {
          getClasses({ id: Number(platformId) });
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, getClasses]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'All Classes' }} />

      <ThemedText type="title">All classes</ThemedText>
      <ThemedText style={styles.subtitle}>Select a class to view students and take attendance</ThemedText>

      {isLoading && !((classes as any)?.list && (classes as any).list.length > 0) ? (
        <Loader message="Loading classes…" fullscreen={false} />
      ) : (
        <FlatList
          data={(classes as any)?.list ?? []}
          keyExtractor={(i) => (i.id ?? '').toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <Link href={("/class-students/" + item.id) as any} asChild>
                <TouchableOpacity style={styles.card}>
                  <ThemedText type="defaultSemiBold">{item.class_name ?? item.name}</ThemedText>
                  <ThemedText style={styles.smallText}>{(item.meta_data?.subjects?.length ?? 0) > 0 ? `${item.meta_data.subjects.length} subjects` : ''}</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          )}
          ListEmptyComponent={<ThemedText style={styles.subtitle}>{isLoading ? 'Loading…' : 'No classes available'}</ThemedText>}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  subtitle: { color: '#666', marginBottom: 12 },
  cardWrap: { flex: 1 / 2, padding: 8 },
  card: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
  },
  smallText: { color: '#666', marginTop: 6 },
});

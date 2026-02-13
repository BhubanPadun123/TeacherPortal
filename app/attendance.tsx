import { useAppSelector } from '@/store/hooks';
import { useLazyGetClassesQuery } from '@/store/services/api';
import { getPersistedAuth } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Example student rosters per class
const CLASS_STUDENTS: Record<string, { id: string; name: string }[]> = {
  'class-101': [
    { id: 's1', name: 'Aiden Carter' },
    { id: 's2', name: 'Bella Nguyen' },
    { id: 's5', name: 'Ethan Brooks' },
  ],
  'class-102': [
    { id: 's3', name: 'Carlos Ruiz' },
    { id: 's4', name: 'Diana Patel' },
    { id: 's6', name: 'Fiona Lee' },
  ],
  'class-103': [
    { id: 's7', name: 'George Kim' },
    { id: 's8', name: 'Hannah Park' },
  ],
  'class-104': [
    { id: 's9', name: 'Isla Romero' },
    { id: 's10', name: 'Jack Wilson' },
  ],
};

// classes will be fetched from the API

export default function AttendanceScreen() {
  const { classId } = useLocalSearchParams();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [getClasses, { data: classesResponse, isLoading }] = useLazyGetClassesQuery();

  // Select students for the requested class; fallback to an empty list
  const students = useMemo(() => CLASS_STUDENTS[String(classId)] ?? [], [classId]);

  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    students.forEach((s) => (map[s.id] = true));
    return map;
  });

  const toggle = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let userData: any = user ?? null;
        if (!userData) {
          let raw: string | null = null;
          raw = await getPersistedAuth();
          if (!raw) return;
          const parsed = JSON.parse(raw);
          userData = parsed
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
      <Stack.Screen options={{ title: `Attendance${classId ? ` — ${String(classId)}` : ''}` }} />

      <ThemedText type="title">Classes</ThemedText>
      <ThemedText style={styles.subtitle}>Tap a class to view students and take attendance</ThemedText>

      <FlatList
        data={(classesResponse?.list ?? []) as any}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrap}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push(("/class-students/" + item.id) as any)}
            >
              <LinearGradient
                colors={["rgba(10,132,255,0.08)", "rgba(10,132,255,0.02)"]}
                style={styles.classCardGradient}
              >
                <ThemedView style={styles.cardInnerRow}>
                  <ThemedView style={styles.cardTextWrap}>
                    <ThemedText type="defaultSemiBold" style={styles.classTitle}>{item.class_name ?? item.name}</ThemedText>
                    <ThemedText style={styles.smallText}>{(item.meta_data?.subjects?.length ?? 0) > 0 ? `${item.meta_data.subjects.length} subjects` : ''}</ThemedText>
                  </ThemedView>

                  <TouchableOpacity style={styles.openButton} onPress={() => router.push(("/class-students/" + item.id) as any)}>
                    <ThemedText style={styles.openText}>Open</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<ThemedText style={styles.subtitle}>{isLoading ? 'Loading classes…' : 'No classes available'}</ThemedText>}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
    alignItems: 'stretch'
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  cardWrap: { width: '48%', padding: 6, alignItems: 'stretch' },
  classCard: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginBottom: 0,
    width: '100%'
  },
  classCardGradient: {
    borderRadius: 10,
    padding: 12,
    minHeight: 96,
    justifyContent: 'center'
  },
  cardInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: 8
  },
  classTitle: {
    fontSize: 18
  },
  openButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  openText: {
    color: '#0666d6',
    fontWeight: '700'
  },
  smallText: {
    color: '#666',
    marginTop: 6,
  }
});

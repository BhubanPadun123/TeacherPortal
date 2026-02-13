import { getPersistedAuth } from '@/utils/storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import { useAppSelector } from '@/store/hooks';
import { useLazyGetClassesQuery } from '@/store/services/api';
import { Link } from 'expo-router';



const QUICK_ACTIONS = [
  { key: 'attendance', label: 'Attendance', href: '/attendance' },
  { key: 'attendanceToday', label: 'Today Attendance Reports', href: '/reports/Day' },
  { key: 'attendanceRange', label: 'Range Wise Attendance Reports', href: '/reports/range' },
  { key: 'attendanceYear', label: 'Full Year Attendance Reports', href: '/reports/year' },
]



export default function HomeScreen() {
  const router = useRouter()
  const [teacherInfo, setTeacherInfo] = useState<string>("")
  const [platform_id, setPlatformInfo] = useState<number>()

  const [getClasses, getClassesState] = useLazyGetClassesQuery()


  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          let raw: any = null;
          raw = await getPersistedAuth()
          if (!mounted) return
          if (!raw) {
            router.replace('/login')
            return
          }
          const parsed = JSON.parse(raw)
          if (typeof parsed === 'object') {
            // backend may return user under `user` or `user_data`
            const user_data = parsed
            if (user_data) {
              // set local state for display/use elsewhere
              const name = `${user_data.firstname ?? user_data.first_name ?? ''} ${user_data.lastname ?? user_data.last_name ?? ''}`.trim();
              if (name) setTeacherInfo(name)

              const meta_data = user_data.meta_data ?? user_data.meta ?? null;
              const platformId = meta_data?.user_platform ?? meta_data?.platform_id ?? null
              if (platformId) {
                setPlatformInfo(Number(platformId))
                getClasses({ id: Number(platformId) })
              }
            }
          }
        } catch (e) {
          router.replace('/login');
        }
      })()

      return () => {
        mounted = false;
      };
    }, [router, getClasses])
  );


  const user = useAppSelector((s) => s.auth.user);
  const displayName = user
    ? `${(user.firstname ?? user.first_name ?? '').toString()} ${(user.lastname ?? user.last_name ?? '').toString()}`.trim()
    : 'Teacher';
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F6FF', dark: '#102027' }}
      headerImage={<Image source={require('@/assets/images/homeIcon.jpg')} style={styles.headerImage} />}
    >
      <ThemedView style={styles.headerRow}>
        <ThemedText type="title">Teacher Portal</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.greetingCard}>
        <ThemedText type="subtitle">Good morning,</ThemedText>
        <ThemedText type="title">{displayName || 'Teacher'}</ThemedText>
        <ThemedText style={styles.smallText}>Here's your day at a glance</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Quick actions</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionsScroll}
        >
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.key} href={a.href as any} asChild>
              <TouchableOpacity style={styles.actionCard}>
                <ThemedText type="defaultSemiBold">{a.label}</ThemedText>
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Your classes</ThemedText>
        <View style={styles.classesGrid}>
          {getClassesState.isLoading ? (
            <Loader message="Loading classes…" />
          ) : (
            (getClassesState.data?.list ?? []).map((c: any) => (
              <View style={styles.cardWrap} key={(c.id ?? '').toString()}>
                <TouchableOpacity
                  style={styles.classCard}
                  activeOpacity={0.9}
                  onPress={() => router.push(("/class-students/" + c.id) as any)}
                >
                  <ThemedText type="defaultSemiBold" style={{
                    textAlign: "center",
                    fontSize: 24,
                    color: "#aa8c8cff",
                    padding: 4
                  }}>{c?.class_name}</ThemedText>
                  <TouchableOpacity style={styles.openButton} onPress={() => router.push(("/class-students/" + c.id) as any)}>
                    <ThemedText type="defaultSemiBold" >Open</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ThemedView>

      {/* <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Recent announcements</ThemedText>
        <ThemedView style={styles.announcementCard}>
          <ThemedText type="defaultSemiBold">Welcome back — schedule updates</ThemedText>
          <ThemedText style={styles.smallText}>Check the calendar for updated school events.</ThemedText>
          <Link href={'/announcements' as any}>
            <Link.Trigger>
              <ThemedText type="link">View all</ThemedText>
            </Link.Trigger>
          </Link>
        </ThemedView>
      </ThemedView> */}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.18,
  },
  greetingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  smallText: {
    color: '#666',
    marginTop: 6,
  },
  section: {
    marginBottom: 12,
  },
  actionsRow: {
    // kept for fallback, scrolling is the primary layout
    flexDirection: 'row',
    marginTop: 8,
  },
  actionsScroll: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  actionCard: {
    width: 140,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginRight: 12,
  },
  openButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48%',
    padding: 2,
    backgroundColor: "pink",
    borderRadius: 10
  },
  classCard: {
    width: '100%',
    padding: 1,
    marginBottom: 2
  },
  upcomingCard: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  announcementCard: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.03)'
  }
});

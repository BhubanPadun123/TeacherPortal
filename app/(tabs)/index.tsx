import { getPersistedAuth } from '@/utils/storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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

// Animated class card component for individual cards
function ClassCard({ c, idx, onOpen }: { c: any; idx: number; onOpen: () => void }) {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay: idx * 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [idx, opacity, scale]);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.975, friction: 7, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
  };

  const colors = [
    `rgba(${40 + (idx * 12) % 120}, ${120 + (idx * 10) % 80}, ${200 - (idx * 6) % 120}, 0.16)`,
    `rgba(${30 + (idx * 10) % 120}, ${90 + (idx * 8) % 100}, ${180 - (idx * 4) % 120}, 0.06)`,
  ];

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }], opacity }]}> 
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onOpen}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <LinearGradient colors={colors} style={styles.classCardGradient}>
          <View style={styles.classCardContent}>
            <ThemedText type="defaultSemiBold" style={styles.classTitle}>{c?.class_name}</ThemedText>
          </View>
          <View style={styles.cardFooterRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.openButton} onPress={onOpen}>
              <ThemedText type="defaultSemiBold" style={styles.openText}>Open</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}



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
        <ThemedText type="title" style={styles.displayName}>{displayName || 'Teacher'}</ThemedText>
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
            (getClassesState.data?.list ?? []).map((c: any, idx: number) => (
              <ClassCard key={(c.id ?? '').toString()} c={c} idx={idx} onOpen={() => router.push(("/class-students/" + c.id) as any)} />
            ))
          )}
        </View>
      </ThemedView>
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
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(10,132,255,0.04)'
  },
  greetingLeft: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  greetingRight: {
    flex: 1,
  },
  greetingName: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 20,
  },
  displayName: {
    marginTop: 2,
    fontSize: 20,
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
    minWidth: 160,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 14,
  },
  actionIcon: {
    marginTop: 8,
    color: '#888',
  },
  openButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(10,132,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: {
    color: '#0666d6'
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '100%',
    padding: 6,
    borderRadius: 12,
  },
  classCard: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
    minHeight: 120,
    alignItems: 'center',
  },
  classCardGradient: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  classCardHeader: {
    marginBottom: 8,
  },
  classCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  classTitle: {
    fontSize: 18,
    textAlign: 'center'
  },
  classCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardMeta: {
    color: '#666',
    fontSize: 12
  },
  cardFooterRow: {
    width: '100%',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  todaySection: {
    paddingVertical: 8,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  clockContainer: {
    minWidth: 120,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '700'
  },
  dateText: {
    color: '#666',
    marginTop: 4,
  },
  miniCalendar: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.98)',
    elevation: 2,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  calNav: {
    fontSize: 18,
    color: '#666',
    paddingHorizontal: 6,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDayHeader: {
    width: `${100/7}%`,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  calDay: {
    width: `${100/7}%`,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  calDayText: {
    color: '#333'
  },
  calToday: {
    backgroundColor: 'rgba(10,132,255,0.14)',
    borderRadius: 6,
  },
  calTodayText: {
    color: '#0666d6',
    fontWeight: '700'
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

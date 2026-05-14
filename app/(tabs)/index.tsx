import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { WeekStrip } from '@/components/WeekStrip';
import { StatTile } from '@/components/StatTile';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { useWorkout } from '@/stores/workout';
import { useSettings } from '@/stores/settings';
import { useProfile } from '@/stores/profile';
import { supabase } from '@/lib/supabase';
import { formatVolume } from '@/lib/format';
import { computeStreak, computeWeekDays } from '@/lib/streak';

export default function HomeScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const units = useSettings((s) => s.units);
  const active = useWorkout((s) => s.active);
  const profile = useProfile((s) => s.data);

  const dashboard = useQuery({
    queryKey: ['dashboard', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const [workoutsRes, setsRes, routinesRes] = await Promise.all([
        supabase
          .from('workouts')
          .select('id, name, started_at, finished_at, duration_seconds')
          .gte('started_at', since.toISOString())
          .order('started_at', { ascending: false }),
        supabase
          .from('workout_sets')
          .select('weight, reps, workout_id, exercise_id')
          .gte('created_at', since.toISOString()),
        supabase
          .from('routines')
          .select('id, name, description, color')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);
      const workouts = workoutsRes.data ?? [];
      const sets = setsRes.data ?? [];
      const routines = routinesRes.data ?? [];

      const workoutDates = workouts.map((w) => w.started_at);
      const streak = computeStreak(workoutDates);
      const weekDays = computeWeekDays(workoutDates);

      const totalVolume = sets.reduce((acc, s) => acc + Number(s.weight) * Number(s.reps), 0);
      const totalSets = sets.length;

      return {
        workouts,
        streak,
        weekDays,
        totalVolume,
        totalSets,
        routines,
        lastWorkout: workouts[0] ?? null,
      };
    },
  });

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Pagi';
    if (h < 15) return 'Siang';
    if (h < 19) return 'Sore';
    return 'Malam';
  }, []);

  const displayName = profile.nickname || user?.email?.split('@')[0] || 'Bro';
  const todayDate = new Date();
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() - ((todayDate.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const weekData = weekDates.map((d, i) => ({
    date: d,
    completed: dashboard.data?.weekDays[i]?.active ?? false,
    active: d.toDateString() === todayDate.toDateString(),
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.isFetching}
            onRefresh={() => dashboard.refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <Avatar name={displayName} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.greet, { color: theme.colors.textMuted }]}>{greeting},</Text>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconBtn name="timer" onPress={() => router.push('/timer')} />
            <IconBtn name="settings" onPress={() => router.push('/settings')} />
          </View>
        </View>

        {/* Active workout banner */}
        {active ? (
          <View style={{ paddingHorizontal: 20 }}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeCard}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.pulseRing}>
                  <View style={[styles.pulseDot, { backgroundColor: '#fff' }]} />
                </View>
                <Text style={styles.activeKicker}>WORKOUT BERLANGSUNG</Text>
              </View>
              <Text style={styles.activeName}>{active.name}</Text>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <ActiveStat label="EXERCISES" value={active.exercises.length} />
                <ActiveStat
                  label="SETS"
                  value={active.exercises.reduce((acc, e) => acc + e.sets.length, 0)}
                />
                <ActiveStat
                  label="DONE"
                  value={active.exercises.reduce(
                    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
                    0,
                  )}
                />
              </View>
              <Pressable
                onPress={() => router.push('/workout/active')}
                style={styles.resumeBtn}
              >
                <Icon name="play" size={16} color={theme.colors.primary} />
                <Text style={[styles.resumeText, { color: theme.colors.primary }]}>Lanjutin Workout</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            <LinearGradient
              colors={theme.gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.heroFlame}>🔥</Text>
                <Text style={styles.heroKicker}>HARI INI</Text>
              </View>
              <Text style={styles.heroName}>Push Day · Week 3</Text>
              <Text style={styles.heroSub}>
                Bench, Overhead Press, Tricep · ~45 menit
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Pressable
                  onPress={() => {
                    useWorkout.getState().startEmpty();
                    router.push('/workout/active');
                  }}
                  style={styles.heroBtn}
                >
                  <Icon name="play" size={14} color={theme.colors.primary} />
                  <Text style={[styles.heroBtnText, { color: theme.colors.primary }]}>Mulai</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/(tabs)/coach')}
                  style={styles.heroBtnGhost}
                >
                  <Text style={styles.heroBtnGhostText}>Lihat Plan</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatTile
              variant="primary"
              label="Streak"
              value={dashboard.data?.streak ?? 0}
              unit={dashboard.data?.streak === 1 ? 'hari' : 'hari'}
              icon={<Icon name="flame" size={18} color="#fff" />}
            />
            <StatTile
              label="Minggu Ini"
              value={dashboard.data?.weekDays.filter(Boolean).length ?? 0}
              unit="/ 7"
              icon={<Icon name="calendar" size={16} color={theme.colors.accent} />}
              trendValue={
                profile.daysPerWeek
                  ? `Goal ${profile.daysPerWeek}x`
                  : undefined
              }
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatTile
              label="Sets (30d)"
              value={dashboard.data?.totalSets ?? 0}
              icon={<Icon name="check" size={16} color={theme.colors.success} />}
            />
            <StatTile
              label="Volume (30d)"
              value={formatVolume(dashboard.data?.totalVolume ?? 0, units).split(' ')[0]}
              unit={units === 'imperial' ? 'lb' : 'kg'}
              icon={<Icon name="chart" size={16} color={theme.colors.warning} />}
            />
          </View>
        </View>

        {/* Week Strip */}
        <View style={{ paddingHorizontal: 20 }}>
          <Card padding={16} style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Minggu ini</Text>
              <Badge
                label={`${weekData.filter((d) => d.completed).length} / 7`}
                variant="primary"
                size="sm"
              />
            </View>
            <WeekStrip days={weekData} />
          </Card>
        </View>

        {/* Quick actions */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <SectionHeader title="Quick Actions" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <QuickAction
              icon="play"
              label="Quick Start"
              onPress={() => {
                useWorkout.getState().startEmpty();
                router.push('/workout/active');
              }}
            />
            <QuickAction
              icon="timer"
              label="Timer / HIIT"
              onPress={() => router.push('/timer')}
            />
            <QuickAction
              icon="sparkles"
              label="Coach"
              onPress={() => router.push('/(tabs)/coach')}
            />
          </View>
        </View>

        {/* Routines */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <SectionHeader
            title="Program Lo"
            action={{ label: 'Semua', onPress: () => router.push('/(tabs)/routines') }}
          />
          {!dashboard.data || dashboard.data.routines.length === 0 ? (
            <Card variant="muted" padding={16}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginBottom: 10 }}>
                Belum ada routine. Bikin pertama lo dalam 30 detik.
              </Text>
              <Button
                label="Bikin Routine"
                size="sm"
                onPress={() => router.push('/routines/new')}
                leading={<Icon name="plus" size={14} color="#fff" />}
              />
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {dashboard.data.routines.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => router.push({ pathname: '/routines/[id]', params: { id: r.id } })}
                  style={({ pressed }) => [
                    styles.routineRow,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View style={[styles.routineColor, { backgroundColor: r.color ?? theme.colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14 }}>{r.name}</Text>
                    {r.description ? (
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {r.description}
                      </Text>
                    ) : null}
                  </View>
                  <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Recent workouts */}
        {dashboard.data && dashboard.data.workouts.length > 0 ? (
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            <SectionHeader
              title="Sesi Terakhir"
              action={{ label: 'History', onPress: () => router.push('/(tabs)/progress') }}
            />
            {dashboard.data.workouts.slice(0, 3).map((w) => (
              <Card key={w.id} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.checkIcon, { backgroundColor: theme.colors.successSoft }]}>
                    <Icon name="check" size={16} color={theme.colors.success} strokeWidth={3} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{w.name}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                      {new Date(w.started_at).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                      {' · '}
                      {w.duration_seconds ? `${Math.round(w.duration_seconds / 60)} menit` : 'in progress'}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
                </View>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function IconBtn({ name, onPress }: { name: 'timer' | 'settings'; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconBtn,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Icon name={name} size={18} color={theme.colors.text} />
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: 'play' | 'timer' | 'sparkles';
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.qaCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.qaIcon, { backgroundColor: theme.colors.primarySoft }]}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={[styles.qaLabel, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function ActiveStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  greet: { fontSize: 12, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCard: { padding: 18, borderRadius: 20, gap: 10 },
  pulseRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  activeKicker: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  activeName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  resumeBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  resumeText: { fontSize: 14, fontWeight: '800' },
  heroCard: { padding: 20, borderRadius: 20, gap: 6 },
  heroFlame: { fontSize: 18 },
  heroKicker: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnText: { fontSize: 13, fontWeight: '800' },
  heroBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
  },
  heroBtnGhostText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  qaCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: { fontSize: 12, fontWeight: '700' },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  routineColor: { width: 5, height: 40, borderRadius: 3 },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { useWorkout } from '@/stores/workout';
import { muscleLabel } from '@/lib/format';
import { MUSCLE_COLOR } from '@/lib/muscleColors';
import type { ExerciseRow, RoutineExerciseRow, RoutineRow } from '@/lib/database.types';

interface RoutineDetail {
  routine: RoutineRow;
  items: Array<RoutineExerciseRow & { exercise: ExerciseRow }>;
}

export default function RoutineDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: ['routine', id],
    enabled: !!id,
    queryFn: async (): Promise<RoutineDetail | null> => {
      if (!id) return null;
      const { data: routine, error } = await supabase
        .from('routines')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      const { data: links, error: linkErr } = await supabase
        .from('routine_exercises')
        .select('*, exercise:exercises(*)')
        .eq('routine_id', id)
        .order('position', { ascending: true });
      if (linkErr) throw linkErr;
      return {
        routine: routine as RoutineRow,
        items: (links ?? []) as Array<RoutineExerciseRow & { exercise: ExerciseRow }>,
      };
    },
  });

  function startWorkout() {
    if (!detail.data) return;
    useWorkout.getState().startFromRoutine({
      routineId: detail.data.routine.id,
      routineName: detail.data.routine.name,
      items: detail.data.items,
    });
    router.push('/workout/active');
  }

  function deleteRoutine() {
    if (!detail.data) return;
    Alert.alert('Hapus routine?', `"${detail.data.routine.name}" bakal ilang dari list lo.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('routines').delete().eq('id', id!);
          if (error) {
            Alert.alert('Gagal hapus', error.message);
            return;
          }
          void queryClient.invalidateQueries({ queryKey: ['routines'] });
          void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          router.back();
        },
      },
    ]);
  }

  const routine = detail.data?.routine;
  const items = detail.data?.items ?? [];
  const routineColor = routine?.color ?? theme.colors.primary;
  const totalSets = items.reduce((acc, item) => acc + item.target_sets, 0);
  const avgRest =
    items.length === 0
      ? 0
      : Math.round(items.reduce((acc, item) => acc + item.target_rest_seconds, 0) / items.length);
  const estMinutes = Math.max(
    8,
    Math.round((totalSets * 45 + items.length * avgRest) / 60),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="chevronLeft" size={20} color={theme.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
            ROUTINE
          </Text>
        </View>
        <Pressable
          onPress={deleteRoutine}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="trash" size={18} color={theme.colors.danger} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
      >
        {routine ? (
          <>
            <LinearGradient
              colors={[routineColor, shade(routineColor, -0.25)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>ROUTINE LO</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{routine.name}</Text>
              {routine.description ? (
                <Text style={styles.heroDesc}>{routine.description}</Text>
              ) : null}
              <View style={styles.heroStatsRow}>
                <HeroStat label="LATIHAN" value={String(items.length)} />
                <HeroStat label="TOTAL SET" value={String(totalSets)} />
                <HeroStat label="EST. WAKTU" value={`${estMinutes}m`} />
              </View>
            </LinearGradient>

            <Pressable
              onPress={startWorkout}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startBtn}
              >
                <View style={styles.startIcon}>
                  <Icon name="play" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.startKicker}>SIAP NGEGYM?</Text>
                  <Text style={styles.startLabel}>Mulai Workout</Text>
                </View>
                <Icon name="arrowRight" size={20} color="#fff" />
              </LinearGradient>
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {items.length} Latihan
              </Text>
              <Badge label={`rest ~${avgRest}s`} variant="default" size="sm" />
            </View>

            {items.length === 0 ? (
              <Card padding={24}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Icon name="list" size={28} color={theme.colors.textDim} />
                  <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Kosong nih</Text>
                  <Text
                    style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}
                  >
                    Edit routine ini buat tambahin latihan.
                  </Text>
                </View>
              </Card>
            ) : (
              items.map((item, idx) => {
                const color = MUSCLE_COLOR[item.exercise.primary_muscle] ?? theme.colors.primary;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      router.push({ pathname: '/exercise/[id]', params: { id: item.exercise.id } })
                    }
                  >
                    <Card padding={14}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.idxChip, { backgroundColor: color }]}>
                          <Text style={styles.idxText}>{idx + 1}</Text>
                        </View>
                        <View style={[styles.muscleChip, { backgroundColor: color + '20' }]}>
                          <Icon name="dumbbell" size={18} color={color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>
                            {item.exercise.name}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                            <View style={[styles.miniBadge, { backgroundColor: color + '20' }]}>
                              <Text style={[styles.miniBadgeText, { color }]}>
                                {muscleLabel(item.exercise.primary_muscle)}
                              </Text>
                            </View>
                            <View
                              style={[styles.miniBadge, { backgroundColor: theme.colors.surfaceMuted }]}
                            >
                              <Text
                                style={[styles.miniBadgeText, { color: theme.colors.textMuted }]}
                              >
                                {item.target_sets} × {item.target_reps_min}-{item.target_reps_max}
                              </Text>
                            </View>
                            <View
                              style={[styles.miniBadge, { backgroundColor: theme.colors.surfaceMuted }]}
                            >
                              <Text
                                style={[styles.miniBadgeText, { color: theme.colors.textMuted }]}
                              >
                                rest {item.target_rest_seconds}s
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Icon name="chevronRight" size={16} color={theme.colors.textDim} />
                      </View>
                    </Card>
                  </Pressable>
                );
              })
            )}

            <Button
              label="Edit Routine"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/routines/new')}
              leading={<Icon name="plus" size={14} color={theme.colors.text} />}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={styles.heroStatValue}>{value}</Text>
    </View>
  );
}

// Lighten/darken a hex color by an amount in [-1, 1].
function shade(hex: string, amount: number): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, parseInt(sanitized.slice(0, 2), 16) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, parseInt(sanitized.slice(2, 4), 16) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, parseInt(sanitized.slice(4, 6), 16) + Math.round(255 * amount)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    padding: 20,
    borderRadius: 22,
    gap: 6,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginTop: 2 },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  heroStatValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  startIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  startLabel: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  idxChip: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idxText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  muscleChip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});

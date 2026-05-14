import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Chart } from '@/components/Chart';
import { useTheme } from '@/components/ThemeProvider';
import { useSettings } from '@/stores/settings';
import { supabase } from '@/lib/supabase';
import { muscleLabel, formatWeight, formatVolume } from '@/lib/format';
import { MUSCLE_COLOR } from '@/lib/muscleColors';
import type { ExerciseRow } from '@/lib/database.types';

interface SetHistory {
  reps: number;
  weight: number;
  created_at: string;
}

export default function ExerciseDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const units = useSettings((s) => s.units);

  const exercise = useQuery({
    queryKey: ['exercise', id],
    enabled: !!id,
    queryFn: async (): Promise<ExerciseRow | null> => {
      if (!id) return null;
      const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single();
      if (error) throw error;
      return data as ExerciseRow;
    },
  });

  const history = useQuery({
    queryKey: ['exercise-history', id],
    enabled: !!id,
    queryFn: async (): Promise<SetHistory[]> => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('workout_sets')
        .select('reps, weight, created_at')
        .eq('exercise_id', id)
        .order('created_at', { ascending: true })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as SetHistory[];
    },
  });

  const sets = history.data ?? [];
  const top = sets.reduce<SetHistory | null>(
    (best, s) => (!best || s.weight > best.weight ? s : best),
    null,
  );
  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
  const sessionCount = new Set(
    sets.map((s) => new Date(s.created_at).toISOString().slice(0, 10)),
  ).size;

  const series = sets.map((s) => ({
    x: new Date(s.created_at).toLocaleDateString(),
    y: Number(s.weight) * Number(s.reps),
  }));

  const muscle = exercise.data?.primary_muscle ?? 'full_body';
  const muscleHex = MUSCLE_COLOR[muscle] ?? theme.colors.primary;
  const heroColors = [muscleHex, shade(muscleHex, -0.3)] as const;

  // Tongkrongan instruction fallback if DB has no instructions yet
  const fallbackSteps = [
    'Setup posisi lo dulu — kaki seimbang, core ngunci.',
    'Tarik napas pas bawah, buang napas pas dorong.',
    'Range of motion penuh — jangan setengah-setengah.',
    'Kontrol turunin beban, jangan dijatohin.',
  ];

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
        <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
          LATIHAN
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
      >
        {exercise.data ? (
          <>
            <LinearGradient
              colors={heroColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroIcon}>
                <Icon name="dumbbell" size={36} color="#fff" />
              </View>
              <Text style={styles.heroTitle}>{exercise.data.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {muscleLabel(exercise.data.primary_muscle)}
                  </Text>
                </View>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{muscleLabel(exercise.data.equipment)}</Text>
                </View>
              </View>
            </LinearGradient>

            {exercise.data.secondary_muscles && exercise.data.secondary_muscles.length > 0 ? (
              <Card padding={14}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>
                  OTOT YANG KE-HIT
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <MuscleChip muscle={exercise.data.primary_muscle} primary />
                  {exercise.data.secondary_muscles.map((m) => (
                    <MuscleChip key={m} muscle={m} primary={false} />
                  ))}
                </View>
              </Card>
            ) : null}

            <View style={styles.statRow}>
              <StatBox
                icon="flame"
                color={theme.colors.primary}
                label="PR"
                value={top ? `${formatWeight(top.weight, units)}` : '—'}
                sub={top ? `× ${top.reps} reps` : 'belum ada'}
              />
              <StatBox
                icon="chart"
                color={theme.colors.accent}
                label="VOLUME"
                value={sets.length > 0 ? formatVolume(totalVolume, units) : '—'}
                sub={`${sets.length} set total`}
              />
              <StatBox
                icon="calendar"
                color={theme.colors.success}
                label="SESI"
                value={String(sessionCount)}
                sub={sessionCount === 1 ? 'hari' : 'hari latih'}
              />
            </View>

            {sets.length > 1 ? (
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    Riwayat Volume
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                    {sets.length} set
                  </Text>
                </View>
                <Chart data={series} height={160} />
              </Card>
            ) : null}

            <Card>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Cara Ngelakuin</Text>
              {exercise.data.instructions ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 22 }}>
                  {exercise.data.instructions}
                </Text>
              ) : (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: theme.colors.textDim, fontSize: 12, fontStyle: 'italic' }}>
                    Tips umum buat pemula:
                  </Text>
                  {fallbackSteps.map((step, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', gap: 10 }}>
                      <View
                        style={[
                          styles.stepNum,
                          { backgroundColor: muscleHex + '20' },
                        ]}
                      >
                        <Text style={{ color: muscleHex, fontWeight: '800', fontSize: 11 }}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: 13,
                          lineHeight: 20,
                          flex: 1,
                        }}
                      >
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <Card>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Set Terakhir</Text>
                {sets.length > 0 ? (
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                    {Math.min(10, sets.length)} terakhir
                  </Text>
                ) : null}
              </View>
              {sets.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 16, gap: 8 }}>
                  <Icon name="dumbbell" size={28} color={theme.colors.textDim} />
                  <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 14 }}>
                    Belum ada riwayat
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: 12,
                      textAlign: 'center',
                      maxWidth: 240,
                    }}
                  >
                    Selesain workout pakai latihan ini, set lo bakal muncul di sini.
                  </Text>
                </View>
              ) : (
                sets
                  .slice(-10)
                  .reverse()
                  .map((s, idx) => (
                    <View
                      key={idx}
                      style={[styles.histRow, { borderColor: theme.colors.border }]}
                    >
                      <View>
                        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                          {formatWeight(s.weight, units)} × {s.reps}
                        </Text>
                        <Text
                          style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}
                        >
                          {new Date(s.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.volChip,
                          { backgroundColor: theme.colors.surfaceMuted },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: 11,
                            fontWeight: '800',
                          }}
                        >
                          {formatVolume(s.weight * s.reps, units)}
                        </Text>
                      </View>
                    </View>
                  ))
              )}
            </Card>

            <Button
              label="Tambah ke Routine"
              variant="gradient"
              fullWidth
              onPress={() => router.push('/routines/new')}
              leading={<Icon name="plus" size={14} color="#fff" />}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MuscleChip({ muscle, primary }: { muscle: string; primary: boolean }) {
  const theme = useTheme();
  const color = MUSCLE_COLOR[muscle] ?? theme.colors.primary;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: color + (primary ? '30' : '14'),
        borderWidth: 1,
        borderColor: color + (primary ? '55' : '22'),
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ color: color, fontWeight: '800', fontSize: 11, letterSpacing: 0.3 }}>
        {muscleLabel(muscle)}
      </Text>
      {primary ? (
        <Text style={{ color: color, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>
          UTAMA
        </Text>
      ) : null}
    </View>
  );
}

function StatBox({
  icon,
  color,
  label,
  value,
  sub,
}: {
  icon: 'flame' | 'chart' | 'calendar';
  color: string;
  label: string;
  value: string;
  sub: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.statBox,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={{ color: theme.colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.colors.textDim, fontSize: 10 }}>{sub}</Text>
    </View>
  );
}

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
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
    gap: 4,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  statRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  volChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

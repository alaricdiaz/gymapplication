import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { supabase } from '@/lib/supabase';
import { Chart } from '@/components/Chart';
import { formatVolume, muscleLabel } from '@/lib/format';
import { MeasurementForm } from '@/components/MeasurementForm';

type Tab = 'volume' | 'measurements' | 'history';

interface VolumePoint {
  date: string;
  total: number;
}

interface HistoryWorkout {
  id: string;
  name: string;
  started_at: string;
  duration_seconds: number | null;
  set_count: number;
  volume: number;
}

export default function ProgressScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const units = useSettings((s) => s.units);
  const [tab, setTab] = useState<Tab>('volume');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const volume = useQuery({
    queryKey: ['progress-volume', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data, error } = await supabase
        .from('workout_sets')
        .select('weight, reps, created_at, exercise_id, exercises(name, primary_muscle)')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = data ?? [];
      const byDay = new Map<string, number>();
      const byMuscle = new Map<string, number>();
      const prMap = new Map<string, { name: string; weight: number; reps: number; date: string }>();
      for (const r of rows) {
        const date = new Date(r.created_at as string);
        const day = date.toISOString().slice(0, 10);
        const vol = Number(r.weight) * Number(r.reps);
        byDay.set(day, (byDay.get(day) ?? 0) + vol);
        const exRel = (r as { exercises?: { name?: string; primary_muscle?: string } | { name?: string; primary_muscle?: string }[] }).exercises;
        const exObj = Array.isArray(exRel) ? exRel[0] : exRel;
        const muscle = exObj?.primary_muscle ?? 'other';
        const name = exObj?.name ?? 'Exercise';
        byMuscle.set(muscle, (byMuscle.get(muscle) ?? 0) + vol);
        const key = r.exercise_id as string;
        const prev = prMap.get(key);
        if (!prev || Number(r.weight) > prev.weight) {
          prMap.set(key, { name, weight: Number(r.weight), reps: Number(r.reps), date: day });
        }
      }
      const points: VolumePoint[] = Array.from(byDay.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, total]) => ({ date, total }));
      const muscleTotals = Array.from(byMuscle.entries())
        .map(([muscle, total]) => ({ muscle, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      const prs = Array.from(prMap.values())
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5);
      return { points, muscleTotals, prs };
    },
  });

  const measurements = useQuery({
    queryKey: ['progress-measurements', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const photos = useQuery({
    queryKey: ['progress-photos', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .order('taken_at', { ascending: false })
        .limit(24);
      if (error) throw error;
      const rows = data ?? [];
      const withUrls = await Promise.all(
        rows.map(async (row) => {
          const { data: signed } = await supabase.storage
            .from('progress-photos')
            .createSignedUrl(row.storage_path, 60 * 60);
          return { ...row, url: signed?.signedUrl ?? null };
        }),
      );
      return withUrls;
    },
  });

  const history = useQuery({
    queryKey: ['progress-history', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<HistoryWorkout[]> => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, name, started_at, duration_seconds, workout_sets(weight, reps)')
        .order('started_at', { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []).map((w) => {
        const sets = (w as { workout_sets?: { weight: number | string; reps: number | string }[] }).workout_sets ?? [];
        const volume = sets.reduce((acc, s) => acc + Number(s.weight) * Number(s.reps), 0);
        return {
          id: w.id,
          name: w.name,
          started_at: w.started_at,
          duration_seconds: w.duration_seconds,
          set_count: sets.length,
          volume,
        };
      });
    },
  });

  const series = useMemo(() => {
    const points = volume.data?.points ?? [];
    if (points.length === 0) return [];
    return points.map((p) => ({ x: p.date.slice(5), y: p.total }));
  }, [volume.data?.points]);

  async function pickPhoto() {
    if (!user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Akses foto dibutuhin', 'Forge butuh izin galeri buat nyimpan progress pic lo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const ext = (asset.uri.split('.').pop() ?? 'jpg').toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(path, blob, { contentType: blob.type || `image/${ext}` });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase
        .from('progress_photos')
        .insert({ user_id: user.id, storage_path: path, taken_at: new Date().toISOString() });
      if (insertError) throw insertError;
      void queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
    } catch (err) {
      Alert.alert('Upload gagal', (err as Error).message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.colors.primary }]}>PROGRES LO</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Progress</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: 'volume', label: 'Volume' },
            { value: 'measurements', label: 'Ukuran' },
            { value: 'history', label: 'History' },
          ]}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 12 }}>
        {tab === 'volume' ? (
          <>
            <Card>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Volume (90 hari terakhir)</Text>
              <Chart data={series} height={180} />
              {series.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, marginTop: 8, fontSize: 13 }}>
                  Selesain beberapa workout dulu, trend lo bakal muncul di sini.
                </Text>
              ) : null}
            </Card>

            <Card>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Otot Top</Text>
              {(volume.data?.muscleTotals ?? []).length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  Belum ada data otot. Latihan dulu yuk biar keliatan distribusinya.
                </Text>
              ) : (
                volume.data!.muscleTotals.map((m) => {
                  const max = volume.data!.muscleTotals[0]?.total ?? 1;
                  const pct = Math.max(0.05, m.total / max);
                  return (
                    <View key={m.muscle} style={{ gap: 6, marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                          {muscleLabel(m.muscle)}
                        </Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                          {formatVolume(m.total, units)}
                        </Text>
                      </View>
                      <View style={[styles.barBg, { backgroundColor: theme.colors.bg }]}>
                        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: theme.colors.primary }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            <Card>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Personal Records</Text>
              {(volume.data?.prs ?? []).length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  Belum ada PR. Angkat berat sekali, list ini bakal kepenuh.
                </Text>
              ) : (
                volume.data!.prs.map((p) => (
                  <View key={p.name + p.date} style={[styles.prRow, { borderColor: theme.colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{p.name}</Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{p.date}</Text>
                    </View>
                    <Text style={{ color: theme.colors.text, fontWeight: '800' }}>
                      {p.weight} × {p.reps}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Foto Progress</Text>
                <Button label="Tambah" variant="secondary" onPress={pickPhoto} leading={<Icon name="camera" size={16} color={theme.colors.text} />} />
              </View>
              {(photos.data ?? []).length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  Foto progress tiap beberapa minggu. Kaca bohong — kamera enggak.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {photos.data!.map((p) =>
                      p.url ? (
                        <View key={p.id} style={styles.photoTile}>
                          <Image source={{ uri: p.url }} style={styles.photo} contentFit="cover" />
                          <Text style={[styles.photoDate, { backgroundColor: theme.colors.overlay }]}>
                            {new Date(p.taken_at).toLocaleDateString()}
                          </Text>
                        </View>
                      ) : null,
                    )}
                  </View>
                </ScrollView>
              )}
            </Card>
          </>
        ) : null}

        {tab === 'measurements' ? (
          <>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Ukuran Terbaru</Text>
                <Button
                  label={showForm ? 'Tutup' : 'Catat'}
                  variant={showForm ? 'secondary' : 'primary'}
                  onPress={() => setShowForm((v) => !v)}
                  leading={<Icon name="ruler" size={16} color={showForm ? theme.colors.text : theme.colors.primaryFg} />}
                />
              </View>
              {showForm ? (
                <MeasurementForm
                  onSaved={() => {
                    setShowForm(false);
                    void queryClient.invalidateQueries({ queryKey: ['progress-measurements'] });
                  }}
                />
              ) : !measurements.data || measurements.data.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  Belum ada ukuran lo. Tap “Catat” buat nyimpen stat lo.
                </Text>
              ) : (
                <View style={{ gap: 6 }}>
                  {Object.entries({
                    weight_kg: 'Berat (kg)',
                    body_fat_pct: 'Body fat %',
                    chest_cm: 'Dada (cm)',
                    waist_cm: 'Pinggang (cm)',
                    hip_cm: 'Pinggul (cm)',
                    arm_cm: 'Lengan (cm)',
                    thigh_cm: 'Paha (cm)',
                  }).map(([k, label]) => {
                    const value = (measurements.data![0] as Record<string, number | string | null | undefined>)[k];
                    if (value == null) return null;
                    return (
                      <View key={k} style={styles.measurementRow}>
                        <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
                        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{String(value)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>

            {measurements.data && measurements.data.length > 1 ? (
              <Card>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Riwayat</Text>
                {measurements.data.slice(1).map((m) => (
                  <View key={m.id} style={[styles.measurementHistRow, { borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                      {new Date(m.measured_at).toLocaleDateString()}
                    </Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                      {m.weight_kg ? `${m.weight_kg}kg` : '—'} · {m.body_fat_pct ? `${m.body_fat_pct}%` : '—'}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}

        {tab === 'history' ? (
          <>
            {!history.data || history.data.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Icon name="calendar" size={36} color={theme.colors.textDim} />}
                  title="Belum ada workout"
                  description="Selesain sesi pertama lo, di sini bakal nongol semua set, rep, dan PR."
                  action={
                    <View style={{ marginTop: 12 }}>
                      <Button label="Mulai Workout" onPress={() => router.push('/workout/active')} />
                    </View>
                  }
                />
              </Card>
            ) : (
              history.data.map((w) => (
                <Card key={w.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{w.name}</Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
                        {new Date(w.started_at).toLocaleString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                        {formatVolume(w.volume, units)}
                      </Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                        {w.set_count} set ·{' '}
                        {w.duration_seconds ? `${Math.round(w.duration_seconds / 60)}m` : '—'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  prRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  photoTile: { width: 120, height: 160, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoDate: { position: 'absolute', bottom: 0, left: 0, right: 0, color: '#fff', fontSize: 11, fontWeight: '600', paddingVertical: 4, paddingHorizontal: 8, textAlign: 'center' },
  measurementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  measurementHistRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
});

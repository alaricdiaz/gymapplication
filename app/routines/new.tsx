import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Stepper } from '@/components/Stepper';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { muscleLabel } from '@/lib/format';
import { MUSCLE_COLOR, MUSCLE_FILTERS } from '@/lib/muscleColors';
import type { ExerciseRow, MuscleGroup } from '@/lib/database.types';

interface BuilderItem {
  exercise: ExerciseRow;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
}

const COLORS = ['#F25A1F', '#0EA5E9', '#10B981', '#A855F7', '#F59E0B', '#EF4444', '#22D3EE'];

export default function NewRoutineScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const exercises = useQuery({
    queryKey: ['exercises-builder'],
    queryFn: async (): Promise<ExerciseRow[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ExerciseRow[];
    },
  });

  const filtered = useMemo(() => {
    const list = exercises.data ?? [];
    return list.filter((e) => {
      if (filter !== 'all' && e.primary_muscle !== filter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!e.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [exercises.data, filter, query]);

  function addItem(ex: ExerciseRow) {
    if (items.find((i) => i.exercise.id === ex.id)) {
      setPicker(false);
      return;
    }
    setItems((prev) => [
      ...prev,
      { exercise: ex, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, targetRestSeconds: 90 },
    ]);
    setPicker(false);
    setQuery('');
  }

  function updateItem(id: string, patch: Partial<BuilderItem>) {
    setItems((prev) => prev.map((i) => (i.exercise.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.exercise.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.exercise.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function save() {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Nama wajib diisi', 'Kasih nama routine lo dulu ya.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Belum ada latihan', 'Tambahin minimal satu latihan biar routine-nya jalan.');
      return;
    }
    setSaving(true);
    const { data: routine, error: routineErr } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        color,
      })
      .select('id')
      .single();
    if (routineErr || !routine) {
      setSaving(false);
      Alert.alert('Gagal nyimpan', routineErr?.message ?? 'Unknown error');
      return;
    }
    const linkPayload = items.map((item, idx) => ({
      routine_id: routine.id,
      exercise_id: item.exercise.id,
      position: idx,
      target_sets: item.targetSets,
      target_reps_min: item.targetRepsMin,
      target_reps_max: item.targetRepsMax,
      target_rest_seconds: item.targetRestSeconds,
    }));
    const { error: linkErr } = await supabase.from('routine_exercises').insert(linkPayload);
    setSaving(false);
    if (linkErr) {
      Alert.alert('Gagal nyimpan latihan', linkErr.message);
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ['routines'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    router.back();
  }

  if (picker) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => setPicker(false)}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Icon name="close" size={18} color={theme.colors.text} />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
              PILIH LATIHAN
            </Text>
            <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>
              Tambah ke routine
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Icon name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              placeholder="Cari latihan..."
              placeholderTextColor={theme.colors.textDim}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={{ flex: 1, color: theme.colors.text, fontSize: 15, padding: 0 }}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Icon name="close" size={16} color={theme.colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={{ marginTop: 12, flexGrow: 0 }}
        >
          {MUSCLE_FILTERS.map((m) => (
            <Pill
              key={m.key}
              label={m.emoji ? `${m.emoji} ${m.label}` : m.label}
              active={filter === m.key}
              onPress={() => setFilter(m.key)}
            />
          ))}
        </ScrollView>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <Card padding={20}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Icon name="search" size={28} color={theme.colors.textDim} />
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>
                  Gak ketemu
                </Text>
                <Text
                  style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}
                >
                  Coba ganti filter atau keyword lain.
                </Text>
              </View>
            </Card>
          ) : (
            filtered.map((ex) => {
              const c = MUSCLE_COLOR[ex.primary_muscle] ?? theme.colors.primary;
              const already = !!items.find((i) => i.exercise.id === ex.id);
              return (
                <Pressable key={ex.id} onPress={() => addItem(ex)}>
                  <Card padding={14}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.muscleChip, { backgroundColor: c + '20' }]}>
                        <Icon name="dumbbell" size={20} color={c} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>
                          {ex.name}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                          <View style={[styles.miniBadge, { backgroundColor: c + '20' }]}>
                            <Text style={[styles.miniBadgeText, { color: c }]}>
                              {muscleLabel(ex.primary_muscle)}
                            </Text>
                          </View>
                          <View
                            style={[styles.miniBadge, { backgroundColor: theme.colors.surfaceMuted }]}
                          >
                            <Text
                              style={[styles.miniBadgeText, { color: theme.colors.textMuted }]}
                            >
                              {muscleLabel(ex.equipment)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.plusChip,
                          { backgroundColor: already ? theme.colors.success + '20' : c + '14' },
                        ]}
                      >
                        <Icon
                          name={already ? 'check' : 'plus'}
                          size={18}
                          color={already ? theme.colors.success : c}
                        />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="close" size={18} color={theme.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
            ROUTINE BARU
          </Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>
            Bikin Split Lo
          </Text>
        </View>
        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [{ opacity: pressed || saving ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveText}>{saving ? '...' : 'Simpan'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[color, shade(color, -0.3)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.preview}
        >
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>PREVIEW</Text>
          </View>
          <Text style={styles.previewName}>{name.trim() || 'Nama routine lo'}</Text>
          {description.trim() ? (
            <Text style={styles.previewDesc} numberOfLines={2}>
              {description.trim()}
            </Text>
          ) : (
            <Text style={[styles.previewDesc, { fontStyle: 'italic' }]}>
              Tambahin deskripsi singkat (opsional)
            </Text>
          )}
          <View style={styles.previewStats}>
            <Text style={styles.previewStat}>{items.length} latihan</Text>
            <Text style={[styles.previewStat, { color: 'rgba(255,255,255,0.7)' }]}>·</Text>
            <Text style={styles.previewStat}>
              {items.reduce((acc, i) => acc + i.targetSets, 0)} set
            </Text>
          </View>
        </LinearGradient>

        <Card style={{ gap: 12 }}>
          <Input label="Nama routine" placeholder="Contoh: Push Day" value={name} onChangeText={setName} />
          <Input
            label="Deskripsi (opsional)"
            placeholder="Fokus: dada + bahu + trisep"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>WARNA</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: c,
                    borderColor: color === c ? theme.colors.text : 'transparent',
                  },
                ]}
              >
                {color === c ? <Icon name="check" size={14} color="#fff" /> : null}
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Latihan ({items.length})
          </Text>
          <Pressable
            onPress={() => setPicker(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addPill}
            >
              <Icon name="plus" size={14} color="#fff" />
              <Text style={styles.addPillText}>Tambah</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {items.length === 0 ? (
          <Card padding={24}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Icon name="list" size={28} color={theme.colors.textDim} />
              <Text style={{ color: theme.colors.text, fontWeight: '800' }}>
                Belum ada latihan
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Tap &quot;Tambah&quot; buat drop latihan pertama lo.
              </Text>
            </View>
          </Card>
        ) : (
          items.map((item, idx) => {
            const c = MUSCLE_COLOR[item.exercise.primary_muscle] ?? theme.colors.primary;
            return (
              <Card key={item.exercise.id} padding={0} style={{ overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 4, backgroundColor: c }} />
                  <View style={{ flex: 1, padding: 14, gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.idxChip, { backgroundColor: c }]}>
                        <Text style={styles.idxText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>
                          {item.exercise.name}
                        </Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>
                          {muscleLabel(item.exercise.primary_muscle)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => move(item.exercise.id, -1)}
                        disabled={idx === 0}
                        style={[
                          styles.miniBtn,
                          {
                            backgroundColor: theme.colors.surfaceMuted,
                            opacity: idx === 0 ? 0.4 : 1,
                          },
                        ]}
                      >
                        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>↑</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => move(item.exercise.id, 1)}
                        disabled={idx === items.length - 1}
                        style={[
                          styles.miniBtn,
                          {
                            backgroundColor: theme.colors.surfaceMuted,
                            opacity: idx === items.length - 1 ? 0.4 : 1,
                          },
                        ]}
                      >
                        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>↓</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeItem(item.exercise.id)}
                        style={[styles.miniBtn, { backgroundColor: theme.colors.dangerSoft }]}
                      >
                        <Icon name="trash" size={14} color={theme.colors.danger} />
                      </Pressable>
                    </View>

                    <View style={styles.fieldGrid}>
                      <FieldStepper
                        label="SET"
                        value={item.targetSets}
                        min={1}
                        max={10}
                        onChange={(v) => updateItem(item.exercise.id, { targetSets: v })}
                      />
                      <FieldStepper
                        label="REP MIN"
                        value={item.targetRepsMin}
                        min={1}
                        max={item.targetRepsMax}
                        onChange={(v) =>
                          updateItem(item.exercise.id, { targetRepsMin: v })
                        }
                      />
                      <FieldStepper
                        label="REP MAX"
                        value={item.targetRepsMax}
                        min={item.targetRepsMin}
                        max={50}
                        onChange={(v) =>
                          updateItem(item.exercise.id, { targetRepsMax: v })
                        }
                      />
                      <FieldStepper
                        label="REST (s)"
                        value={item.targetRestSeconds}
                        step={15}
                        min={15}
                        max={300}
                        onChange={(v) =>
                          updateItem(item.exercise.id, { targetRestSeconds: v })
                        }
                      />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        {items.length > 0 ? (
          <Button
            label="Tambah Latihan Lain"
            variant="secondary"
            fullWidth
            onPress={() => setPicker(true)}
            leading={<Icon name="plus" size={14} color={theme.colors.text} />}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 100, gap: 6 }}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Stepper value={value} min={min} max={max} step={step} onChange={onChange} />
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
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  preview: {
    padding: 18,
    borderRadius: 20,
    gap: 6,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  previewBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  previewName: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginTop: 4 },
  previewDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  previewStats: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  previewStat: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addPillText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  idxChip: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idxText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muscleChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    minHeight: 48,
  },
  filterRow: { gap: 8, paddingHorizontal: 20 },
  plusChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

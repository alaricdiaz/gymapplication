import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { useTheme } from '@/components/ThemeProvider';
import { PlateCalcModal } from '@/components/PlateCalcModal';
import { useWorkout, type ActiveExercise, type ActiveSet, type LastCompletedSet } from '@/stores/workout';
import { useSettings } from '@/stores/settings';
import { supabase } from '@/lib/supabase';
import { muscleLabel, formatDuration } from '@/lib/format';
import { MUSCLE_COLOR, MUSCLE_FILTERS } from '@/lib/muscleColors';
import { generateWarmup, plateHint } from '@/lib/plates';
import type { ExerciseRow, MuscleGroup } from '@/lib/database.types';

interface PlateEditorTarget {
  exerciseId: string;
  setId: string;
  exerciseName: string;
  initialWeight: number;
}

export default function ActiveWorkoutScreen() {
  const theme = useTheme();
  const active = useWorkout((s) => s.active);
  const restRemaining = useWorkout((s) => s.restRemaining);
  const restTotal = useWorkout((s) => s.restTotal);
  const tickRest = useWorkout((s) => s.tickRest);
  const bumpRest = useWorkout((s) => s.bumpRest);
  const cancel = useWorkout((s) => s.cancel);
  const finish = useWorkout((s) => s.finish);
  const addExercise = useWorkout((s) => s.addExercise);
  const updateSet = useWorkout((s) => s.updateSet);
  const lastSets = useWorkout((s) => s.lastSets);
  const queryClient = useQueryClient();

  const [elapsed, setElapsed] = useState(0);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plateTarget, setPlateTarget] = useState<PlateEditorTarget | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = new Date(active.startedAt).getTime();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (restRemaining <= 0) return;
    const id = setInterval(() => {
      tickRest();
    }, 1000);
    return () => clearInterval(id);
  }, [restRemaining, tickRest]);

  useEffect(() => {
    if (restRemaining === 0 && restTotal > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  }, [restRemaining, restTotal]);

  if (!active) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.colors.primary + '1A', borderColor: theme.colors.primary + '33' },
            ]}
          >
            <Icon name="dumbbell" size={36} color={theme.colors.primary} />
          </View>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>
            Belum ada workout aktif
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
            Mulai dari Routine lo atau langsung Quick Start buat freestyle workout.
          </Text>
          <Button
            label="Quick Start"
            variant="gradient"
            onPress={() => useWorkout.getState().startEmpty()}
            leading={<Icon name="play" size={16} color="#fff" />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = active.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const doneSets = active.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0);

  async function onFinish() {
    if (!active) return;
    const completed = active.exercises.flatMap((e) => e.sets).filter((s) => s.completed);
    if (completed.length === 0) {
      Alert.alert('Belum ada set kelar', 'Ceklis minimal satu set dulu sebelum finish ya.');
      return;
    }
    setSaving(true);
    const result = await finish();
    setSaving(false);
    if (result.error) {
      Alert.alert('Gagal nyimpan', result.error);
      return;
    }
    void queryClient.invalidateQueries();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.back();
  }

  function onCancel() {
    Alert.alert('Batalin workout?', 'Semua set yang belum disimpan bakal ilang.', [
      { text: 'Lanjut latihan', style: 'cancel' },
      {
        text: 'Buang',
        style: 'destructive',
        onPress: () => {
          cancel();
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.headerRow}>
        <Pressable
          onPress={onCancel}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="close" size={18} color={theme.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[styles.timer, { color: theme.colors.text }]}>{formatDuration(elapsed)}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
            {active.name.toUpperCase()}
          </Text>
        </View>
        <Pressable
          onPress={onFinish}
          disabled={saving}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={theme.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finishBtn}
          >
            <Icon name="check" size={14} color="#fff" />
            <Text style={styles.finishText}>{saving ? '...' : 'Selesai'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
            PROGRESS
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '800' }}>
            {doneSets} / {totalSets} set
          </Text>
        </View>
        <ProgressBar value={doneSets} total={Math.max(1, totalSets)} variant="primary" size="sm" />
      </View>

      {restRemaining > 0 ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.restBanner}
          >
            <View style={styles.restIcon}>
              <Icon name="timer" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
                ISTIRAHAT
              </Text>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                {formatDuration(restRemaining)}
              </Text>
            </View>
            <View style={styles.restControls}>
              <Pressable
                onPress={() => {
                  bumpRest(-30);
                  Haptics.selectionAsync().catch(() => undefined);
                }}
                style={({ pressed }) => [styles.restBumpBtn, { opacity: pressed ? 0.7 : 1 }]}
                hitSlop={6}
              >
                <Text style={styles.restBumpText}>-30</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  bumpRest(30);
                  Haptics.selectionAsync().catch(() => undefined);
                }}
                style={({ pressed }) => [styles.restBumpBtn, { opacity: pressed ? 0.7 : 1 }]}
                hitSlop={6}
              >
                <Text style={styles.restBumpText}>+30</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  useWorkout.getState().setRest(0);
                  Haptics.selectionAsync().catch(() => undefined);
                }}
                style={({ pressed }) => [styles.restSkipBtn, { opacity: pressed ? 0.7 : 1 }]}
                hitSlop={6}
              >
                <Text style={styles.restSkipText}>Skip</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {active.exercises.length === 0 ? (
          <Card padding={24}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Icon name="dumbbell" size={32} color={theme.colors.textDim} />
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>
                Workout-nya masih kosong
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Tap tombol di bawah buat tambah latihan pertama lo.
              </Text>
            </View>
          </Card>
        ) : null}

        {active.exercises.map((ex, idx) => (
          <ExerciseBlock
            key={ex.exerciseId}
            ex={ex}
            index={idx}
            lastCompleted={lastSets[ex.exerciseId] ?? null}
            onOpenPlateCalc={(target) => setPlateTarget(target)}
          />
        ))}

        <Pressable
          onPress={() => setPicker(true)}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <View
            style={[
              styles.addExerciseBtn,
              { borderColor: theme.colors.primary + '55', backgroundColor: theme.colors.primary + '10' },
            ]}
          >
            <Icon name="plus" size={18} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 14 }}>
              Tambah Latihan
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <ExercisePicker
          onPick={(ex) => {
            addExercise(ex);
            Haptics.selectionAsync().catch(() => undefined);
            setPicker(false);
          }}
          onClose={() => setPicker(false)}
        />
      </Modal>

      <PlateCalcModal
        visible={!!plateTarget}
        initialWeight={plateTarget?.initialWeight ?? 0}
        exerciseName={plateTarget?.exerciseName}
        onClose={() => setPlateTarget(null)}
        onApply={(weight) => {
          if (plateTarget) {
            updateSet(plateTarget.exerciseId, plateTarget.setId, { weight });
          }
          setPlateTarget(null);
        }}
      />
    </SafeAreaView>
  );
}

function ExerciseBlock({
  ex,
  index,
  lastCompleted,
  onOpenPlateCalc,
}: {
  ex: ActiveExercise;
  index: number;
  lastCompleted: LastCompletedSet | null;
  onOpenPlateCalc: (target: PlateEditorTarget) => void;
}) {
  const theme = useTheme();
  const addSet = useWorkout((s) => s.addSet);
  const removeSet = useWorkout((s) => s.removeSet);
  const updateSet = useWorkout((s) => s.updateSet);
  const toggleSet = useWorkout((s) => s.toggleSet);
  const addWarmupSets = useWorkout((s) => s.addWarmupSets);
  const removeExercise = useWorkout((s) => s.removeExercise);
  const warmupScheme = useSettings((s) => s.warmupScheme);
  const plateInventory = useSettings((s) => s.plateInventory);

  const muscleColor = MUSCLE_COLOR[ex.primaryMuscle] ?? theme.colors.primary;
  const completedSets = ex.sets.filter((s) => s.completed).length;
  const allDone = ex.sets.length > 0 && completedSets === ex.sets.length;
  const hasWarmup = ex.sets.some((s) => s.isWarmup);

  function genWarmup() {
    const firstWorking = ex.sets.find((s) => !s.isWarmup);
    const workingKg = firstWorking?.weight && firstWorking.weight > 0 ? firstWorking.weight : lastCompleted?.weight ?? 0;
    if (workingKg <= plateInventory.barKg) {
      Alert.alert(
        'Belum ada beban',
        'Isi beban kerja lo dulu di set utama, baru gw auto-bikin warm-up dari situ.',
      );
      return;
    }
    const warmups = generateWarmup(workingKg, warmupScheme, plateInventory);
    if (!warmups.length) {
      Alert.alert('Gak butuh warm-up', 'Beban kerja lo terlalu deket bar, langsung gas aja.');
      return;
    }
    addWarmupSets(
      ex.exerciseId,
      warmups.map((w) => ({ weight: w.weight, reps: w.reps })),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }

  function confirmRemoveExercise() {
    Alert.alert('Hapus latihan ini?', `${ex.name} bakal dikeluarin dari workout.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeExercise(ex.exerciseId) },
    ]);
  }

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 4, backgroundColor: allDone ? theme.colors.success : muscleColor }} />
        <View style={{ flex: 1, padding: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.muscleChip, { backgroundColor: muscleColor + '20' }]}>
              <Icon name="dumbbell" size={20} color={muscleColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>
                #{index + 1} · {muscleLabel(ex.primaryMuscle).toUpperCase()}
              </Text>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16, marginTop: 2 }}>
                {ex.name}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>
                Target {ex.targetSets} × {ex.targetRepsMin}-{ex.targetRepsMax} · rest {ex.targetRestSeconds}s
              </Text>
            </View>
            <Pressable
              onPress={confirmRemoveExercise}
              hitSlop={8}
              style={[styles.smallIconBtn, { backgroundColor: theme.colors.surfaceMuted }]}
            >
              <Icon name="trash" size={14} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <View
              style={[
                styles.setProgress,
                {
                  backgroundColor: allDone
                    ? theme.colors.successSoft
                    : completedSets > 0
                      ? muscleColor + '14'
                      : theme.colors.surfaceMuted,
                },
              ]}
            >
              <Text
                style={{
                  color: allDone ? theme.colors.success : completedSets > 0 ? muscleColor : theme.colors.textMuted,
                  fontSize: 10,
                  fontWeight: '800',
                  letterSpacing: 0.6,
                }}
              >
                {allDone ? '✓ SEMUA SET KELAR' : `${completedSets} / ${ex.sets.length} SET DONE`}
              </Text>
            </View>
            {lastCompleted ? (
              <View
                style={[
                  styles.setProgress,
                  { backgroundColor: theme.colors.accent + '14' },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontSize: 10,
                    fontWeight: '800',
                    letterSpacing: 0.4,
                  }}
                >
                  SESI LALU · {lastCompleted.weight} KG × {lastCompleted.reps}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.setHeader, { borderColor: theme.colors.border }]}>
            <Text style={[styles.colSet, styles.colHeader, { color: theme.colors.textDim }]}>SET</Text>
            <Text style={[styles.colInput, styles.colHeader, { color: theme.colors.textDim }]}>BEBAN</Text>
            <Text style={[styles.colInput, styles.colHeader, { color: theme.colors.textDim }]}>REPS</Text>
            <View style={styles.colCheck} />
          </View>

          {(() => {
            let workingCounter = 0;
            let warmupCounter = 0;
            return ex.sets.map((set, idx) => {
              const prev = idx > 0 ? ex.sets[idx - 1] : null;
              const ghostWeight =
                set.weight > 0
                  ? null
                  : prev?.weight && prev.weight > 0
                    ? prev.weight
                    : lastCompleted?.weight ?? null;
              const ghostReps =
                set.reps > 0
                  ? null
                  : prev?.reps && prev.reps > 0
                    ? prev.reps
                    : lastCompleted?.reps ?? null;
              const indexLabel = set.isWarmup
                ? `W${++warmupCounter}`
                : String(++workingCounter);
              return (
                <SetRow
                  key={set.id}
                  set={set}
                  indexLabel={indexLabel}
                  muscleColor={muscleColor}
                  targetReps={`${ex.targetRepsMin}-${ex.targetRepsMax}`}
                  ghostWeight={ghostWeight}
                  ghostReps={ghostReps}
                  plateInventory={plateInventory}
                  onChange={(patch) => updateSet(ex.exerciseId, set.id, patch)}
                  onToggle={() => toggleSet(ex.exerciseId, set.id)}
                  onRemove={() => removeSet(ex.exerciseId, set.id)}
                  onOpenPlateCalc={() =>
                    onOpenPlateCalc({
                      exerciseId: ex.exerciseId,
                      setId: set.id,
                      exerciseName: ex.name,
                      initialWeight: set.weight || ghostWeight || 0,
                    })
                  }
                />
              );
            });
          })()}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Pressable
              onPress={() => addSet(ex.exerciseId)}
              style={[styles.addSet, { borderColor: theme.colors.border, flex: 1 }]}
            >
              <Icon name="plus" size={14} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.textMuted, fontWeight: '700', fontSize: 12 }}>Tambah set</Text>
            </Pressable>
            {hasWarmup ? null : (
              <Pressable
                onPress={genWarmup}
                style={[
                  styles.addSet,
                  {
                    borderColor: theme.colors.warning + '88',
                    backgroundColor: theme.colors.warningSoft,
                    borderStyle: 'solid',
                  },
                ]}
              >
                <Icon name="flame" size={14} color={theme.colors.warning} />
                <Text style={{ color: theme.colors.warning, fontWeight: '800', fontSize: 12 }}>
                  Auto warm-up
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

function SetRow({
  set,
  indexLabel,
  muscleColor,
  targetReps,
  ghostWeight,
  ghostReps,
  plateInventory,
  onChange,
  onToggle,
  onRemove,
  onOpenPlateCalc,
}: {
  set: ActiveSet;
  indexLabel: string;
  muscleColor: string;
  targetReps: string;
  ghostWeight: number | null;
  ghostReps: number | null;
  plateInventory: import('@/lib/plates').PlateInventory;
  onChange: (patch: Partial<ActiveSet>) => void;
  onToggle: () => void;
  onRemove: () => void;
  onOpenPlateCalc: () => void;
}) {
  const theme = useTheme();
  const completed = set.completed;
  const isWarmup = set.isWarmup;

  const badgeColor = isWarmup
    ? theme.colors.warning
    : completed
      ? theme.colors.success
      : muscleColor;
  const rowBg = completed
    ? theme.colors.successSoft
    : isWarmup
      ? theme.colors.warningSoft
      : theme.colors.surfaceMuted;
  const rowBorder = completed
    ? theme.colors.success + '55'
    : isWarmup
      ? theme.colors.warning + '55'
      : 'transparent';

  const weightLabel = set.weight > 0 ? `${set.weight}` : '';
  const repsLabel = set.reps > 0 ? `${set.reps}` : '';

  function confirmRemove() {
    Alert.alert(`Hapus set ${indexLabel}?`, 'Set ini bakal dikeluarin.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: onRemove },
    ]);
  }

  const effectiveWeight = set.weight > 0 ? set.weight : ghostWeight ?? 0;
  const plateLine =
    effectiveWeight > plateInventory.barKg ? plateHint(effectiveWeight, plateInventory) : null;

  return (
    <View
      style={[
        styles.setRow,
        {
          backgroundColor: rowBg,
          borderColor: rowBorder,
        },
      ]}
    >
      <Pressable onLongPress={confirmRemove} style={styles.colSet} hitSlop={4}>
        <View
          style={[
            styles.setNumberBadge,
            { backgroundColor: badgeColor },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{indexLabel}</Text>
        </View>
      </Pressable>
      <View style={styles.colInput}>
        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            value={weightLabel}
            keyboardType="decimal-pad"
            placeholder={ghostWeight ? String(ghostWeight) : '0'}
            placeholderTextColor={theme.colors.textDim}
            onChangeText={(t) => onChange({ weight: Number(t.replace(',', '.')) || 0 })}
            style={[
              styles.setInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: completed ? theme.colors.success + '55' : theme.colors.border,
                paddingRight: 26,
              },
            ]}
          />
          <Pressable
            onPress={onOpenPlateCalc}
            hitSlop={8}
            style={({ pressed }) => [
              styles.platePill,
              {
                backgroundColor: theme.colors.primary + '22',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 9 }}>kg</Text>
          </Pressable>
        </View>
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.textDim, fontSize: 9, fontWeight: '700', marginTop: 2 }}
        >
          {plateLine ?? 'kg'}
        </Text>
      </View>
      <View style={styles.colInput}>
        <TextInput
          value={repsLabel}
          keyboardType="number-pad"
          placeholder={ghostReps ? String(ghostReps) : '0'}
          placeholderTextColor={theme.colors.textDim}
          onChangeText={(t) => onChange({ reps: Number(t.replace(',', '.')) || 0 })}
          style={[
            styles.setInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: completed ? theme.colors.success + '55' : theme.colors.border,
            },
          ]}
        />
        <Text style={{ color: theme.colors.textDim, fontSize: 9, fontWeight: '700', marginTop: 2 }}>
          {isWarmup ? 'warm-up' : `target ${targetReps}`}
        </Text>
      </View>
      <Pressable
        onPress={onToggle}
        style={[
          styles.colCheck,
          styles.checkBtn,
          {
            backgroundColor: completed ? theme.colors.success : 'transparent',
            borderColor: completed ? theme.colors.success : theme.colors.border,
          },
        ]}
      >
        <Icon name="check" size={18} color={completed ? '#fff' : theme.colors.textMuted} />
      </Pressable>
    </View>
  );
}

function ExercisePicker({
  onPick,
  onClose,
}: {
  onPick: (ex: ExerciseRow) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');
  const exercises = useQuery({
    queryKey: ['exercises-picker'],
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.headerRow}>
        <Pressable
          onPress={onClose}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="close" size={18} color={theme.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
            TAMBAH LATIHAN
          </Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>
            Pilih dari Library
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
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={theme.colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            style={{
              flex: 1,
              color: theme.colors.text,
              fontSize: 15,
              padding: 0,
            }}
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 8 }}
      >
        {filtered.length === 0 ? (
          <Card padding={20}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={32} color={theme.colors.textDim} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>
                Gak ada yang cocok
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Coba ganti filter atau keyword lain.
              </Text>
            </View>
          </Card>
        ) : (
          filtered.map((ex) => {
            const color = MUSCLE_COLOR[ex.primary_muscle] ?? theme.colors.primary;
            return (
              <Pressable key={ex.id} onPress={() => onPick(ex)}>
                <Card padding={14}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.muscleChip, { backgroundColor: color + '20' }]}>
                      <Icon name="dumbbell" size={20} color={color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>
                        {ex.name}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                        <View style={[styles.muscleBadge, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.muscleBadgeText, { color }]}>
                            {muscleLabel(ex.primary_muscle)}
                          </Text>
                        </View>
                        <View style={[styles.muscleBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                          <Text style={[styles.muscleBadgeText, { color: theme.colors.textMuted }]}>
                            {muscleLabel(ex.equipment)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.plusChip, { backgroundColor: color + '14' }]}>
                      <Icon name="plus" size={18} color={color} />
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
  smallIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  restIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restBumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    minWidth: 38,
    alignItems: 'center',
  },
  restBumpText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  restSkipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  restSkipText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  finishText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  muscleChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  setProgress: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  colHeader: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, textAlign: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  setNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colSet: { width: 36, alignItems: 'center', justifyContent: 'center' },
  colInput: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  colCheck: { width: 48, alignItems: 'center', justifyContent: 'center' },
  setInput: {
    width: '100%',
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  platePill: {
    position: 'absolute',
    right: 4,
    top: 4,
    bottom: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtn: {
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
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
  muscleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  muscleBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  plusChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

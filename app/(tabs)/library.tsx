import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Pill } from '@/components/Pill';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { muscleLabel } from '@/lib/format';
import { MUSCLE_COLOR, MUSCLE_FILTERS } from '@/lib/muscleColors';
import type { ExerciseRow, MuscleGroup } from '@/lib/database.types';

export default function LibraryScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');

  const exercises = useQuery({
    queryKey: ['exercises-library'],
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.colors.primary }]}>EXERCISE LIBRARY</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Latihan</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {exercises.data?.length ?? 0} latihan · Penjelasan B. Indonesia
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Icon name="search" size={18} color={theme.colors.textMuted} />
          <Input
            placeholder="Cari latihan (ex: bench, squat)..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, borderWidth: 0, paddingHorizontal: 0, minHeight: 0, backgroundColor: 'transparent' }}
            containerStyle={{ flex: 1 }}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Pills */}
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
                Gak ada latihan yang cocok
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
                Coba ganti filter atau search keyword lain
              </Text>
            </View>
          </Card>
        ) : (
          filtered.map((ex) => {
            const muscleColor = MUSCLE_COLOR[ex.primary_muscle] ?? theme.colors.primary;
            return (
              <Pressable
                key={ex.id}
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: ex.id } })}
              >
                <Card padding={14}>
                  <View style={styles.exerciseRow}>
                    <View
                      style={[
                        styles.muscleChip,
                        { backgroundColor: muscleColor + '20' },
                      ]}
                    >
                      <Icon name="dumbbell" size={20} color={muscleColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15 }}>
                        {ex.name}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                        <View
                          style={[
                            styles.muscleBadge,
                            { backgroundColor: muscleColor + '20' },
                          ]}
                        >
                          <Text style={[styles.muscleBadgeText, { color: muscleColor }]}>
                            {muscleLabel(ex.primary_muscle)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.muscleBadge,
                            { backgroundColor: theme.colors.surfaceMuted },
                          ]}
                        >
                          <Text style={[styles.muscleBadgeText, { color: theme.colors.textMuted }]}>
                            {muscleLabel(ex.equipment)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 12, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  filterRow: { gap: 8, paddingHorizontal: 20 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  muscleChip: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  muscleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  muscleBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});

import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

interface RoutineWithCount {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  exercise_count: number;
}

export default function RoutinesScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);

  const routines = useQuery({
    queryKey: ['routines', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<RoutineWithCount[]> => {
      const { data, error } = await supabase
        .from('routines')
        .select('id, name, description, color, routine_exercises(id)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => {
        const links = (r as { routine_exercises?: { id: string }[] }).routine_exercises ?? [];
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          color: r.color,
          exercise_count: links.length,
        };
      });
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: theme.colors.primary }]}>PROGRAM LO</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Routines</Text>
        </View>
        <Pressable
          onPress={() => router.push('/routines/new')}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBtn}
          >
            <Icon name="plus" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={routines.isFetching}
            onRefresh={() => routines.refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Active Program Hero */}
        <LinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeProgram}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Badge label="Program Aktif" variant="default" />
          </View>
          <Text style={styles.activeTitle}>Greyskull LP</Text>
          <Text style={styles.activeSub}>Push · Pull · Legs · 3 hari/minggu</Text>
          <View style={styles.activeProgress}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.activeProgressLabel}>WEEK 3 / 12</Text>
              <Text style={styles.activeProgressPct}>25%</Text>
            </View>
            <View style={styles.activeProgressTrack}>
              <View style={[styles.activeProgressFill, { width: '25%' }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Routines */}
        {!routines.data || routines.data.length === 0 ? (
          <Card padding={24}>
            <EmptyState
              icon={<Icon name="list" size={36} color={theme.colors.textDim} />}
              title="Belum ada routine"
              description="Routine itu template workout yang bisa lo pake berulang. Bikin PPL, Upper-Lower, atau custom split lo sendiri."
              action={
                <View style={{ marginTop: 12 }}>
                  <Button
                    label="Bikin Routine Pertama"
                    onPress={() => router.push('/routines/new')}
                    variant="gradient"
                  />
                </View>
              }
            />
          </Card>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
              ROUTINE LO ({routines.data.length})
            </Text>
            {routines.data.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push({ pathname: '/routines/[id]', params: { id: r.id } })}
              >
                <Card padding={16}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={[
                        styles.colorBar,
                        { backgroundColor: r.color ?? theme.colors.primary },
                      ]}
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.routineName, { color: theme.colors.text }]}>{r.name}</Text>
                      {r.description ? (
                        <Text
                          style={{ color: theme.colors.textMuted, fontSize: 12 }}
                          numberOfLines={1}
                        >
                          {r.description}
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Badge
                          label={`${r.exercise_count} latihan`}
                          variant="primary"
                          size="sm"
                        />
                      </View>
                    </View>
                    <Icon name="chevronRight" size={20} color={theme.colors.textDim} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* Discover */}
        <View style={{ marginTop: 16, gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            TEMPLATE POPULER
          </Text>
          <TemplateCard
            emoji="🏋️"
            title="Stronglifts 5x5"
            subtitle="3 hari · Pemula · Full body"
            level="Pemula"
          />
          <TemplateCard
            emoji="💪"
            title="Push Pull Legs"
            subtitle="6 hari · Menengah · Body part split"
            level="Menengah"
          />
          <TemplateCard
            emoji="🔥"
            title="Upper Lower"
            subtitle="4 hari · Pemula-Menengah · 2-day split"
            level="Pemula"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TemplateCard({
  emoji,
  title,
  subtitle,
  level,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  level: string;
}) {
  const theme = useTheme();
  return (
    <Card padding={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.tplEmoji, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.routineName, { color: theme.colors.text }]}>{title}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{subtitle}</Text>
        </View>
        <Badge label={level} variant="accent" size="sm" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProgram: { padding: 20, borderRadius: 20, gap: 6 },
  activeTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  activeSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  activeProgress: { marginTop: 10 },
  activeProgressLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  activeProgressPct: { color: '#fff', fontSize: 12, fontWeight: '800' },
  activeProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  activeProgressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginTop: 8 },
  colorBar: { width: 5, height: 50, borderRadius: 3 },
  routineName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  tplEmoji: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

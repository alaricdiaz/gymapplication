import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ListItem } from '@/components/ListItem';
import { SectionHeader } from '@/components/SectionHeader';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { useProfile } from '@/stores/profile';
import { DEFAULT_WARMUP_SCHEME } from '@/lib/plates';

const PLATE_OPTIONS = [25, 20, 15, 10, 5, 2.5, 1.25];
const BAR_OPTIONS = [15, 20, 25];

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export default function SettingsScreen() {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const units = useSettings((s) => s.units);
  const setUnits = useSettings((s) => s.setUnits);
  const themePref = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const restDefault = useSettings((s) => s.defaultRestSeconds);
  const setRest = useSettings((s) => s.setDefaultRest);
  const plateInventory = useSettings((s) => s.plateInventory);
  const setPlateInventory = useSettings((s) => s.setPlateInventory);
  const resetPlateInventory = useSettings((s) => s.resetPlateInventory);
  const warmupScheme = useSettings((s) => s.warmupScheme);
  const resetWarmupScheme = useSettings((s) => s.resetWarmupScheme);
  const profile = useProfile((s) => s.data);
  const resetProfile = useProfile((s) => s.reset);

  function confirmSignOut() {
    Alert.alert('Yakin keluar?', 'Lo bisa masuk lagi kapan aja.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  function confirmReset() {
    Alert.alert(
      'Reset profile lo?',
      'Semua data onboarding (umur, goal, equipment, dsb) bakal kehapus.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProfile();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />

      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="chevronLeft" size={18} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>Pengaturan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}>
        {/* Profile preview */}
        <Pressable onPress={() => router.push('/profile')}>
          <Card padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={profile.nickname || user?.email || 'F'} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>
                  {profile.nickname || 'Forge User'}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  {user?.email}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Badge label="Lifetime" variant="primary" size="sm" />
                  {profile.onboardingCompleted ? (
                    <Badge label="Setup ✓" variant="success" size="sm" />
                  ) : null}
                </View>
              </View>
              <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
            </View>
          </Card>
        </Pressable>

        {/* Preferences */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Preferensi" />

          <Card padding={16} style={{ gap: 12 }}>
            <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>SATUAN BERAT</Text>
            <SegmentedControl
              value={units}
              onChange={(v) => setUnits(v as 'metric' | 'imperial')}
              options={[
                { value: 'metric', label: 'kg (Metric)' },
                { value: 'imperial', label: 'lb (Imperial)' },
              ]}
            />
          </Card>

          <Card padding={16} style={{ gap: 12 }}>
            <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>TEMA</Text>
            <SegmentedControl
              value={themePref}
              onChange={(v) => setTheme(v as 'system' | 'light' | 'dark')}
              options={[
                { value: 'system', label: 'Auto' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </Card>

          <Card padding={16} style={{ gap: 12 }}>
            <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>REST DEFAULT</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[60, 90, 120, 180].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setRest(s)}
                  style={[
                    styles.restChip,
                    {
                      backgroundColor: restDefault === s ? theme.colors.primary : theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: restDefault === s ? '#fff' : theme.colors.textMuted,
                      fontWeight: '800',
                      fontSize: 13,
                    }}
                  >
                    {s}s
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Plate inventory + warm-up */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Equipment & Warm-up" />

          <Card padding={16} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>PLATE INVENTORY (KG)</Text>
              <Pressable onPress={() => void resetPlateInventory()} hitSlop={6}>
                <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '800' }}>Reset</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {PLATE_OPTIONS.map((p) => {
                const active = plateInventory.kg.includes(p);
                return (
                  <Pressable
                    key={p}
                    onPress={() => {
                      const next = active
                        ? plateInventory.kg.filter((x) => x !== p)
                        : [...plateInventory.kg, p].sort((a, b) => b - a);
                      if (next.length === 0) {
                        Alert.alert('Minimal 1 plate', 'Gym lo gak punya plate? Pilih minimal 1 ukuran ya.');
                        return;
                      }
                      void setPlateInventory({ ...plateInventory, kg: next });
                    }}
                    style={[
                      styles.platePill,
                      {
                        backgroundColor: active ? theme.colors.primary + '22' : theme.colors.surfaceMuted,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      {fmt(p)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.kicker, { color: theme.colors.textMuted, marginTop: 4 }]}>
              BAR
            </Text>
            <SegmentedControl
              value={String(plateInventory.barKg)}
              onChange={(v) =>
                void setPlateInventory({ ...plateInventory, barKg: Number(v) })
              }
              options={BAR_OPTIONS.map((b) => ({
                value: String(b),
                label: `${b} kg`,
              }))}
            />
            <Text style={{ color: theme.colors.textDim, fontSize: 11 }}>
              Default Olympic bar 20 kg. Pakai 15 kg buat training bar atau 25 kg buat power bar.
            </Text>
          </Card>

          <Card padding={16} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>WARM-UP SCHEME</Text>
              <Pressable onPress={() => void resetWarmupScheme()} hitSlop={6}>
                <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '800' }}>Reset</Text>
              </Pressable>
            </View>
            {warmupScheme.steps.map((step, idx) => (
              <View
                key={idx}
                style={[
                  styles.warmupRow,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.warmupBadge,
                    { backgroundColor: theme.colors.warning + '22' },
                  ]}
                >
                  <Text style={{ color: theme.colors.warning, fontWeight: '800', fontSize: 11 }}>
                    W{idx + 1}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>
                  {Math.round(step.percent * 100)}%
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  × {step.reps} reps
                </Text>
              </View>
            ))}
            <Text style={{ color: theme.colors.textDim, fontSize: 11 }}>
              Default ladder {DEFAULT_WARMUP_SCHEME.steps.map((s) => `${Math.round(s.percent * 100)}%`).join(' → ')} dari beban kerja. Tap "Auto warm-up" pas workout buat generate.
            </Text>
          </Card>
        </View>

        {/* Tools */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Tools" />
          <Card padding={0}>
            <ListItem
              title="HIIT / Interval Timer"
              description="Preset Tabata, EMOM, AMRAP"
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                  <Icon name="timer" size={18} color={theme.colors.accent} />
                </View>
              }
              showChevron
              onPress={() => router.push('/timer')}
            />
          </Card>
        </View>

        {/* Profile actions */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Profil" />
          <Card padding={0}>
            <ListItem
              title="Edit Profil"
              description="Update umur, body, goal"
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
              }
              showChevron
              onPress={() => router.push('/profile')}
            />
            <ListItem
              title="Reset Profil & Onboarding"
              description="Mulai ulang dari awal"
              danger
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.dangerSoft }]}>
                  <Icon name="close" size={18} color={theme.colors.danger} />
                </View>
              }
              onPress={confirmReset}
            />
          </Card>
        </View>

        {/* Info */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Tentang Forge" />
          <Card padding={0}>
            <ListItem
              title="Kebijakan Privasi"
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={{ fontSize: 16 }}>🔒</Text>
                </View>
              }
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Syarat & Ketentuan"
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={{ fontSize: 16 }}>📜</Text>
                </View>
              }
              showChevron
              onPress={() => {}}
            />
            <ListItem
              title="Versi"
              description="1.0.0 · Build 1"
              leading={
                <View style={[styles.lIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={{ fontSize: 16 }}>ℹ️</Text>
                </View>
              }
            />
          </Card>
        </View>

        <Button
          label="Keluar"
          variant="danger"
          onPress={confirmSignOut}
          fullWidth
          leading={<Icon name="logout" size={16} color="#fff" />}
        />

        <Text style={{ color: theme.colors.textDim, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          Forge 🔥 · Personal Trainer di Saku Pemula Indonesia
        </Text>
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
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  platePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 56,
    alignItems: 'center',
  },
  warmupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  warmupBadge: {
    width: 32,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  lIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

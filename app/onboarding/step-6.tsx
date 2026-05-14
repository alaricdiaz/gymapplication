import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Pill } from '@/components/Pill';
import { useProfile, type TimePreference } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const DURATION_OPTIONS = [30, 45, 60, 75, 90];
const TIME_OPTIONS: { value: TimePreference; label: string }[] = [
  { value: 'morning', label: 'Pagi' },
  { value: 'afternoon', label: 'Siang' },
  { value: 'evening', label: 'Sore' },
  { value: 'night', label: 'Malam' },
  { value: 'flexible', label: 'Fleksibel' },
];

export default function Step6Schedule() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [days, setDays] = useState(profile.daysPerWeek ?? 3);
  const [duration, setDuration] = useState(profile.sessionDurationMin ?? 60);
  const [time, setTime] = useState<TimePreference>(profile.timePreference ?? 'flexible');

  const next = async () => {
    await update({ daysPerWeek: days, sessionDurationMin: duration, timePreference: time, onboardingStep: 6 });
    router.push('/onboarding/step-7');
  };

  return (
    <OnboardingShell
      title="Jadwal lo gimana?"
      subtitle="Forge bikin plan yang fit jadwal lo, bukan sebaliknya."
      step={6}
      total={9}
      onNext={next}
    >
      <View style={{ gap: 24 }}>
        <View style={{ gap: 12 }}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>HARI PER MINGGU</Text>
          <View style={styles.pillRow}>
            {DAYS_OPTIONS.map((d) => (
              <Pill
                key={d}
                label={d === 3 ? '3 hari ⭐' : `${d} hari`}
                active={days === d}
                onPress={() => setDays(d)}
              />
            ))}
          </View>
          {days === 3 ? (
            <Text style={[styles.hint, { color: theme.colors.success }]}>
              ✓ Ideal buat pemula. Recovery cukup, progress optimal.
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>DURASI PER SESI</Text>
          <View style={styles.pillRow}>
            {DURATION_OPTIONS.map((d) => (
              <Pill key={d} label={`${d} min`} active={duration === d} onPress={() => setDuration(d)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>JAM YANG LO PREFER</Text>
          <View style={styles.pillRow}>
            {TIME_OPTIONS.map((t) => (
              <Pill key={t.value} label={t.label} active={time === t.value} onPress={() => setTime(t.value)} />
            ))}
          </View>
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
});

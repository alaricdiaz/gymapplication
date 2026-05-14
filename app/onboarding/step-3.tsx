import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ValueSlider } from '@/components/ValueSlider';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Card } from '@/components/Card';
import { useProfile } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

export default function Step3Body() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [height, setHeight] = useState(profile.heightCm ?? 170);
  const [weight, setWeight] = useState(profile.weightKg ?? 65);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const bmi = useMemo(() => {
    const m = height / 100;
    return Math.round((weight / (m * m)) * 10) / 10;
  }, [height, weight]);

  const bmiLabel = useMemo(() => {
    if (bmi < 18.5) return { label: 'Underweight', color: theme.colors.accent };
    if (bmi < 25) return { label: 'Normal', color: theme.colors.success };
    if (bmi < 30) return { label: 'Overweight', color: theme.colors.warning };
    return { label: 'Obese', color: theme.colors.danger };
  }, [bmi, theme]);

  const next = async () => {
    await update({ heightCm: height, weightKg: weight, onboardingStep: 3 });
    router.push('/onboarding/step-4');
  };

  return (
    <OnboardingShell
      title="Tinggi & berat lo?"
      subtitle="Buat calculate starting weight + nutrition baseline."
      step={3}
      total={9}
      onNext={next}
    >
      <View style={{ gap: 24 }}>
        <SegmentedControl
          options={[
            { label: 'Metric (kg/cm)', value: 'metric' },
            { label: 'Imperial (lb/in)', value: 'imperial' },
          ]}
          value={unit}
          onChange={(v) => setUnit(v as 'metric' | 'imperial')}
        />

        <ValueSlider
          value={height}
          min={140}
          max={220}
          unit={unit === 'metric' ? 'cm' : 'in'}
          label="Tinggi"
          onChange={setHeight}
        />
        <ValueSlider
          value={weight}
          min={35}
          max={200}
          unit={unit === 'metric' ? 'kg' : 'lb'}
          label="Berat Badan"
          onChange={setWeight}
        />

        <Card variant="muted" padding={16}>
          <Text style={[styles.bmiLabel, { color: theme.colors.textMuted }]}>BMI LO</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={[styles.bmiValue, { color: theme.colors.text }]}>{bmi}</Text>
            <View style={[styles.bmiPill, { backgroundColor: bmiLabel.color }]}>
              <Text style={styles.bmiPillText}>{bmiLabel.label}</Text>
            </View>
          </View>
          <Text style={[styles.bmiHint, { color: theme.colors.textMuted }]}>
            BMI cuma referensi awal. Forge nanti track body fat % lebih akurat di Progress.
          </Text>
        </Card>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  bmiLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  bmiValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  bmiPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  bmiPillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bmiHint: { fontSize: 12, lineHeight: 18, marginTop: 8 },
});

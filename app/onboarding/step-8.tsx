import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { SegmentedControl } from '@/components/SegmentedControl';
import { BodyDiagram, BODY_AREA_LABELS, type BodyArea } from '@/components/BodyDiagram';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useProfile } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

export default function Step8Injuries() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const toggleInjury = useProfile((s) => s.toggleInjury);
  const update = useProfile((s) => s.update);
  const [view, setView] = useState<'front' | 'back'>('front');

  const next = async () => {
    await update({ onboardingStep: 8 });
    router.push('/onboarding/step-9');
  };

  return (
    <OnboardingShell
      title="Ada cedera atau bagian sensitif?"
      subtitle="Tap area yang sakit. Forge auto-substitute exercise."
      step={8}
      total={9}
      onNext={next}
      showSkip
      onSkip={next}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
        <SegmentedControl
          options={[
            { label: 'Tampak Depan', value: 'front' },
            { label: 'Tampak Belakang', value: 'back' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'front' | 'back')}
        />

        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <BodyDiagram
            selected={profile.injuries.map((i) => i.area)}
            onToggle={toggleInjury}
            view={view}
            width={220}
          />
        </View>

        {profile.injuries.length === 0 ? (
          <Card variant="success" padding={14}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="check" size={20} color={theme.colors.success} strokeWidth={3} />
              <Text style={{ color: theme.colors.text, flex: 1, fontSize: 13 }}>
                Belum ada cedera tercatat. Kalau lo punya, tap area di gambar.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>CEDERA TERCATAT</Text>
            {profile.injuries.map((inj) => (
              <Card key={inj.area} variant="danger" padding={12}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 16 }}>🩹</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.injTitle, { color: theme.colors.text }]}>
                      {BODY_AREA_LABELS[inj.area]}
                    </Text>
                    <Text style={[styles.injSub, { color: theme.colors.textMuted }]}>
                      {inj.status === 'active' ? 'Saat ini sakit' : inj.status === 'recovered' ? 'Pernah sakit, recovered' : 'Post-operasi'}
                      {' · '}
                      {inj.severity === 'mild' ? 'Ringan' : inj.severity === 'moderate' ? 'Sedang' : 'Berat'}
                    </Text>
                  </View>
                  <Pressable onPress={() => toggleInjury(inj.area)} hitSlop={8}>
                    <Icon name="close" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}

        <Card variant="muted" padding={14}>
          <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
            ⚠️ Forge bukan dokter. Kalau cedera serius, konsultasi sama dokter/fisioterapis dulu sebelum mulai program.
          </Text>
        </Card>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  injTitle: { fontSize: 14, fontWeight: '700' },
  injSub: { fontSize: 12, marginTop: 2 },
  disclaimer: { fontSize: 12, lineHeight: 18 },
});

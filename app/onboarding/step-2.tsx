import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ValueSlider } from '@/components/ValueSlider';
import { OptionCard } from '@/components/OptionCard';
import { useProfile, type Gender } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

export default function Step2AgeGender() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [age, setAge] = useState(profile.age ?? 25);
  const [gender, setGender] = useState<Gender | undefined>(profile.gender);

  const next = async () => {
    await update({ age, gender, onboardingStep: 2 });
    router.push('/onboarding/step-3');
  };

  return (
    <OnboardingShell
      title={`Halo${profile.nickname ? `, ${profile.nickname}` : ''} 👋`}
      subtitle="Umur sama gender lo apa? Cuma buat plan accuracy."
      step={2}
      total={9}
      onNext={next}
      nextDisabled={!gender}
    >
      <View style={{ gap: 24 }}>
        <View style={styles.ageCard}>
          <ValueSlider value={age} min={13} max={80} unit="tahun" label="Umur" onChange={setAge} />
        </View>

        <View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>GENDER</Text>
          <View style={{ gap: 8 }}>
            <OptionCard
              emoji="👨"
              title="Cowok"
              selected={gender === 'male'}
              onPress={() => setGender('male')}
            />
            <OptionCard
              emoji="👩"
              title="Cewek"
              selected={gender === 'female'}
              onPress={() => setGender('female')}
            />
            <OptionCard
              emoji="✨"
              title="Lainnya / Prefer not to say"
              selected={gender === 'other'}
              onPress={() => setGender('other')}
            />
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: theme.colors.textDim }]}>
          ℹ️ Gender mempengaruhi distribusi volume + starting weight calculation. Gak share publicly.
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  ageCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 8 },
});

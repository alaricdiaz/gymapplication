import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/Input';
import { OnboardingShell } from '@/components/OnboardingShell';
import { useProfile } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

export default function Step1Nickname() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [name, setName] = useState(profile.nickname ?? '');

  const next = async () => {
    await update({ nickname: name.trim(), onboardingStep: 1 });
    router.push('/onboarding/step-2');
  };

  return (
    <OnboardingShell
      title="Halo! Panggilan lo apa?"
      subtitle="Cuma buat personalize aja. Bisa diganti nanti."
      step={1}
      total={9}
      onNext={next}
      nextDisabled={name.trim().length < 2}
    >
      <Input
        value={name}
        onChangeText={setName}
        placeholder="Contoh: Adi"
        autoFocus
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={next}
      />
      <View style={{ marginTop: 24, padding: 16, borderRadius: 14, backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.primary }}>
        <Text style={{ color: theme.colors.text, fontSize: 13, lineHeight: 20 }}>
          🔥 Forge nanti panggil lo pake nama ini di setiap workout. Pilih yang lo nyaman ya.
        </Text>
      </View>
    </OnboardingShell>
  );
}

import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { OptionCard } from '@/components/OptionCard';
import { useProfile, GOAL_EMOJI, type Goal } from '@/stores/profile';

const GOAL_DETAILS: { value: Goal; title: string; desc: string }[] = [
  { value: 'cutting', title: 'Turun BB / Cutting', desc: 'Buang lemak, dapet definisi otot' },
  { value: 'bulking', title: 'Naik Massa / Bulking', desc: 'Tambah otot, gain weight' },
  { value: 'strength', title: 'Jadi Kuat / Strength', desc: 'Powerlifting style, fokus big lifts' },
  { value: 'general', title: 'Sehat Aja / General', desc: 'Fitness umum, gak ada target spesifik' },
  { value: 'recomp', title: 'Body Recomposition', desc: 'Lemak turun + otot naik bareng' },
];

export default function Step4Goal() {
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [goal, setGoal] = useState<Goal | undefined>(profile.goal);

  const next = async () => {
    await update({ goal, onboardingStep: 4 });
    router.push('/onboarding/step-5');
  };

  return (
    <OnboardingShell
      title="Lo mau dapet apa?"
      subtitle="Pilih satu goal utama. Bisa lo ganti kapan aja."
      step={4}
      total={9}
      onNext={next}
      nextDisabled={!goal}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
        {GOAL_DETAILS.map((g) => (
          <OptionCard
            key={g.value}
            emoji={GOAL_EMOJI[g.value]}
            title={g.title}
            description={g.desc}
            selected={goal === g.value}
            recommended={g.value === 'bulking'}
            onPress={() => setGoal(g.value)}
          />
        ))}
      </ScrollView>
    </OnboardingShell>
  );
}

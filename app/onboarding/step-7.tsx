import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { OptionCard } from '@/components/OptionCard';
import { useProfile, EQUIPMENT_EMOJI, type Equipment } from '@/stores/profile';

const EQ_DETAILS: { value: Equipment; title: string; desc: string }[] = [
  { value: 'full_gym', title: 'Gym Lengkap', desc: 'Barbell, dumbbell, rack, cable, machine' },
  { value: 'home_gym', title: 'Home Gym Mini', desc: 'DB + bench (+ rack/pull-up bar)' },
  { value: 'dumbbell', title: 'Dumbbell Doang', desc: 'Cuma punya 1-2 dumbbell di rumah' },
  { value: 'bodyweight', title: 'Bodyweight Only', desc: 'Gak punya alat, full bodyweight' },
  { value: 'outdoor', title: 'Outdoor', desc: 'Lari, sepeda, taman, lapangan' },
];

export default function Step7Equipment() {
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [eq, setEq] = useState<Equipment | undefined>(profile.equipment);

  const next = async () => {
    await update({ equipment: eq, onboardingStep: 7 });
    router.push('/onboarding/step-8');
  };

  return (
    <OnboardingShell
      title="Akses gym lo gimana?"
      subtitle="Forge milih exercise berdasarkan alat yang lo punya."
      step={7}
      total={9}
      onNext={next}
      nextDisabled={!eq}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
        {EQ_DETAILS.map((e) => (
          <OptionCard
            key={e.value}
            emoji={EQUIPMENT_EMOJI[e.value]}
            title={e.title}
            description={e.desc}
            selected={eq === e.value}
            onPress={() => setEq(e.value)}
            recommended={e.value === 'full_gym'}
          />
        ))}
      </ScrollView>
    </OnboardingShell>
  );
}

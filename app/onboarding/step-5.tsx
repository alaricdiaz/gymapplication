import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingShell } from '@/components/OnboardingShell';
import { OptionCard } from '@/components/OptionCard';
import { useProfile, type ExperienceLevel } from '@/stores/profile';

const EXP_DETAILS: { value: ExperienceLevel; title: string; desc: string; emoji: string; recommended?: boolean }[] = [
  { value: 'never', title: 'Belum Pernah', desc: 'Pertama kali workout, butuh dasar', emoji: '🟢' },
  { value: 'beginner', title: 'Pemula', desc: '< 6 bulan ngegym, masih belajar form', emoji: '🟡', recommended: true },
  { value: 'intermediate', title: 'Menengah', desc: '6 bulan - 2 tahun, udah konsisten', emoji: '🟠' },
  { value: 'advanced', title: 'Lanjut', desc: '> 2 tahun, udah tau body lo', emoji: '🔴' },
];

export default function Step5Experience() {
  const profile = useProfile((s) => s.data);
  const update = useProfile((s) => s.update);
  const [exp, setExp] = useState<ExperienceLevel | undefined>(profile.experience);

  const next = async () => {
    await update({ experience: exp, onboardingStep: 5 });
    router.push('/onboarding/step-6');
  };

  return (
    <OnboardingShell
      title="Seberapa pengalaman lo?"
      subtitle="Jujur aja, Forge sesuaikan tingkat kesulitan program."
      step={5}
      total={9}
      onNext={next}
      nextDisabled={!exp}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
        {EXP_DETAILS.map((e) => (
          <OptionCard
            key={e.value}
            emoji={e.emoji}
            title={e.title}
            description={e.desc}
            selected={exp === e.value}
            recommended={e.recommended}
            onPress={() => setExp(e.value)}
          />
        ))}
      </ScrollView>
    </OnboardingShell>
  );
}

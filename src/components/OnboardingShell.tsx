import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';
import { DotProgress } from '@/components/DotProgress';
import { Button } from '@/components/Button';

interface OnboardingShellProps {
  title: string;
  subtitle?: string;
  step: number;
  total: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function OnboardingShell({
  title,
  subtitle,
  step,
  total,
  onNext,
  onBack,
  nextLabel = 'Lanjut',
  nextDisabled,
  children,
  contentStyle,
  showSkip,
  onSkip,
}: OnboardingShellProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (onBack) onBack();
            else router.back();
          }}
          hitSlop={10}
          style={[
            styles.iconBtn,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Icon name="chevronLeft" size={18} color={theme.colors.text} />
        </Pressable>
        <DotProgress total={total} current={step} />
        {showSkip ? (
          <Pressable onPress={onSkip} hitSlop={10}>
            <Text style={[styles.skip, { color: theme.colors.textMuted }]}>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={[{ flex: 1, paddingHorizontal: 20 }, contentStyle]}>{children}</View>

      <View style={styles.footer}>
        <Button
          label={nextLabel}
          onPress={onNext}
          fullWidth
          size="lg"
          variant="gradient"
          disabled={nextDisabled}
          trailing={<Icon name="arrowRight" size={18} color="#fff" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, gap: 6 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  footer: { padding: 20, paddingBottom: 24 },
  skip: { fontSize: 13, fontWeight: '700' },
});

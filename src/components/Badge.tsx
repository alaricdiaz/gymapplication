import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

type Variant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'accent';

interface BadgeProps {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', style, size = 'md' }: BadgeProps) {
  const theme = useTheme();
  const palette = (() => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primarySoft, fg: theme.colors.primary };
      case 'success':
        return { bg: theme.colors.successSoft, fg: theme.colors.success };
      case 'danger':
        return { bg: theme.colors.dangerSoft, fg: theme.colors.danger };
      case 'warning':
        return { bg: theme.colors.warningSoft, fg: theme.colors.warning };
      case 'accent':
        return { bg: theme.colors.accentSoft, fg: theme.colors.accent };
      case 'default':
      default:
        return { bg: theme.colors.surfaceMuted, fg: theme.colors.textMuted };
    }
  })();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          paddingHorizontal: size === 'sm' ? 6 : 8,
          paddingVertical: size === 'sm' ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: palette.fg,
            fontSize: size === 'sm' ? 9 : 10,
          },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '800', letterSpacing: 0.5 },
});

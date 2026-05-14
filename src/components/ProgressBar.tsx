import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface ProgressBarProps {
  value: number;
  total?: number;
  variant?: 'primary' | 'success' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  total = 100,
  variant = 'primary',
  size = 'md',
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const pct = Math.min(100, Math.max(0, (value / total) * 100));

  const color = (() => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'danger':
        return theme.colors.danger;
      case 'accent':
        return theme.colors.accent;
      case 'primary':
      default:
        return theme.colors.primary;
    }
  })();

  const height = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.surfaceMuted,
          height,
          borderRadius: height,
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          height,
          borderRadius: height,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/components/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: ViewStyle;
  haptics?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  leading,
  trailing,
  style,
  haptics = true,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette = (() => {
    switch (variant) {
      case 'secondary':
        return { bg: theme.colors.surfaceElevated, fg: theme.colors.text, border: theme.colors.border };
      case 'ghost':
        return { bg: 'transparent', fg: theme.colors.text, border: 'transparent' };
      case 'danger':
        return { bg: theme.colors.danger, fg: '#FFFFFF', border: theme.colors.danger };
      case 'gradient':
        return { bg: 'transparent', fg: '#FFFFFF', border: 'transparent' };
      case 'primary':
      default:
        return { bg: theme.colors.primary, fg: theme.colors.primaryFg, border: theme.colors.primary };
    }
  })();

  const sizing = (() => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 9, paddingHorizontal: 14, minHeight: 38, fontSize: 13, radius: 10 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 22, minHeight: 58, fontSize: 16, radius: 16 };
      case 'md':
      default:
        return { paddingVertical: 14, paddingHorizontal: 18, minHeight: 50, fontSize: 15, radius: 14 };
    }
  })();

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {leading}
          <Text style={[styles.label, { color: palette.fg, fontSize: sizing.fontSize }]}>{label}</Text>
          {trailing}
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (isDisabled) return;
          if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          onPress?.();
        }}
        style={({ pressed }) => [
          {
            opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            borderRadius: sizing.radius,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: sizing.paddingVertical,
            paddingHorizontal: sizing.paddingHorizontal,
            borderRadius: sizing.radius,
            minHeight: sizing.minHeight,
            justifyContent: 'center',
          }}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (isDisabled) return;
        if (haptics) Haptics.selectionAsync().catch(() => undefined);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          minHeight: sizing.minHeight,
          borderRadius: sizing.radius,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontWeight: '700' },
});

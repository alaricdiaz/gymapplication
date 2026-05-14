import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
  gradient?: boolean;
  variant?: 'default' | 'muted' | 'primary' | 'success' | 'danger';
  borderless?: boolean;
}

export function Card({
  children,
  style,
  padding,
  elevated,
  gradient,
  variant = 'default',
  borderless,
}: CardProps) {
  const theme = useTheme();

  const variantStyle = (() => {
    switch (variant) {
      case 'muted':
        return { bg: theme.colors.surfaceMuted, border: theme.colors.border };
      case 'primary':
        return { bg: theme.colors.primarySoft, border: theme.colors.primary };
      case 'success':
        return { bg: theme.colors.successSoft, border: theme.colors.success };
      case 'danger':
        return { bg: theme.colors.dangerSoft, border: theme.colors.danger };
      case 'default':
      default:
        return {
          bg: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
          border: theme.colors.border,
        };
    }
  })();

  if (gradient) {
    return (
      <View style={[styles.card, { padding: padding ?? theme.spacing.lg }, style]}>
        <LinearGradient
          colors={theme.gradients.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: 18 }]}
        />
        <View style={{ borderRadius: 18 }}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          padding: padding ?? theme.spacing.lg,
          borderWidth: borderless ? 0 : 1,
        },
        elevated ? theme.shadows.md : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
  },
});

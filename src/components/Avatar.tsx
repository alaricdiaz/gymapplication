import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';

interface AvatarProps {
  name?: string;
  size?: number;
  variant?: 'primary' | 'accent' | 'neutral';
}

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 48, variant = 'primary' }: AvatarProps) {
  const theme = useTheme();
  const colors =
    variant === 'accent' ? theme.gradients.accent : variant === 'neutral' ? theme.gradients.surface : theme.gradients.primary;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.4, color: variant === 'neutral' ? theme.colors.text : '#fff' },
        ]}
      >
        {initials(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800' },
});

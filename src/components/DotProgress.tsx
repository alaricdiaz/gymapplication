import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface DotProgressProps {
  total: number;
  current: number;
}

export function DotProgress({ total, current }: DotProgressProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        const active = i === current - 1;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: filled ? theme.colors.primary : theme.colors.surfaceMuted,
                width: active ? 22 : 6,
                opacity: filled ? 1 : 0.6,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
});

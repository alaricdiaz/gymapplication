import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface DayState {
  date: Date;
  completed?: boolean;
  active?: boolean;
}

interface WeekStripProps {
  days: DayState[];
}

const DAY_LABELS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function WeekStrip({ days }: WeekStripProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const label = DAY_LABELS_ID[i];
        const num = d.date.getDate();
        return (
          <View key={i} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: d.completed
                    ? theme.colors.primary
                    : d.active
                      ? theme.colors.surfaceElevated
                      : 'transparent',
                  borderColor: d.active && !d.completed ? theme.colors.primary : theme.colors.border,
                  borderWidth: d.active && !d.completed ? 2 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.num,
                  {
                    color: d.completed
                      ? '#fff'
                      : d.active
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                  },
                ]}
              >
                {num}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  label: { fontSize: 11, fontWeight: '700' },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 14, fontWeight: '700' },
});

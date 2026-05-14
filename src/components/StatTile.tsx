import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success';
  style?: ViewStyle;
}

export function StatTile({ label, value, unit, icon, trend, trendValue, variant = 'default', style }: StatTileProps) {
  const theme = useTheme();

  if (variant === 'primary') {
    return (
      <View style={[styles.wrap, style]}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {icon ? <View style={{ marginBottom: 6 }}>{icon}</View> : null}
          <Text style={[styles.label, { color: 'rgba(255,255,255,0.85)' }]}>{label.toUpperCase()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <Text style={[styles.value, { color: '#fff' }]}>{value}</Text>
            {unit ? <Text style={[styles.unit, { color: 'rgba(255,255,255,0.85)' }]}>{unit}</Text> : null}
          </View>
          {trendValue ? (
            <Text style={[styles.trend, { color: 'rgba(255,255,255,0.9)' }]}>{trendValue}</Text>
          ) : null}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label.toUpperCase()}</Text>
        {icon}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: theme.colors.textMuted }]}>{unit}</Text> : null}
      </View>
      {trendValue ? (
        <Text
          style={[
            styles.trend,
            {
              color:
                trend === 'up'
                  ? theme.colors.success
                  : trend === 'down'
                    ? theme.colors.danger
                    : theme.colors.textMuted,
            },
          ]}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: 0 },
  card: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  gradientCard: {
    padding: 14,
    borderRadius: 16,
    gap: 4,
  },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  value: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  unit: { fontSize: 12, fontWeight: '600' },
  trend: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});

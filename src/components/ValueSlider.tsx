import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/components/ThemeProvider';

interface ValueSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
  onChange: (val: number) => void;
  hint?: string;
}

export function ValueSlider({
  value,
  min,
  max,
  step = 1,
  unit,
  label,
  onChange,
  hint,
}: ValueSliderProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {value}
            {unit ? <Text style={[styles.unit, { color: theme.colors.textMuted }]}> {unit}</Text> : null}
          </Text>
        </View>
      ) : null}
      <Slider
        minimumValue={min}
        maximumValue={max}
        value={value}
        step={step}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.surfaceMuted}
        thumbTintColor={theme.colors.primary}
      />
      <View style={styles.rangeRow}>
        <Text style={[styles.range, { color: theme.colors.textDim }]}>
          {min}
          {unit ? ` ${unit}` : ''}
        </Text>
        <Text style={[styles.range, { color: theme.colors.textDim }]}>
          {max}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>
      {hint ? <Text style={[styles.hint, { color: theme.colors.textDim }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 14, fontWeight: '500' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  range: { fontSize: 11, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 2 },
});

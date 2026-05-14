import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/components/ThemeProvider';

interface ChartProps {
  data: { x: string; y: number }[];
  height?: number;
}

export function Chart({ data, height = 200 }: ChartProps) {
  const theme = useTheme();
  const width = Dimensions.get('window').width - 64;

  const { path, dots, max, min, ticks } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', dots: [], max: 0, min: 0, ticks: [] as number[] };
    }
    const ys = data.map((d) => d.y);
    const yMax = Math.max(...ys, 1);
    const yMin = 0;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    const points = data.map((d, i) => {
      const x = data.length === 1 ? width / 2 : i * stepX;
      const y = height - ((d.y - yMin) / (yMax - yMin || 1)) * (height - 20) - 10;
      return { x, y };
    });
    const d = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
    const tickValues = [0, Math.round(yMax / 2), Math.round(yMax)];
    return { path: d, dots: points, max: yMax, min: yMin, ticks: tickValues };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textDim, fontSize: 13 }}>No data yet</Text>
      </View>
    );
  }

  return (
    <View style={{ height }}>
      <Svg width={width} height={height}>
        {ticks.map((t, idx) => {
          const y = height - ((t - min) / (max - min || 1)) * (height - 20) - 10;
          return (
            <Line
              key={idx}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}
        <Path d={path} stroke={theme.colors.primary} strokeWidth={2.5} fill="none" />
        {dots.map((p, idx) => (
          <Circle key={idx} cx={p.x} cy={p.y} r={3.5} fill={theme.colors.primary} />
        ))}
        <Rect x={0} y={0} width={width} height={height} fill="none" />
      </Svg>
      <View style={styles.axisRow}>
        <Text style={[styles.axisLabel, { color: theme.colors.textDim }]}>{data[0]?.x ?? ''}</Text>
        <Text style={[styles.axisLabel, { color: theme.colors.textDim }]}>{data[data.length - 1]?.x ?? ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 11 },
});

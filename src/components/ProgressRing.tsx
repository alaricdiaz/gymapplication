import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/components/ThemeProvider';

interface ProgressRingProps {
  value: number;
  total?: number;
  size?: number;
  stroke?: number;
  variant?: 'primary' | 'success' | 'danger';
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  total = 100,
  size = 160,
  stroke = 12,
  variant = 'primary',
  children,
}: ProgressRingProps) {
  const theme = useTheme();
  const pct = Math.min(100, Math.max(0, (value / total) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const gradient = (() => {
    switch (variant) {
      case 'success':
        return theme.gradients.success;
      case 'danger':
        return theme.gradients.danger;
      case 'primary':
      default:
        return theme.gradients.primary;
    }
  })();

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[1]} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceMuted}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

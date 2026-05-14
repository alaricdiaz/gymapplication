import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/components/ThemeProvider';

export type BodyArea =
  | 'neck'
  | 'shoulder_l'
  | 'shoulder_r'
  | 'chest'
  | 'upper_back'
  | 'lower_back'
  | 'elbow_l'
  | 'elbow_r'
  | 'wrist_l'
  | 'wrist_r'
  | 'hip_l'
  | 'hip_r'
  | 'knee_l'
  | 'knee_r'
  | 'ankle_l'
  | 'ankle_r';

interface BodyDiagramProps {
  selected: BodyArea[];
  onToggle: (area: BodyArea) => void;
  view?: 'front' | 'back';
  width?: number;
}

export function BodyDiagram({ selected, onToggle, view = 'front', width = 200 }: BodyDiagramProps) {
  const theme = useTheme();
  const height = width * 1.6;

  const dotFor = (area: BodyArea) => (selected.includes(area) ? theme.colors.danger : 'transparent');
  const ringFor = (area: BodyArea) => (selected.includes(area) ? theme.colors.danger : theme.colors.borderStrong);

  const handle = (area: BodyArea) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onToggle(area);
  };

  const skin = theme.mode === 'dark' ? '#1F2A38' : '#F4F4EF';
  const skinStroke = theme.colors.borderStrong;

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 100 160">
        {/* Body silhouette */}
        {/* Head */}
        <Circle cx="50" cy="14" r="9" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        {/* Neck */}
        <Rect x="46" y="22" width="8" height="6" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        {/* Torso */}
        <Path
          d="M30 30 Q30 25 38 26 L62 26 Q70 25 70 30 L72 60 Q72 70 68 75 L60 78 L40 78 L32 75 Q28 70 28 60 Z"
          fill={skin}
          stroke={skinStroke}
          strokeWidth="0.8"
        />
        {/* Arms */}
        <Path d="M30 30 L20 50 L18 78 L24 80 L26 50 Z" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        <Path d="M70 30 L80 50 L82 78 L76 80 L74 50 Z" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        {/* Hands */}
        <Circle cx="20" cy="83" r="4" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        <Circle cx="80" cy="83" r="4" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        {/* Hip/pelvis */}
        <Path
          d="M32 78 L40 78 L60 78 L68 78 L68 90 Q60 95 50 95 Q40 95 32 90 Z"
          fill={skin}
          stroke={skinStroke}
          strokeWidth="0.8"
        />
        {/* Legs */}
        <Path d="M36 92 L34 130 L40 145 L46 145 L46 130 L45 92 Z" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        <Path d="M64 92 L66 130 L60 145 L54 145 L54 130 L55 92 Z" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        {/* Feet */}
        <Ellipse cx="42" cy="150" rx="6" ry="3" fill={skin} stroke={skinStroke} strokeWidth="0.8" />
        <Ellipse cx="58" cy="150" rx="6" ry="3" fill={skin} stroke={skinStroke} strokeWidth="0.8" />

        {view === 'front' ? (
          <>
            {/* Center line muscle hints */}
            <Line x1="50" y1="30" x2="50" y2="78" stroke={skinStroke} strokeWidth="0.4" strokeDasharray="1 1" />
            {/* Chest hints */}
            <Path d="M35 38 Q40 42 45 38" stroke={skinStroke} strokeWidth="0.5" fill="none" />
            <Path d="M55 38 Q60 42 65 38" stroke={skinStroke} strokeWidth="0.5" fill="none" />
          </>
        ) : (
          <>
            <Line x1="50" y1="30" x2="50" y2="78" stroke={skinStroke} strokeWidth="0.4" strokeDasharray="1 1" />
          </>
        )}

        {/* Hot zone markers */}
        {/* Neck */}
        <Circle cx="50" cy="25" r="3" fill={dotFor('neck')} stroke={ringFor('neck')} strokeWidth="0.8" />
        {/* Shoulders */}
        <Circle cx="32" cy="32" r="3" fill={dotFor('shoulder_l')} stroke={ringFor('shoulder_l')} strokeWidth="0.8" />
        <Circle cx="68" cy="32" r="3" fill={dotFor('shoulder_r')} stroke={ringFor('shoulder_r')} strokeWidth="0.8" />
        {/* Chest / upper back */}
        <Circle
          cx="50"
          cy="42"
          r="3"
          fill={view === 'front' ? dotFor('chest') : dotFor('upper_back')}
          stroke={view === 'front' ? ringFor('chest') : ringFor('upper_back')}
          strokeWidth="0.8"
        />
        {/* Lower back */}
        {view === 'back' ? (
          <Circle cx="50" cy="68" r="3" fill={dotFor('lower_back')} stroke={ringFor('lower_back')} strokeWidth="0.8" />
        ) : null}
        {/* Elbows */}
        <Circle cx="22" cy="55" r="2.5" fill={dotFor('elbow_l')} stroke={ringFor('elbow_l')} strokeWidth="0.8" />
        <Circle cx="78" cy="55" r="2.5" fill={dotFor('elbow_r')} stroke={ringFor('elbow_r')} strokeWidth="0.8" />
        {/* Wrists */}
        <Circle cx="20" cy="78" r="2" fill={dotFor('wrist_l')} stroke={ringFor('wrist_l')} strokeWidth="0.8" />
        <Circle cx="80" cy="78" r="2" fill={dotFor('wrist_r')} stroke={ringFor('wrist_r')} strokeWidth="0.8" />
        {/* Hips */}
        <Circle cx="40" cy="88" r="2.5" fill={dotFor('hip_l')} stroke={ringFor('hip_l')} strokeWidth="0.8" />
        <Circle cx="60" cy="88" r="2.5" fill={dotFor('hip_r')} stroke={ringFor('hip_r')} strokeWidth="0.8" />
        {/* Knees */}
        <Circle cx="42" cy="118" r="3" fill={dotFor('knee_l')} stroke={ringFor('knee_l')} strokeWidth="0.8" />
        <Circle cx="58" cy="118" r="3" fill={dotFor('knee_r')} stroke={ringFor('knee_r')} strokeWidth="0.8" />
        {/* Ankles */}
        <Circle cx="42" cy="145" r="2" fill={dotFor('ankle_l')} stroke={ringFor('ankle_l')} strokeWidth="0.8" />
        <Circle cx="58" cy="145" r="2" fill={dotFor('ankle_r')} stroke={ringFor('ankle_r')} strokeWidth="0.8" />
      </Svg>

      {/* Invisible tap zones */}
      <TapZone style={{ left: '42%', top: '12%', width: 16, height: 12 }} onPress={handle('neck')} />
      <TapZone style={{ left: '20%', top: '16%', width: 18, height: 14 }} onPress={handle('shoulder_l')} />
      <TapZone style={{ left: '62%', top: '16%', width: 18, height: 14 }} onPress={handle('shoulder_r')} />
      <TapZone
        style={{ left: '38%', top: '22%', width: 24, height: 22 }}
        onPress={handle(view === 'front' ? 'chest' : 'upper_back')}
      />
      {view === 'back' ? (
        <TapZone style={{ left: '38%', top: '38%', width: 24, height: 16 }} onPress={handle('lower_back')} />
      ) : null}
      <TapZone style={{ left: '10%', top: '30%', width: 18, height: 16 }} onPress={handle('elbow_l')} />
      <TapZone style={{ left: '72%', top: '30%', width: 18, height: 16 }} onPress={handle('elbow_r')} />
      <TapZone style={{ left: '10%', top: '46%', width: 18, height: 14 }} onPress={handle('wrist_l')} />
      <TapZone style={{ left: '72%', top: '46%', width: 18, height: 14 }} onPress={handle('wrist_r')} />
      <TapZone style={{ left: '32%', top: '50%', width: 18, height: 16 }} onPress={handle('hip_l')} />
      <TapZone style={{ left: '50%', top: '50%', width: 18, height: 16 }} onPress={handle('hip_r')} />
      <TapZone style={{ left: '32%', top: '70%', width: 18, height: 16 }} onPress={handle('knee_l')} />
      <TapZone style={{ left: '50%', top: '70%', width: 18, height: 16 }} onPress={handle('knee_r')} />
      <TapZone style={{ left: '32%', top: '86%', width: 18, height: 14 }} onPress={handle('ankle_l')} />
      <TapZone style={{ left: '50%', top: '86%', width: 18, height: 14 }} onPress={handle('ankle_r')} />
    </View>
  );
}

function TapZone({ style, onPress }: { style: { left: string; top: string; width: number; height: number }; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          position: 'absolute',
          width: style.width,
          height: style.height,
        },
        { left: style.left as `${number}%`, top: style.top as `${number}%` },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', alignSelf: 'center' },
});

export const BODY_AREA_LABELS: Record<BodyArea, string> = {
  neck: 'Leher',
  shoulder_l: 'Bahu Kiri',
  shoulder_r: 'Bahu Kanan',
  chest: 'Dada',
  upper_back: 'Punggung Atas',
  lower_back: 'Punggung Bawah',
  elbow_l: 'Siku Kiri',
  elbow_r: 'Siku Kanan',
  wrist_l: 'Pergelangan Tangan Kiri',
  wrist_r: 'Pergelangan Tangan Kanan',
  hip_l: 'Pinggul Kiri',
  hip_r: 'Pinggul Kanan',
  knee_l: 'Lutut Kiri',
  knee_r: 'Lutut Kanan',
  ankle_l: 'Pergelangan Kaki Kiri',
  ankle_r: 'Pergelangan Kaki Kanan',
};

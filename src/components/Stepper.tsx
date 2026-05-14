import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export function Stepper({ value, min = 0, max = 999, step = 1, unit, onChange }: StepperProps) {
  const theme = useTheme();

  const dec = () => {
    if (value <= min) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(Math.max(min, value - step));
  };

  const inc = () => {
    if (value >= max) return;
    Haptics.selectionAsync().catch(() => undefined);
    onChange(Math.min(max, value + step));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Pressable onPress={dec} style={[styles.btn, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Icon name="minus" size={16} color={theme.colors.text} />
      </Pressable>
      <View style={styles.valueWrap}>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {value}
          {unit ? <Text style={[styles.unit, { color: theme.colors.textMuted }]}> {unit}</Text> : null}
        </Text>
      </View>
      <Pressable onPress={inc} style={[styles.btn, { backgroundColor: theme.colors.primary }]}>
        <Icon name="plus" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 6,
    borderWidth: 1,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: { minWidth: 60, alignItems: 'center' },
  value: { fontSize: 17, fontWeight: '700' },
  unit: { fontSize: 13, fontWeight: '500' },
});

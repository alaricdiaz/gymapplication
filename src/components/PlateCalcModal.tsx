import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useSettings } from '@/stores/settings';
import {
  computePlates,
  formatPerSide,
  type PlateGroup,
  type PlateInventory,
} from '@/lib/plates';

interface PlateCalcModalProps {
  visible: boolean;
  initialWeight: number;
  onClose: () => void;
  onApply: (weight: number) => void;
  exerciseName?: string;
}

const QUICK_DELTAS = [-10, -5, -2.5, -1.25, 1.25, 2.5, 5, 10];

const PLATE_COLOR: Record<string, string> = {
  '25': '#EF4444',
  '20': '#3B82F6',
  '15': '#F59E0B',
  '10': '#10B981',
  '5': '#FFFFFF',
  '2.5': '#0EA5E9',
  '1.25': '#94A3B8',
};

function plateColor(kg: number): string {
  const key = kg % 1 === 0 ? String(kg) : kg.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return PLATE_COLOR[key] ?? '#6B7280';
}

function fmt(n: number): string {
  if (Math.abs(n) < 0.001) return '0';
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function PlateCalcModal({
  visible,
  initialWeight,
  onClose,
  onApply,
  exerciseName,
}: PlateCalcModalProps) {
  const theme = useTheme();
  const inventory = useSettings((s) => s.plateInventory);
  const [target, setTarget] = useState(() => initialWeight || inventory.barKg);

  useEffect(() => {
    if (visible) {
      setTarget(initialWeight > 0 ? initialWeight : inventory.barKg);
    }
  }, [visible, initialWeight, inventory.barKg]);

  const selection = useMemo(() => computePlates(target, inventory), [target, inventory]);

  function bump(delta: number) {
    const next = Math.max(0, target + delta);
    setTarget(next);
    Haptics.selectionAsync().catch(() => undefined);
  }

  function apply() {
    onApply(selection.totalKg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Icon name="close" size={18} color={theme.colors.text} />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
              KALKULATOR PLATE
            </Text>
            <Text
              style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}
              numberOfLines={1}
            >
              {exerciseName ?? 'Setup beban'}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.targetCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.textDim }]}>TARGET BEBAN</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <TextInput
                value={fmt(target)}
                onChangeText={(t) => setTarget(Number(t.replace(',', '.')) || 0)}
                keyboardType="decimal-pad"
                style={[styles.targetInput, { color: theme.colors.text }]}
                selectTextOnFocus
              />
              <Text style={{ color: theme.colors.textMuted, fontSize: 16, fontWeight: '800' }}>kg</Text>
            </View>
            <View style={styles.deltaGrid}>
              {QUICK_DELTAS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => bump(d)}
                  style={({ pressed }) => [
                    styles.deltaChip,
                    {
                      backgroundColor:
                        d > 0 ? theme.colors.primary + '14' : theme.colors.surfaceMuted,
                      borderColor: d > 0 ? theme.colors.primary + '55' : theme.colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: d > 0 ? theme.colors.primary : theme.colors.text,
                      fontWeight: '800',
                      fontSize: 13,
                    }}
                  >
                    {d > 0 ? `+${fmt(d)}` : fmt(d)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.barCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.textDim }]}>BAR VIEW</Text>
            <View style={styles.barRow}>
              <PlateSide perSide={selection.perSide} mirrored />
              <View
                style={[
                  styles.bar,
                  { backgroundColor: theme.mode === 'dark' ? '#5B6776' : '#94A3B8' },
                ]}
              />
              <PlateSide perSide={selection.perSide} />
            </View>
            <View style={styles.totalRow}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                Bar {fmt(inventory.barKg)} kg + plate
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}
              >
                {fmt(selection.totalKg)} kg
              </Text>
              {selection.feasible ? null : (
                <Text style={{ color: theme.colors.warning, fontSize: 11, fontWeight: '700' }}>
                  {selection.remainderKg > 0
                    ? `Kurang ${fmt(selection.remainderKg)} kg (plate gak nyukup)`
                    : `Lebih ${fmt(-selection.remainderKg)} kg dari target`}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.textDim }]}>BREAKDOWN PER SISI</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800', marginTop: 6 }}>
              {formatPerSide(selection.perSide)}
            </Text>
            {selection.perSide.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {selection.perSide.map((g) => (
                  <View
                    key={g.kg}
                    style={[
                      styles.plateGroupChip,
                      { backgroundColor: plateColor(g.kg) + '22', borderColor: plateColor(g.kg) },
                    ]}
                  >
                    <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 12 }}>
                      {g.count}× {fmt(g.kg)} kg
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={{ gap: 8 }}>
            <Text style={[styles.label, { color: theme.colors.textDim }]}>INVENTORY GYM LO</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {inventory.kg.map((p) => (
                <View
                  key={p}
                  style={[
                    styles.inventoryChip,
                    {
                      backgroundColor: plateColor(p) + '14',
                      borderColor: plateColor(p),
                    },
                  ]}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 11 }}>
                    {fmt(p)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>
              Bar default {fmt(inventory.barKg)} kg. Edit inventory di Settings → Plate inventory.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}>
          <Pressable onPress={apply} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.applyBtn}
            >
              <Icon name="check" size={16} color="#fff" />
              <Text style={styles.applyText}>Pakai {fmt(selection.totalKg)} kg</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function PlateSide({ perSide, mirrored = false }: { perSide: PlateGroup[]; mirrored?: boolean }) {
  const theme = useTheme();
  const flat = perSide.flatMap((g) => Array.from({ length: g.count }, () => g.kg));
  if (mirrored) flat.reverse();
  if (!flat.length) {
    return (
      <View style={[styles.side, { justifyContent: mirrored ? 'flex-end' : 'flex-start' }]}>
        <Text style={{ color: theme.colors.textDim, fontSize: 11, fontWeight: '700' }}>
          (bar doang)
        </Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.side,
        {
          flexDirection: mirrored ? 'row-reverse' : 'row',
          justifyContent: mirrored ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      {flat.map((p, i) => (
        <View
          key={`${p}-${i}`}
          style={[
            styles.plate,
            {
              backgroundColor: plateColor(p),
              height: 26 + Math.min(48, p * 2),
              borderColor: theme.mode === 'dark' ? '#0A0E13' : '#1F2937',
            },
          ]}
        >
          <Text
            style={[
              styles.plateLabel,
              {
                color: ['5'].includes(fmt(p)) ? '#000' : '#fff',
              },
            ]}
          >
            {fmt(p)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  targetCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  targetInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    padding: 0,
  },
  deltaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  deltaChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 56,
    alignItems: 'center',
  },
  barCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    minHeight: 80,
  },
  side: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minHeight: 80,
    flexDirection: 'row',
  },
  bar: {
    width: 80,
    height: 8,
    borderRadius: 4,
  },
  plate: {
    width: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateLabel: { fontSize: 8, fontWeight: '800', transform: [{ rotate: '-90deg' }] },
  totalRow: { alignItems: 'center', gap: 2, marginTop: 4 },
  summaryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  plateGroupChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  inventoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
});

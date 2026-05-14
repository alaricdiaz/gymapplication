import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  onSaved?: () => void;
}

const FIELDS: { key: string; label: string }[] = [
  { key: 'weight_kg', label: 'Weight (kg)' },
  { key: 'body_fat_pct', label: 'Body fat %' },
  { key: 'chest_cm', label: 'Chest (cm)' },
  { key: 'waist_cm', label: 'Waist (cm)' },
  { key: 'hip_cm', label: 'Hip (cm)' },
  { key: 'arm_cm', label: 'Arm (cm)' },
  { key: 'thigh_cm', label: 'Thigh (cm)' },
];

export function MeasurementForm({ onSaved }: Props) {
  const theme = useTheme();
  const user = useAuth((s) => s.user);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!user) return;
    setError(null);
    setSaving(true);
    const payload: Record<string, number | string | null> = {
      user_id: user.id,
      measured_at: new Date().toISOString(),
    };
    for (const f of FIELDS) {
      const raw = values[f.key];
      payload[f.key] = raw ? Number(raw) : null;
    }
    const { error: insertErr } = await supabase.from('measurements').insert(payload);
    setSaving(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setValues({});
    onSaved?.();
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.grid}>
        {FIELDS.map((f) => (
          <View key={f.key} style={styles.gridItem}>
            <Input
              label={f.label}
              placeholder="—"
              keyboardType="decimal-pad"
              value={values[f.key] ?? ''}
              onChangeText={(t) => setValues((prev) => ({ ...prev, [f.key]: t }))}
            />
          </View>
        ))}
      </View>
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <Button label="Save measurement" onPress={save} loading={saving} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { flexBasis: '47%', flexGrow: 1 },
});

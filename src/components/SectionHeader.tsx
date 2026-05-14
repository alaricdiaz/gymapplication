import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <Text style={[styles.action, { color: theme.colors.primary }]}>{action.label}</Text>
          <Icon name="chevronRight" size={14} color={theme.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  action: { fontSize: 13, fontWeight: '700' },
});

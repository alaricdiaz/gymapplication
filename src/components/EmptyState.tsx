import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {icon}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{description}</Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  title: { fontSize: 17, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
});

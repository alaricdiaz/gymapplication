import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';

interface OptionCardProps {
  emoji?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  recommended?: boolean;
  disabled?: boolean;
}

export function OptionCard({
  emoji,
  title,
  description,
  selected,
  onPress,
  recommended,
  disabled,
}: OptionCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync().catch(() => undefined);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          opacity: disabled ? 0.4 : pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {emoji ? (
          <View
            style={[
              styles.emojiWrap,
              {
                backgroundColor: selected ? theme.colors.surface : theme.colors.surfaceMuted,
              },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            {recommended ? (
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>REKOMENDASI</Text>
              </LinearGradient>
            ) : null}
          </View>
          {description ? (
            <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{description}</Text>
          ) : null}
        </View>
        {selected ? (
          <View style={[styles.checkWrap, { backgroundColor: theme.colors.primary }]}>
            <Icon name="check" size={14} color="#fff" strokeWidth={3} />
          </View>
        ) : (
          <View style={[styles.unCheck, { borderColor: theme.colors.borderStrong }]} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 18 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
});

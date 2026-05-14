import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/Icon';

interface ListItemProps {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  style?: ViewStyle;
}

export function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  showChevron,
  danger,
  style,
}: ListItemProps) {
  const theme = useTheme();
  const Component = onPress ? Pressable : View;
  return (
    <Component
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean } = {}) => [
        styles.item,
        {
          backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
        },
        style,
      ]}
    >
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={[
            styles.title,
            { color: danger ? theme.colors.danger : theme.colors.text },
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Icon name="chevronRight" size={18} color={theme.colors.textDim} /> : null}
    </Component>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  title: { fontSize: 15, fontWeight: '600' },
  desc: { fontSize: 12 },
});

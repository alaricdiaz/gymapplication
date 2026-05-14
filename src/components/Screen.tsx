import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ThemeProvider';

interface ScreenProps extends PropsWithChildren {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  noPadding?: boolean;
  scroll?: boolean;
}

export function Screen({ children, edges = ['top'], style, noPadding }: ScreenProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={edges}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View
        style={[
          styles.inner,
          { paddingHorizontal: noPadding ? 0 : theme.spacing.lg },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});

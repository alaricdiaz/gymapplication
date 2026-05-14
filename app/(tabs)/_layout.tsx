import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { Icon } from '@/components/Icon';

export default function TabsLayout() {
  const theme = useTheme();
  const session = useAuth((s) => s.session);
  const loading = useAuth((s) => s.loading);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [loading, session]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrap focused={focused} icon="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrap focused={focused} icon="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrap focused={focused} icon="dumbbell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrap focused={focused} icon="chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrap focused={focused} icon="sparkles" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIconWrap({
  focused,
  icon,
  color,
}: {
  focused: boolean;
  icon: 'home' | 'list' | 'dumbbell' | 'chart' | 'sparkles';
  color: string;
}) {
  const theme = useTheme();
  if (focused) {
    return (
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.focusBubble}
      >
        <Icon name={icon} size={20} color="#fff" />
      </LinearGradient>
    );
  }
  return (
    <View style={styles.iconWrap}>
      <Icon name={icon} size={22} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', width: 40, height: 32 },
  focusBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';

export default function OnboardingWelcome() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E13' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0A0E13', '#1A0E0B', '#3D1F12']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(242, 90, 31, 0.4)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.headerArea}>
          <View style={styles.logoCircle}>
            <Text style={{ fontSize: 36 }}>🔥</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.kicker}>FORGE</Text>
          <Text style={styles.headline}>
            Bingung mulai{'\n'}
            <Text style={{ color: '#FF8951' }}>gym?</Text>
          </Text>
          <Text style={styles.subline}>
            Forge bikinin program 12 minggu khusus lo. Pemula bisa langsung jalan dari hari pertama.
          </Text>

          <View style={styles.bullets}>
            <BulletRow text="Plan 12 minggu auto-generate" />
            <BulletRow text="Adapt sama umur, badan & cedera lo" />
            <BulletRow text="Bahasa Indonesia, gaya tongkrongan" />
            <BulletRow text="Bayar sekali, pakai selamanya" />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Bikin Plan Gw"
            onPress={() => router.push('/onboarding/step-1')}
            fullWidth
            size="lg"
            variant="gradient"
            trailing={<Icon name="arrowRight" size={18} color="#fff" />}
          />
          <Pressable
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ alignSelf: 'center', paddingVertical: 12 }}
          >
            <Text style={styles.signinText}>
              Udah punya akun? <Text style={{ color: '#FF8951', fontWeight: '700' }}>Masuk</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function BulletRow({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.checkCircle}>
        <Icon name="check" size={12} color="#fff" strokeWidth={3} />
      </View>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerArea: { alignItems: 'center', paddingTop: 60 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,44,0.4)',
  },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 14 },
  kicker: { color: '#FF8951', fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  headline: { color: '#fff', fontSize: 44, fontWeight: '800', letterSpacing: -1.5, lineHeight: 48 },
  subline: { color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 24 },
  bullets: { gap: 12, marginTop: 18 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F25A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  footer: { padding: 28, gap: 8 },
  signinText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
});

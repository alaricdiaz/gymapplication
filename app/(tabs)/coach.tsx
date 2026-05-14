import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/components/ThemeProvider';
import { askCoach } from '@/lib/coach';
import { useProfile } from '@/stores/profile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  { emoji: '🏋️', label: 'Plan workout hari ini' },
  { emoji: '🤔', label: 'Kenapa lutut gw sakit pas squat?' },
  { emoji: '🍱', label: 'Berapa kalori buat bulking?' },
  { emoji: '💪', label: 'Form bench press yang bener?' },
  { emoji: '⏰', label: 'Skip workout 3 hari, harus gimana?' },
  { emoji: '🎯', label: 'Cara naikin berat squat lo' },
];

export default function CoachScreen() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', content }]);
    setDraft('');
    setLoading(true);
    try {
      const reply = await askCoach([...messages, { role: 'user', content }]);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      Alert.alert('Coach gak tersedia', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: theme.colors.primary }]}>FORGE COACH</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>AI Coach</Text>
          </View>
          <View style={styles.usageBadge}>
            <Icon name="sparkles" size={14} color={theme.colors.primary} />
            <Text style={[styles.usageText, { color: theme.colors.text }]}>30/30</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <>
              {/* Hero card with today's plan */}
              <LinearGradient
                colors={theme.gradients.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>🤖</Text>
                  <Text style={styles.heroKicker}>PLAN LO HARI INI</Text>
                </View>
                <Text style={styles.heroName}>
                  Push Day · Week 3 / 12
                </Text>
                <View style={styles.heroBullets}>
                  <HeroBullet text="Bench Press · 5×5 · 42.5 kg (+2.5)" />
                  <HeroBullet text="Overhead Press · 5×5 · 25 kg" />
                  <HeroBullet text="Tricep Pushdown · 3×10 · 20 kg" />
                </View>
                <Text style={styles.heroNote}>
                  💡 Lo tidur cukup minggu ini. Push intensity normal.
                </Text>
              </LinearGradient>

              {/* Greeting */}
              <Card padding={16}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <View style={[styles.coachAvatar, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={{ fontSize: 22 }}>🤖</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.coachName, { color: theme.colors.text }]}>
                      Forge Coach
                    </Text>
                    <Text style={[styles.coachMsg, { color: theme.colors.text }]}>
                      Halo {profile.nickname || 'bro'}! Gw Forge Coach. Tanya gw soal{' '}
                      <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>workout</Text>,{' '}
                      <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>form</Text>,{' '}
                      <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>nutrisi</Text>, atau cedera. Gw bakal sesuaiin sama profile lo.
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Suggestions */}
              <Text style={[styles.suggestionLabel, { color: theme.colors.textMuted }]}>
                COBA TANYA INI
              </Text>
              <View style={{ gap: 8 }}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => send(s.label)}
                    style={({ pressed }) => [
                      styles.suggestion,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 13,
                        fontWeight: '600',
                        flex: 1,
                      }}
                    >
                      {s.label}
                    </Text>
                    <Icon name="arrowRight" size={14} color={theme.colors.textDim} />
                  </Pressable>
                ))}
              </View>

              {/* Disclaimer */}
              <Card variant="muted" padding={12}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 14 }}>⚠️</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11, lineHeight: 16, flex: 1 }}>
                    AI bisa salah. Buat masalah kesehatan/cedera serius, tetep konsul ke dokter atau PT real.
                  </Text>
                </View>
              </Card>
            </>
          ) : null}

          {messages.map((m, idx) => (
            <View
              key={idx}
              style={[
                styles.bubbleWrap,
                { alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' },
              ]}
            >
              {m.role === 'assistant' ? (
                <View style={styles.avatarBubble}>
                  <View style={[styles.coachAvatarSmall, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={{ fontSize: 14 }}>🤖</Text>
                  </View>
                </View>
              ) : null}
              <View
                style={[
                  styles.bubble,
                  m.role === 'user'
                    ? {
                        backgroundColor: theme.colors.primary,
                        borderBottomRightRadius: 4,
                      }
                    : {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        borderWidth: 1,
                        borderBottomLeftRadius: 4,
                      },
                ]}
              >
                <Text
                  style={{
                    color: m.role === 'user' ? '#fff' : theme.colors.text,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {m.content}
                </Text>
              </View>
            </View>
          ))}
          {loading ? (
            <View style={[styles.bubbleWrap, { alignSelf: 'flex-start' }]}>
              <View style={styles.avatarBubble}>
                <View style={[styles.coachAvatarSmall, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
              </View>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderBottomLeftRadius: 4,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Dot delay={0} />
                  <Dot delay={150} />
                  <Dot delay={300} />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Composer */}
        <View
          style={[
            styles.composer,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Tanya coach..."
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => send()}
              returnKeyType="send"
              multiline
              containerStyle={{ flex: 1 }}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 0,
                paddingHorizontal: 0,
                minHeight: 36,
                maxHeight: 100,
              }}
            />
          </View>
          <Pressable
            onPress={() => send()}
            disabled={!draft.trim() || loading}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={
                draft.trim()
                  ? theme.gradients.primary
                  : ([theme.colors.surfaceMuted, theme.colors.surfaceMuted] as const)
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Icon
                name="arrowRight"
                size={18}
                color={draft.trim() ? '#fff' : theme.colors.textDim}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function HeroBullet({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <View style={styles.heroDot} />
      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{text}</Text>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.textMuted,
        opacity: 0.4 + (delay % 3) * 0.2,
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(242,90,31,0.1)',
    borderRadius: 999,
  },
  usageText: { fontSize: 12, fontWeight: '700' },
  heroCard: { padding: 18, borderRadius: 20, gap: 4 },
  heroKicker: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroName: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  heroBullets: { marginTop: 8, gap: 2 },
  heroDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  heroNote: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 10,
  },
  coachAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  coachMsg: { fontSize: 14, lineHeight: 20 },
  suggestionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bubbleWrap: {
    flexDirection: 'row',
    gap: 6,
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  avatarBubble: { paddingBottom: 4 },
  bubble: {
    padding: 12,
    borderRadius: 16,
    flexShrink: 1,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

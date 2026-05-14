import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ProgressRing } from '@/components/ProgressRing';
import { useTheme } from '@/components/ThemeProvider';
import { formatDuration } from '@/lib/format';

type Mode = 'rest' | 'hiit' | 'amrap' | 'emom';
type Phase = 'idle' | 'work' | 'rest' | 'done';

interface Config {
  work: number;
  rest: number;
  rounds: number;
}

interface Preset {
  mode: Mode;
  emoji: string;
  label: string;
  description: string;
  config: Config;
}

const PRESETS: Preset[] = [
  {
    mode: 'rest',
    emoji: '⏱️',
    label: 'Rest Timer',
    description: 'Countdown istirahat antar set · default 90 detik.',
    config: { work: 0, rest: 90, rounds: 1 },
  },
  {
    mode: 'hiit',
    emoji: '🔥',
    label: 'HIIT 30/30',
    description: '30 detik kerja, 30 detik rest, 10 ronde.',
    config: { work: 30, rest: 30, rounds: 10 },
  },
  {
    mode: 'hiit',
    emoji: '⚡',
    label: 'Tabata',
    description: '20 detik kerja, 10 detik rest, 8 ronde (4 menit total).',
    config: { work: 20, rest: 10, rounds: 8 },
  },
  {
    mode: 'emom',
    emoji: '🎯',
    label: 'EMOM 10',
    description: 'On the minute, every minute. 10 ronde.',
    config: { work: 0, rest: 60, rounds: 10 },
  },
  {
    mode: 'amrap',
    emoji: '💪',
    label: 'AMRAP 12',
    description: 'As many rounds as possible dalam 12 menit.',
    config: { work: 720, rest: 0, rounds: 1 },
  },
];

export default function TimerScreen() {
  const theme = useTheme();
  const [activePreset, setActivePreset] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(PRESETS[0].config.rest);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  const roundRef = useRef(round);

  const cfg = PRESETS[activePreset];

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreset]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          tickPhase();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function tickPhase() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    const next = nextPhase();
    if (!next) {
      setPhase('done');
      setRunning(false);
      return;
    }
    setPhase(next.phase);
    setRemaining(next.duration);
    setRound(next.round);
  }

  function nextPhase(): { phase: 'work' | 'rest'; duration: number; round: number } | null {
    if (cfg.mode === 'rest') return null;
    if (cfg.mode === 'amrap') return null;
    const currentPhase = phaseRef.current;
    const currentRound = roundRef.current;
    if (currentPhase === 'work' && cfg.config.rest > 0) {
      return { phase: 'rest', duration: cfg.config.rest, round: currentRound };
    }
    if (currentRound + 1 > cfg.config.rounds) return null;
    return {
      phase: 'work',
      duration: cfg.config.work > 0 ? cfg.config.work : cfg.config.rest,
      round: currentRound + 1,
    };
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setRound(1);
    setPhase('idle');
    setRemaining(cfg.config.work > 0 ? cfg.config.work : cfg.config.rest);
  }

  function toggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (phase === 'idle' || phase === 'done') {
      setPhase(cfg.config.work > 0 ? 'work' : 'rest');
      setRemaining(cfg.config.work > 0 ? cfg.config.work : cfg.config.rest);
      setRound(1);
    }
    setRunning((r) => !r);
  }

  const totalDuration = useMemo(() => {
    if (phase === 'rest') return cfg.config.rest;
    if (phase === 'work') return cfg.config.work > 0 ? cfg.config.work : cfg.config.rest;
    return cfg.config.work > 0 ? cfg.config.work : cfg.config.rest;
  }, [cfg, phase]);

  const phaseColor =
    phase === 'work'
      ? theme.colors.primary
      : phase === 'rest'
        ? theme.colors.accent
        : phase === 'done'
          ? theme.colors.success
          : theme.colors.textMuted;
  const phaseGradient =
    phase === 'rest'
      ? theme.gradients.accent
      : phase === 'done'
        ? theme.gradients.success
        : theme.gradients.primary;
  const phaseLabel =
    phase === 'idle'
      ? 'READY'
      : phase === 'work'
        ? 'WORK'
        : phase === 'rest'
          ? 'REST'
          : 'DONE';
  const phaseSub =
    phase === 'idle'
      ? cfg.config.rounds > 1
        ? `${cfg.config.rounds} ronde siap dijalanin`
        : 'Tap Start buat mulai countdown'
      : phase === 'work'
        ? `Ronde ${round} dari ${cfg.config.rounds} · gaspol!`
        : phase === 'rest'
          ? `Ronde ${round} kelar · tarik napas`
          : 'Mantap, semua ronde kelar!';
  const showRing = totalDuration > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="chevronLeft" size={20} color={theme.colors.text} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
            TIMER MODE
          </Text>
          <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>
            {cfg.emoji} {cfg.label}
          </Text>
        </View>
        <Pressable
          onPress={reset}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="close" size={18} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
      >
        <Card padding={20} style={{ alignItems: 'center', gap: 16 }}>
          <View
            style={[
              styles.phasePill,
              { backgroundColor: phaseColor + '20', borderColor: phaseColor + '55' },
            ]}
          >
            <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
            <Text style={[styles.phasePillText, { color: phaseColor }]}>{phaseLabel}</Text>
          </View>

          {showRing ? (
            <ProgressRing
              value={remaining}
              total={totalDuration}
              size={240}
              stroke={14}
              variant={phase === 'rest' ? 'primary' : 'primary'}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.bigTime, { color: theme.colors.text }]}>
                  {formatDuration(remaining)}
                </Text>
                {cfg.config.rounds > 1 && phase !== 'idle' && phase !== 'done' ? (
                  <Text
                    style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 }}
                  >
                    Ronde {round} / {cfg.config.rounds}
                  </Text>
                ) : null}
              </View>
            </ProgressRing>
          ) : (
            <View style={{ paddingVertical: 60 }}>
              <Text style={[styles.bigTime, { color: theme.colors.text }]}>
                {formatDuration(remaining)}
              </Text>
            </View>
          )}

          <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
            {phaseSub}
          </Text>

          {cfg.config.rounds > 1 ? (
            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: cfg.config.rounds }).map((_, i) => {
                const done = i + 1 < round || phase === 'done';
                const current = i + 1 === round && phase !== 'idle' && phase !== 'done';
                return (
                  <View
                    key={i}
                    style={[
                      styles.roundDot,
                      {
                        backgroundColor: done
                          ? theme.colors.success
                          : current
                            ? phaseColor
                            : theme.colors.surfaceMuted,
                        width: current ? 28 : 10,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <Pressable
              onPress={toggle}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={phaseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bigBtn}
              >
                <Icon name={running ? 'pause' : 'play'} size={18} color="#fff" />
                <Text style={styles.bigBtnText}>
                  {running ? 'Jeda' : phase === 'done' ? 'Mulai Lagi' : phase === 'idle' ? 'Start' : 'Lanjut'}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={reset}
              style={[
                styles.resetBtn,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Icon name="close" size={16} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>Reset</Text>
            </Pressable>
          </View>
        </Card>

        <View style={{ marginTop: 4 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preset</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
            Pilih mode yang lo butuhin. Geser ke samping buat coba yang lain.
          </Text>
        </View>

        {PRESETS.map((p, idx) => {
          const active = idx === activePreset;
          return (
            <Pressable
              key={p.label}
              onPress={() => {
                Haptics.selectionAsync().catch(() => undefined);
                setActivePreset(idx);
              }}
            >
              {active ? (
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.presetActive}
                >
                  <PresetContent p={p} active />
                </LinearGradient>
              ) : (
                <Card padding={14}>
                  <PresetContent p={p} active={false} />
                </Card>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function PresetContent({ p, active }: { p: Preset; active: boolean }) {
  const theme = useTheme();
  const tone = active ? '#fff' : theme.colors.text;
  const muted = active ? 'rgba(255,255,255,0.85)' : theme.colors.textMuted;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={[
          styles.presetIcon,
          {
            backgroundColor: active ? 'rgba(255,255,255,0.2)' : theme.colors.primary + '14',
          },
        ]}
      >
        <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: tone, fontWeight: '800', fontSize: 15 }}>{p.label}</Text>
        <Text style={{ color: muted, fontSize: 12, marginTop: 2 }}>{p.description}</Text>
      </View>
      {active ? (
        <View style={styles.activeChip}>
          <Icon name="check" size={14} color="#fff" />
        </View>
      ) : (
        <Icon name="chevronRight" size={16} color={theme.colors.textDim} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  phaseDot: { width: 8, height: 8, borderRadius: 999 },
  phasePillText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bigTime: { fontSize: 56, fontWeight: '800', letterSpacing: -1 },
  roundDot: { height: 10, borderRadius: 999 },
  bigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bigBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  presetActive: { padding: 14, borderRadius: 18 },
  presetIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activeChip: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

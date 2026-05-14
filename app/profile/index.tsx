import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { BODY_AREA_LABELS } from '@/components/BodyDiagram';
import { useTheme } from '@/components/ThemeProvider';
import {
  useProfile,
  computeCompletionPct,
  GOAL_LABELS,
  EXPERIENCE_LABELS,
  EQUIPMENT_LABELS,
} from '@/stores/profile';
import { useAuth } from '@/stores/auth';

export default function ProfileScreen() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const user = useAuth((s) => s.user);
  const completion = computeCompletionPct(profile);
  const tier1 = profile.nickname && profile.age && profile.goal && profile.experience;
  const tier2 = profile.sleepHours && profile.stressLevel && profile.dietPreference;
  const tier3 = profile.bodyFatPct && profile.motivationWhy;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="chevronLeft" size={18} color={theme.colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profil Lo</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="settings" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        {/* Avatar Card */}
        <LinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarCard}
        >
          <View style={styles.avatarRow}>
            <Avatar name={profile.nickname || user?.email || 'F'} size={68} variant="neutral" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.profileName}>{profile.nickname || 'Forge User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {profile.age ? (
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>{profile.age} thn</Text>
                  </View>
                ) : null}
                {profile.gender ? (
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>
                      {profile.gender === 'male' ? '♂ Cowok' : profile.gender === 'female' ? '♀ Cewek' : '✨ Other'}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.completionBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.completionLabel}>PROFIL LENGKAP</Text>
              <Text style={styles.completionPct}>{completion}%</Text>
            </View>
            <View style={styles.completionTrack}>
              <View style={[styles.completionFill, { width: `${completion}%` }]} />
            </View>
          </View>
        </LinearGradient>

        {/* 3-Tier Status */}
        <View style={{ gap: 10 }}>
          <SectionHeader
            title="Tier Profil"
            subtitle="Makin lengkap, makin akurat plan lo"
          />
          <TierRow
            tier={1}
            title="Essential"
            time="5 menit"
            done={!!tier1}
            mandatory
            description="Nama, umur, tinggi/berat, goal, experience, equipment"
            onEdit={() => router.push('/onboarding/step-1')}
          />
          <TierRow
            tier={2}
            title="Smart Plan"
            time="10 menit"
            done={!!tier2}
            description="Body fat, sleep, stress, lifestyle, nutrition"
            onEdit={() => {}}
          />
          <TierRow
            tier={3}
            title="Deep Profile"
            time="Optional"
            done={!!tier3}
            description="Medical, sport history, performance baseline, motivasi"
            onEdit={() => {}}
          />
        </View>

        {/* Body Stats */}
        {(profile.heightCm || profile.weightKg) ? (
          <View style={{ gap: 10 }}>
            <SectionHeader title="Data Badan" />
            <Card padding={16}>
              <View style={styles.bodyStatsRow}>
                <BodyStat label="Tinggi" value={profile.heightCm} unit="cm" />
                <Divider />
                <BodyStat label="Berat" value={profile.weightKg} unit="kg" />
                <Divider />
                <BodyStat
                  label="BMI"
                  value={
                    profile.heightCm && profile.weightKg
                      ? Math.round((profile.weightKg / Math.pow(profile.heightCm / 100, 2)) * 10) / 10
                      : undefined
                  }
                />
              </View>
            </Card>
          </View>
        ) : null}

        {/* Training Setup */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Training Setup" />
          <View style={{ gap: 8 }}>
            <DataRow
              icon="🎯"
              label="Goal"
              value={profile.goal ? GOAL_LABELS[profile.goal] : 'Belum di-set'}
              onPress={() => {}}
            />
            <DataRow
              icon="📈"
              label="Experience"
              value={profile.experience ? EXPERIENCE_LABELS[profile.experience] : 'Belum di-set'}
              onPress={() => {}}
            />
            <DataRow
              icon="📅"
              label="Jadwal"
              value={
                profile.daysPerWeek
                  ? `${profile.daysPerWeek} hari/minggu · ${profile.sessionDurationMin}min`
                  : 'Belum di-set'
              }
              onPress={() => {}}
            />
            <DataRow
              icon="🏋️"
              label="Equipment"
              value={profile.equipment ? EQUIPMENT_LABELS[profile.equipment] : 'Belum di-set'}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Injuries */}
        <View style={{ gap: 10 }}>
          <SectionHeader
            title="Cedera & Limitasi"
            action={{ label: 'Edit', onPress: () => router.push('/onboarding/step-8') }}
          />
          {profile.injuries.length === 0 ? (
            <Card variant="success" padding={14}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="check" size={20} color={theme.colors.success} strokeWidth={3} />
                <Text style={{ color: theme.colors.text, flex: 1, fontSize: 13 }}>
                  Belum ada cedera tercatat
                </Text>
              </View>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {profile.injuries.map((inj) => (
                <Card key={inj.area} variant="danger" padding={12}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 18 }}>🩹</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>
                        {BODY_AREA_LABELS[inj.area]}
                      </Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                        {inj.status === 'active' ? 'Saat ini sakit' : inj.status === 'recovered' ? 'Recovered' : 'Post-op'}
                        {' · '}
                        {inj.severity === 'mild' ? 'Ringan' : inj.severity === 'moderate' ? 'Sedang' : 'Berat'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Achievements / PR */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Achievement" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AchievementCard emoji="🔥" value="0" label="Streak Day" />
            <AchievementCard emoji="🏆" value="0" label="PR" />
            <AchievementCard emoji="💪" value="0" label="Sesi" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TierRow({
  tier,
  title,
  time,
  done,
  mandatory,
  description,
  onEdit,
}: {
  tier: number;
  title: string;
  time: string;
  done: boolean;
  mandatory?: boolean;
  description: string;
  onEdit: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onEdit}>
      <Card padding={14}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={[
              styles.tierBadge,
              {
                backgroundColor: done ? theme.colors.success : theme.colors.primarySoft,
              },
            ]}
          >
            {done ? (
              <Icon name="check" size={16} color="#fff" strokeWidth={3} />
            ) : (
              <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 14 }}>{tier}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>{title}</Text>
              {mandatory ? <Badge label="Wajib" variant="danger" size="sm" /> : null}
              {done ? <Badge label="Done" variant="success" size="sm" /> : null}
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={2}>
              {description}
            </Text>
            <Text style={{ color: theme.colors.textDim, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
              ⏱ {time}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
        </View>
      </Card>
    </Pressable>
  );
}

function DataRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Card padding={14}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.dataIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
              {label.toUpperCase()}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
              {value}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={theme.colors.textDim} />
        </View>
      </Card>
    </Pressable>
  );
}

function BodyStat({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>
        {value ?? '–'}
        {unit && value ? <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textMuted }}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ width: 1, height: 32, backgroundColor: theme.colors.border }} />;
}

function AchievementCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  const theme = useTheme();
  return (
    <Card padding={14} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: '700' }}>{label.toUpperCase()}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  avatarCard: { padding: 20, borderRadius: 20, gap: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  profileEmail: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  profileBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  profileBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  completionBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  completionLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  completionPct: { color: '#fff', fontSize: 14, fontWeight: '800' },
  completionTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  completionFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  tierBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyStatsRow: { flexDirection: 'row', alignItems: 'center' },
});

import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  requirement: string;
}

interface ActivityItem {
  id: string;
  userName: string;
  initials: string;
  action: string;
  timeAgo: string;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak_7', title: '7-Day Streak', description: 'Logged health data 7 days in a row', icon: 'flame', color: '#EF4444', earned: true, earnedDate: '2026-01-28', requirement: '7 consecutive days logged' },
  { id: 'streak_30', title: '30-Day Streak', description: 'Logged health data 30 days in a row', icon: 'flame', color: '#F97316', earned: false, progress: 47, requirement: '30 consecutive days logged' },
  { id: 'sleep_master', title: 'Sleep Master', description: 'Averaged 8+ hours of sleep for a week', icon: 'moon', color: '#6366F1', earned: true, earnedDate: '2026-02-01', requirement: '8+ hours average sleep for 7 days' },
  { id: 'iron_will', title: 'Iron Will', description: 'Completed 10 workouts in a month', icon: 'barbell', color: '#10B981', earned: false, progress: 60, requirement: '10 workouts in one month' },
  { id: 'nutrition_pro', title: 'Nutrition Pro', description: 'Logged all meals for 5 consecutive days', icon: 'nutrition', color: '#F59E0B', earned: true, earnedDate: '2026-02-03', requirement: 'All meals logged for 5 days' },
  { id: 'pt_champion', title: 'PT Champion', description: 'Completed PT routine 10 times', icon: 'ribbon', color: '#8B5CF6', earned: false, progress: 30, requirement: '10 PT routines completed' },
  { id: 'mindful', title: 'Mindful Warrior', description: 'Meditated 5 times', icon: 'leaf', color: '#14B8A6', earned: false, progress: 80, requirement: '5 meditation sessions' },
  { id: 'early_bird', title: 'Early Bird', description: 'Logged a check-in before 8 AM 3 times', icon: 'sunny', color: '#FBBF24', earned: true, earnedDate: '2026-01-30', requirement: '3 check-ins before 8 AM' },
];

const FRIEND_ACTIVITY: ActivityItem[] = [
  { id: '1', userName: 'Alex M.', initials: 'AM', action: 'earned the 7-Day Streak badge', timeAgo: '2h ago', color: '#EF4444' },
  { id: '2', userName: 'Sam K.', initials: 'SK', action: 'completed a PT routine', timeAgo: '4h ago', color: '#8B5CF6' },
  { id: '3', userName: 'Jordan T.', initials: 'JT', action: 'logged a new personal record', timeAgo: '6h ago', color: '#10B981' },
  { id: '4', userName: 'Riley P.', initials: 'RP', action: 'reached their nutrition goal', timeAgo: '8h ago', color: '#F59E0B' },
  { id: '5', userName: 'Casey D.', initials: 'CD', action: 'completed a 30-day streak!', timeAgo: '1d ago', color: '#F97316' },
];

const earnedCount = ACHIEVEMENTS.filter(a => a.earned).length;

const shareAchievement = async (achievement: Achievement) => {
  try {
    await Share.share({
      message: `I earned the "${achievement.title}" badge on GrowthTrack! ${achievement.description}`,
      title: 'GrowthTrack Achievement',
    });
  } catch (error) {
    // Silently handle
  }
};

const shareWeeklySummary = async () => {
  try {
    await Share.share({
      message: 'My GrowthTrack Weekly Summary: 5 days logged, 3 workouts completed, 7.8 hrs avg sleep. Staying on track!',
      title: 'GrowthTrack Weekly Summary',
    });
  } catch (error) {
    // Silently handle
  }
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View style={styles.achievementCardWrapper}>
      <Card style={[styles.achievementCard, !achievement.earned ? styles.achievementCardUnearned : undefined]}>
        <View style={[styles.achievementIconContainer, { backgroundColor: achievement.earned ? achievement.color + '20' : '#F1F5F9' }]}>
          <Ionicons
            name={achievement.icon as any}
            size={28}
            color={achievement.earned ? achievement.color : '#94A3B8'}
          />
          {achievement.earned ? (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          ) : null}
        </View>
        <Text
          style={[styles.achievementTitle, !achievement.earned ? styles.achievementTitleUnearned : undefined]}
          testID={`text-achievement-${achievement.id}`}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
        <Text style={styles.achievementDescription} numberOfLines={2}>
          {achievement.description}
        </Text>
        {achievement.earned ? (
          <View style={styles.earnedSection}>
            <Text style={styles.earnedDate}>
              Earned {new Date(achievement.earnedDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareAchievement(achievement)}
              testID={`button-share-${achievement.id}`}
            >
              <Ionicons name="share-outline" size={14} color="#3B82F6" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${achievement.progress || 0}%`, backgroundColor: achievement.color }]} />
            </View>
            <Text style={styles.progressText}>{achievement.progress}%</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <Card style={styles.activityCard} testID={`card-activity-${item.id}`}>
      <View style={styles.activityRow}>
        <View style={[styles.avatar, { backgroundColor: item.color + '20' }]}>
          <Text style={[styles.avatarText, { color: item.color }]}>{item.initials}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.activityUserName}>{item.userName}</Text>
            {' '}{item.action}
          </Text>
          <Text style={styles.activityTime}>{item.timeAgo}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function SocialScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Social</Text>
          <Text style={styles.subtitle}>Achievements & Community</Text>
        </View>

        <Card style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <Text style={styles.weeklyTitle}>This Week</Text>
          </View>
          <View style={styles.weeklyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Days Logged</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7.8h</Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.shareWeeklyButton}
            onPress={shareWeeklySummary}
            testID="button-share-weekly"
          >
            <Ionicons name="share-outline" size={16} color="#FFFFFF" />
            <Text style={styles.shareWeeklyText}>Share Weekly Summary</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionBadge}>{earnedCount}/{ACHIEVEMENTS.length} earned</Text>
        </View>

        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friend Activity</Text>
        </View>

        {FRIEND_ACTIVITY.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  weeklyCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weeklyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  shareWeeklyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
  },
  shareWeeklyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionBadge: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  achievementCardWrapper: {
    width: '50%',
    padding: 8,
  },
  achievementCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  achievementCardUnearned: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleUnearned: {
    color: '#94A3B8',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 15,
  },
  earnedSection: {
    alignItems: 'center',
    width: '100%',
  },
  earnedDate: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    minWidth: 28,
  },
  activityCard: {
    marginHorizontal: 24,
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  activityUserName: {
    fontWeight: '700',
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});

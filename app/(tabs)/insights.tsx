import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Line, Path, Text as SvgText, G } from 'react-native-svg';
import { Card } from '@/components/ui';
import { useCheckins, useSleepLogs, useWorkoutLogs } from '@/hooks/useApi';
import type { SleepLog, WorkoutLog, DailyCheckin } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PADDING = 48;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2 - 8;
const CHART_HEIGHT = 180;
const Y_LABEL_WIDTH = 30;
const PLOT_WIDTH = CHART_WIDTH - Y_LABEL_WIDTH;

const getDayLabel = (dateStr: string) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
};

const buildLinePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

const getWorkoutColor = (type: string) => {
  const lower = type.toLowerCase();
  if (lower.includes('strength') || lower.includes('weight') || lower.includes('lift')) return '#EF4444';
  if (lower.includes('cardio') || lower.includes('run') || lower.includes('swim') || lower.includes('bike') || lower.includes('cycling')) return '#3B82F6';
  return '#10B981';
};

const getMoodEmoji = (mood: number) => {
  if (mood >= 4.5) return 'happy';
  if (mood >= 3.5) return 'happy-outline';
  if (mood >= 2.5) return 'sad-outline';
  return 'sad';
};

function SleepChart({ data }: { data: SleepLog[] }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <View style={styles.emptyChart} testID="sleep-chart-empty">
        <Ionicons name="moon-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyChartText}>No sleep data yet</Text>
        <Text style={styles.emptyChartSubtext}>Log your sleep to see trends</Text>
      </View>
    );
  }

  const sorted = [...safeData].sort((a, b) => a.date.localeCompare(b.date));
  const maxY = 12;
  const minY = 0;
  const yRange = maxY - minY;
  const topPad = 10;
  const bottomPad = 30;
  const plotHeight = CHART_HEIGHT - topPad - bottomPad;

  const points = sorted.map((item, i) => {
    const hours = parseFloat(item.totalHours) || 0;
    const x = Y_LABEL_WIDTH + (sorted.length === 1 ? PLOT_WIDTH / 2 : (i / (sorted.length - 1)) * PLOT_WIDTH);
    const y = topPad + plotHeight - ((hours - minY) / yRange) * plotHeight;
    return { x, y, hours, date: item.date };
  });

  const recommendedY = topPad + plotHeight - ((8 - minY) / yRange) * plotHeight;

  return (
    <View testID="sleep-chart">
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {[0, 4, 8, 12].map((val) => {
          const y = topPad + plotHeight - ((val - minY) / yRange) * plotHeight;
          return (
            <G key={`grid-${val}`}>
              <Line x1={Y_LABEL_WIDTH} y1={y} x2={CHART_WIDTH} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <SvgText x={0} y={y + 4} fontSize={10} fill="#94A3B8">{val}h</SvgText>
            </G>
          );
        })}
        <Line
          x1={Y_LABEL_WIDTH}
          y1={recommendedY}
          x2={CHART_WIDTH}
          y2={recommendedY}
          stroke="#10B981"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <SvgText x={CHART_WIDTH - 25} y={recommendedY - 6} fontSize={9} fill="#10B981">8h goal</SvgText>
        {points.length > 1 ? (
          <Path d={buildLinePath(points)} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {points.map((p, i) => (
          <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill="#10B981" stroke="#fff" strokeWidth={2} />
        ))}
        {points.map((p, i) => (
          <SvgText key={`label-${i}`} x={p.x} y={CHART_HEIGHT - 5} fontSize={9} fill="#64748B" textAnchor="middle">
            {getDayLabel(p.date)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

function WorkoutChart({ data }: { data: WorkoutLog[] }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <View style={styles.emptyChart} testID="workout-chart-empty">
        <Ionicons name="barbell-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyChartText}>No workout data yet</Text>
        <Text style={styles.emptyChartSubtext}>Log workouts to track activity</Text>
      </View>
    );
  }

  const grouped: Record<string, WorkoutLog[]> = {};
  safeData.forEach((w) => {
    const d = w.date.split('T')[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(w);
  });

  const dates = Object.keys(grouped).sort();
  const maxCount = Math.max(...dates.map((d) => grouped[d].length), 1);
  const topPad = 10;
  const bottomPad = 30;
  const plotHeight = CHART_HEIGHT - topPad - bottomPad;
  const barWidth = Math.min(30, (PLOT_WIDTH / dates.length) * 0.6);
  const gap = (PLOT_WIDTH - barWidth * dates.length) / (dates.length + 1);

  return (
    <View testID="workout-chart">
      <View style={styles.workoutLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Strength</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Cardio</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Other</Text>
        </View>
      </View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {[0, 1, 2, 3, 4].map((val) => {
          if (val > maxCount + 1) return null;
          const y = topPad + plotHeight - (val / Math.max(maxCount, 3)) * plotHeight;
          return (
            <G key={`wgrid-${val}`}>
              <Line x1={Y_LABEL_WIDTH} y1={y} x2={CHART_WIDTH} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <SvgText x={0} y={y + 4} fontSize={10} fill="#94A3B8">{val}</SvgText>
            </G>
          );
        })}
        {dates.map((date, i) => {
          const workouts = grouped[date];
          const x = Y_LABEL_WIDTH + gap + i * (barWidth + gap);
          let yOffset = 0;
          return (
            <G key={`bar-${i}`}>
              {workouts.map((w, j) => {
                const segHeight = (1 / Math.max(maxCount, 3)) * plotHeight;
                const segY = topPad + plotHeight - yOffset - segHeight;
                yOffset += segHeight;
                return (
                  <Rect
                    key={`seg-${i}-${j}`}
                    x={x}
                    y={segY}
                    width={barWidth}
                    height={segHeight - 1}
                    rx={3}
                    fill={getWorkoutColor(w.workoutType)}
                  />
                );
              })}
              <SvgText x={x + barWidth / 2} y={CHART_HEIGHT - 5} fontSize={9} fill="#64748B" textAnchor="middle">
                {getDayLabel(date)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function MoodEnergyChart({ data }: { data: DailyCheckin[] }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <View style={styles.emptyChart} testID="mood-chart-empty">
        <Ionicons name="heart-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyChartText}>No check-in data yet</Text>
        <Text style={styles.emptyChartSubtext}>Daily check-ins reveal mood and energy trends</Text>
      </View>
    );
  }

  const sorted = [...safeData].sort((a, b) => a.date.localeCompare(b.date));
  const maxY = 5;
  const minY = 1;
  const yRange = maxY - minY;
  const topPad = 10;
  const bottomPad = 30;
  const plotHeight = CHART_HEIGHT - topPad - bottomPad;

  const moodPoints = sorted.map((item, i) => {
    const x = Y_LABEL_WIDTH + (sorted.length === 1 ? PLOT_WIDTH / 2 : (i / (sorted.length - 1)) * PLOT_WIDTH);
    const y = topPad + plotHeight - ((item.moodLevel - minY) / yRange) * plotHeight;
    return { x, y };
  });

  const energyPoints = sorted.map((item, i) => {
    const x = Y_LABEL_WIDTH + (sorted.length === 1 ? PLOT_WIDTH / 2 : (i / (sorted.length - 1)) * PLOT_WIDTH);
    const y = topPad + plotHeight - ((item.energyLevel - minY) / yRange) * plotHeight;
    return { x, y };
  });

  return (
    <View testID="mood-energy-chart">
      <View style={styles.moodLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Mood</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Energy</Text>
        </View>
      </View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {[1, 2, 3, 4, 5].map((val) => {
          const y = topPad + plotHeight - ((val - minY) / yRange) * plotHeight;
          return (
            <G key={`mgrid-${val}`}>
              <Line x1={Y_LABEL_WIDTH} y1={y} x2={CHART_WIDTH} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <SvgText x={0} y={y + 4} fontSize={10} fill="#94A3B8">{val}</SvgText>
            </G>
          );
        })}
        {moodPoints.length > 1 ? (
          <Path d={buildLinePath(moodPoints)} fill="none" stroke="#8B5CF6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {energyPoints.length > 1 ? (
          <Path d={buildLinePath(energyPoints)} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {moodPoints.map((p, i) => (
          <Circle key={`mood-dot-${i}`} cx={p.x} cy={p.y} r={4} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />
        ))}
        {energyPoints.map((p, i) => (
          <Circle key={`energy-dot-${i}`} cx={p.x} cy={p.y} r={4} fill="#10B981" stroke="#fff" strokeWidth={2} />
        ))}
        {sorted.map((item, i) => {
          const x = Y_LABEL_WIDTH + (sorted.length === 1 ? PLOT_WIDTH / 2 : (i / (sorted.length - 1)) * PLOT_WIDTH);
          return (
            <SvgText key={`mlabel-${i}`} x={x} y={CHART_HEIGHT - 5} fontSize={9} fill="#64748B" textAnchor="middle">
              {getDayLabel(item.date)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

export default function InsightsScreen() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const getDateRange = () => {
    const days = timeRange === '7d' ? 7 : 30;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      prevStartDate: prevStart.toISOString().split('T')[0],
      prevEndDate: prevEnd.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate, prevStartDate, prevEndDate } = getDateRange();

  const { data: sleepRaw, isLoading: sleepLoading } = useSleepLogs(startDate, endDate);
  const { data: workoutRaw, isLoading: workoutLoading } = useWorkoutLogs(startDate, endDate);
  const { data: checkinRaw, isLoading: checkinLoading } = useCheckins(startDate, endDate);

  const { data: prevSleepRaw } = useSleepLogs(prevStartDate, prevEndDate);
  const { data: prevWorkoutRaw } = useWorkoutLogs(prevStartDate, prevEndDate);
  const { data: prevCheckinRaw } = useCheckins(prevStartDate, prevEndDate);

  const sleepData = useMemo(() => (Array.isArray(sleepRaw) ? sleepRaw : []), [sleepRaw]);
  const workoutData = useMemo(() => (Array.isArray(workoutRaw) ? workoutRaw : []), [workoutRaw]);
  const checkinData = useMemo(() => (Array.isArray(checkinRaw) ? checkinRaw : []), [checkinRaw]);

  const prevSleepData = useMemo(() => (Array.isArray(prevSleepRaw) ? prevSleepRaw : []), [prevSleepRaw]);
  const prevWorkoutData = useMemo(() => (Array.isArray(prevWorkoutRaw) ? prevWorkoutRaw : []), [prevWorkoutRaw]);
  const prevCheckinData = useMemo(() => (Array.isArray(prevCheckinRaw) ? prevCheckinRaw : []), [prevCheckinRaw]);

  const isLoading = sleepLoading || workoutLoading || checkinLoading;

  const avgSleep = useMemo(() => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, s) => sum + (parseFloat(s.totalHours) || 0), 0);
    return Math.round((total / sleepData.length) * 10) / 10;
  }, [sleepData]);

  const workoutCount = workoutData.length;

  const avgMood = useMemo(() => {
    if (checkinData.length === 0) return 0;
    const total = checkinData.reduce((sum, c) => sum + (c.moodLevel || 0), 0);
    return Math.round((total / checkinData.length) * 10) / 10;
  }, [checkinData]);

  const streak = useMemo(() => {
    const allDates = new Set<string>();
    sleepData.forEach((s) => allDates.add(s.date.split('T')[0]));
    workoutData.forEach((w) => allDates.add(w.date.split('T')[0]));
    checkinData.forEach((c) => allDates.add(c.date.split('T')[0]));

    if (allDates.size === 0) return 0;

    const sorted = Array.from(allDates).sort().reverse();
    let count = 0;
    const today = new Date();

    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sorted.includes(expectedStr)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [sleepData, workoutData, checkinData]);

  const prevAvgSleep = useMemo(() => {
    if (prevSleepData.length === 0) return 0;
    const total = prevSleepData.reduce((sum, s) => sum + (parseFloat(s.totalHours) || 0), 0);
    return Math.round((total / prevSleepData.length) * 10) / 10;
  }, [prevSleepData]);

  const prevWorkoutCount = prevWorkoutData.length;

  const prevAvgMood = useMemo(() => {
    if (prevCheckinData.length === 0) return 0;
    const total = prevCheckinData.reduce((sum, c) => sum + (c.moodLevel || 0), 0);
    return Math.round((total / prevCheckinData.length) * 10) / 10;
  }, [prevCheckinData]);

  const sleepChange = avgSleep > 0 && prevAvgSleep > 0 ? Math.round((avgSleep - prevAvgSleep) * 10) / 10 : null;
  const workoutChange = workoutCount > 0 || prevWorkoutCount > 0 ? workoutCount - prevWorkoutCount : null;
  const moodChange = avgMood > 0 && prevAvgMood > 0 ? Math.round((avgMood - prevAvgMood) * 10) / 10 : null;

  const personalRecords = useMemo(() => {
    const records: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [];
    if (sleepData.length > 0) {
      const best = Math.max(...sleepData.map(s => parseFloat(s.totalHours) || 0));
      records.push({ label: 'Best Sleep', value: `${best.toFixed(1)}h`, icon: 'moon', color: '#6366F1' });
    }
    if (workoutData.length > 0) {
      const grouped: Record<string, number> = {};
      workoutData.forEach(w => {
        const d = w.date.split('T')[0];
        grouped[d] = (grouped[d] || 0) + 1;
      });
      const maxDay = Math.max(...Object.values(grouped));
      records.push({ label: 'Most Active Day', value: `${maxDay} workout${maxDay !== 1 ? 's' : ''}`, icon: 'barbell', color: '#EF4444' });
    }
    if (checkinData.length > 0) {
      const best = Math.max(...checkinData.map(c => c.moodLevel || 0));
      records.push({ label: 'Peak Mood', value: `${best}/5`, icon: 'happy', color: '#8B5CF6' });
      const bestEnergy = Math.max(...checkinData.map(c => c.energyLevel || 0));
      records.push({ label: 'Peak Energy', value: `${bestEnergy}/5`, icon: 'flash', color: '#F59E0B' });
    }
    return records;
  }, [sleepData, workoutData, checkinData]);

  const hasAnyData = sleepData.length > 0 || workoutData.length > 0 || checkinData.length > 0;
  const hasPrevData = prevSleepData.length > 0 || prevWorkoutData.length > 0 || prevCheckinData.length > 0;
  const periodLabel = timeRange === '7d' ? 'week' : 'month';

  return (
    <SafeAreaView style={styles.safe} testID="insights-screen">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Your health trends at a glance</Text>
        </View>

        <View style={styles.toggleRow} testID="time-range-toggle">
          <Pressable
            style={[styles.toggleBtn, timeRange === '7d' ? styles.toggleActive : null]}
            onPress={() => setTimeRange('7d')}
            testID="toggle-7d"
          >
            <Text style={[styles.toggleText, timeRange === '7d' ? styles.toggleTextActive : null]}>7 Days</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, timeRange === '30d' ? styles.toggleActive : null]}
            onPress={() => setTimeRange('30d')}
            testID="toggle-30d"
          >
            <Text style={[styles.toggleText, timeRange === '30d' ? styles.toggleTextActive : null]}>30 Days</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer} testID="insights-loading">
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading your insights...</Text>
          </View>
        ) : (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={styles.statsContent}>
              <Card style={styles.statCard}>
                <Ionicons name="moon" size={24} color="#6366F1" />
                <Text style={styles.statValue} testID="stat-avg-sleep">{avgSleep > 0 ? `${avgSleep}h` : '--'}</Text>
                <Text style={styles.statLabel}>Avg Sleep</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="barbell" size={24} color="#EF4444" />
                <Text style={styles.statValue} testID="stat-workouts">{workoutCount}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name={avgMood > 0 ? getMoodEmoji(avgMood) : 'happy-outline'} size={24} color="#8B5CF6" />
                <Text style={styles.statValue} testID="stat-avg-mood">{avgMood > 0 ? avgMood.toFixed(1) : '--'}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="flame" size={24} color="#F59E0B" />
                <Text style={styles.statValue} testID="stat-streak">{streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </Card>
            </ScrollView>

            {hasAnyData && hasPrevData ? (
              <View style={styles.section} testID="comparison-section">
                <Text style={styles.sectionTitle}>vs Previous {periodLabel}</Text>
                <View style={styles.comparisonRow}>
                  {sleepChange !== null ? (
                    <Card style={styles.comparisonCard}>
                      <Ionicons name={sleepChange >= 0 ? 'arrow-up' : 'arrow-down'} size={16} color={sleepChange >= 0 ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.comparisonValue, { color: sleepChange >= 0 ? '#10B981' : '#EF4444' }]}>{sleepChange > 0 ? '+' : ''}{sleepChange}h</Text>
                      <Text style={styles.comparisonLabel}>Sleep</Text>
                    </Card>
                  ) : null}
                  {workoutChange !== null ? (
                    <Card style={styles.comparisonCard}>
                      <Ionicons name={workoutChange >= 0 ? 'arrow-up' : 'arrow-down'} size={16} color={workoutChange >= 0 ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.comparisonValue, { color: workoutChange >= 0 ? '#10B981' : '#EF4444' }]}>{workoutChange > 0 ? '+' : ''}{workoutChange}</Text>
                      <Text style={styles.comparisonLabel}>Workouts</Text>
                    </Card>
                  ) : null}
                  {moodChange !== null ? (
                    <Card style={styles.comparisonCard}>
                      <Ionicons name={moodChange >= 0 ? 'arrow-up' : 'arrow-down'} size={16} color={moodChange >= 0 ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.comparisonValue, { color: moodChange >= 0 ? '#10B981' : '#EF4444' }]}>{moodChange > 0 ? '+' : ''}{moodChange}</Text>
                      <Text style={styles.comparisonLabel}>Mood</Text>
                    </Card>
                  ) : null}
                </View>
              </View>
            ) : null}

            {personalRecords.length > 0 ? (
              <View style={styles.section} testID="pr-section">
                <Text style={styles.sectionTitle}>Personal Records</Text>
                <View style={styles.prRow}>
                  {personalRecords.map((pr, i) => (
                    <Card key={`pr-${i}`} style={styles.prCard}>
                      <View style={[styles.prIconBg, { backgroundColor: pr.color + '18' }]}>
                        <Ionicons name={pr.icon} size={20} color={pr.color} />
                      </View>
                      <Text style={styles.prValue}>{pr.value}</Text>
                      <Text style={styles.prLabel}>{pr.label}</Text>
                    </Card>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sleep Trends</Text>
              <Card style={styles.chartCard}>
                <SleepChart data={sleepData} />
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workout Activity</Text>
              <Card style={styles.chartCard}>
                <WorkoutChart data={workoutData} />
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood & Energy</Text>
              <Card style={styles.chartCard}>
                <MoodEnergyChart data={checkinData} />
              </Card>
            </View>

            {!hasAnyData ? (
              <Card style={styles.tipCard}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>How insights work</Text>
                  <Text style={styles.tipText}>
                    As you log your sleep, workouts, and daily check-ins, we'll analyze the patterns and show you personalized insights to help optimize your performance.
                  </Text>
                </View>
              </Card>
            ) : null}
          </View>
        )}
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#10B981',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  statsRow: {
    marginBottom: 24,
    marginHorizontal: -24,
  },
  statsContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    alignItems: 'center',
    width: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartCard: {
    padding: 16,
    overflow: 'hidden',
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyChartSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  workoutLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  moodLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  comparisonCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  prRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  prCard: {
    width: (SCREEN_WIDTH - 48 - 10) / 2 - 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  prIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  prValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  prLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#EFF6FF',
    marginTop: 4,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

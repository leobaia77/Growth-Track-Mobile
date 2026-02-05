import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider } from '@/components/ui';
import { useLogSleep } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const QUALITY_LABELS = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const QUALITY_COLORS = ['#EF4444', '#F59E0B', '#64748B', '#10B981', '#059669'];
const QUALITY_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'thunderstorm-outline', 'cloudy-outline', 'partly-sunny-outline', 'sunny-outline', 'star-outline',
];

function formatHour(hour: number): string {
  const h = hour % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:00 ${period}`;
}

function calculateSleepHours(bedtime: number, wakeTime: number): number {
  let hours = wakeTime - bedtime;
  if (hours <= 0) hours += 24;
  return hours;
}

export default function SleepLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logSleep = useLogSleep();
  const [bedtime, setBedtime] = useState(22);
  const [wakeTime, setWakeTime] = useState(7);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [wakeUps, setWakeUps] = useState(0);

  const totalHours = calculateSleepHours(bedtime, wakeTime);
  const qualityIndex = quality - 1;

  const handleSave = () => {
    logSleep.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        totalHours: totalHours.toString(),
        source: 'manual',
      },
      {
        onSuccess: () => {
          showToast('success', 'Sleep Logged', `${totalHours} hours recorded`);
          setTimeout(() => router.back(), 600);
        },
        onError: (error) => {
          showToast('error', 'Save Failed', error.message || 'Could not save sleep data');
        },
      }
    );
  };

  const getHoursColor = () => {
    if (totalHours < 6) return '#EF4444';
    if (totalHours < 7) return '#F59E0B';
    if (totalHours <= 9) return '#10B981';
    return '#F59E0B';
  };

  const getHoursMessage = () => {
    if (totalHours < 6) return 'Below recommended range';
    if (totalHours < 7) return 'Slightly below target';
    if (totalHours <= 9) return 'Great! Within recommended range';
    return 'Above recommended range';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-sleep">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Sleep</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-sleep">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Ionicons name="moon" size={36} color="#6366F1" />
          <Text style={[styles.hoursText, { color: getHoursColor() }]}>{totalHours}h</Text>
          <Text style={styles.hoursMessage}>{getHoursMessage()}</Text>
        </Card>

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Bedtime</Text>
          <View style={styles.timeDisplay}>
            <Ionicons name="moon-outline" size={22} color="#6366F1" />
            <Text style={styles.timeText}>{formatHour(bedtime)}</Text>
          </View>
          <Slider
            value={bedtime}
            onValueChange={setBedtime}
            min={18}
            max={28}
            step={1}
            leftLabel="6 PM"
            rightLabel="4 AM"
            showValue={false}
            testID="slider-bedtime"
          />
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Wake Time</Text>
          <View style={styles.timeDisplay}>
            <Ionicons name="sunny-outline" size={22} color="#F59E0B" />
            <Text style={styles.timeText}>{formatHour(wakeTime)}</Text>
          </View>
          <Slider
            value={wakeTime}
            onValueChange={setWakeTime}
            min={4}
            max={14}
            step={1}
            leftLabel="4 AM"
            rightLabel="2 PM"
            showValue={false}
            testID="slider-wake"
          />
        </View>

        <View style={styles.qualitySection}>
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <View style={styles.qualityDisplay}>
            <Ionicons
              name={QUALITY_ICONS[qualityIndex]}
              size={28}
              color={QUALITY_COLORS[qualityIndex]}
            />
            <Text style={[styles.qualityText, { color: QUALITY_COLORS[qualityIndex] }]}>
              {QUALITY_LABELS[qualityIndex]}
            </Text>
          </View>
          <View style={styles.qualityButtons}>
            {QUALITY_LABELS.map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.qualityBtn,
                  quality === index + 1 ? { backgroundColor: QUALITY_COLORS[index] + '20', borderColor: QUALITY_COLORS[index] } : undefined,
                ]}
                onPress={() => setQuality(index + 1)}
                testID={`button-quality-${index + 1}`}
              >
                <Ionicons
                  name={QUALITY_ICONS[index]}
                  size={20}
                  color={quality === index + 1 ? QUALITY_COLORS[index] : '#94A3B8'}
                />
                <Text style={[
                  styles.qualityBtnText,
                  quality === index + 1 ? { color: QUALITY_COLORS[index] } : undefined,
                ]} numberOfLines={1}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.wakeSection}>
          <View style={styles.wakeSectionHeader}>
            <Text style={styles.sectionTitle}>Night Wakeups</Text>
            <Text style={styles.wakeCount}>{wakeUps}</Text>
          </View>
          <View style={styles.wakeButtons}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.wakeBtn, wakeUps === n ? styles.wakeBtnActive : undefined]}
                onPress={() => setWakeUps(n)}
                testID={`button-wakeups-${n}`}
              >
                <Text style={[styles.wakeBtnText, wakeUps === n ? styles.wakeBtnTextActive : undefined]}>
                  {n === 5 ? '5+' : n.toString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Notes (optional)"
          placeholder="Dreams, disruptions, how you felt waking up..."
          value={notes}
          onChangeText={setNotes}
          multiline
          testID="input-sleep-notes"
        />

        <Card style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
          <Text style={styles.tipText}>
            Aim for 7-9 hours of sleep. Consistent bedtimes improve sleep quality and recovery.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={logSleep.isPending ? 'Saving...' : 'Save Sleep Log'}
          onPress={handleSave}
          disabled={logSleep.isPending}
          testID="button-save-sleep"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  backButton: {
    padding: 8,
  },
  homeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#EEF2FF',
  },
  hoursText: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: 8,
  },
  hoursMessage: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  timeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  qualitySection: {
    marginBottom: 24,
  },
  qualityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  qualityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    gap: 4,
  },
  qualityBtnText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  wakeSection: {
    marginBottom: 24,
  },
  wakeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wakeCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
  },
  wakeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  wakeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  wakeBtnActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  wakeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  wakeBtnTextActive: {
    color: '#fff',
  },
  tipCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

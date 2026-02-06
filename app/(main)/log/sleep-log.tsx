import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider, ConfirmDialog } from '@/components/ui';
import { useLogSleep } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { healthKit } from '@/services/healthKit';

const QUALITY_LABELS = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const QUALITY_COLORS = ['#EF4444', '#F59E0B', '#64748B', '#10B981', '#059669'];
const QUALITY_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'thunderstorm-outline', 'cloudy-outline', 'partly-sunny-outline', 'sunny-outline', 'star-outline',
];

const DISTURBANCE_OPTIONS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'restless', label: 'Restless', icon: 'swap-horizontal-outline' },
  { id: 'nightmare', label: 'Nightmares', icon: 'flash-outline' },
  { id: 'noise', label: 'Noise', icon: 'volume-high-outline' },
  { id: 'bathroom', label: 'Bathroom', icon: 'water-outline' },
  { id: 'pain', label: 'Pain/Discomfort', icon: 'bandage-outline' },
  { id: 'temperature', label: 'Too Hot/Cold', icon: 'thermometer-outline' },
  { id: 'stress', label: 'Stress/Anxiety', icon: 'pulse-outline' },
  { id: 'screen', label: 'Late Screen Time', icon: 'phone-portrait-outline' },
  { id: 'caffeine', label: 'Caffeine', icon: 'cafe-outline' },
  { id: 'snoring', label: 'Snoring', icon: 'mic-outline' },
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
  const [disturbances, setDisturbances] = useState<string[]>([]);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [healthKitLoading, setHealthKitLoading] = useState(false);
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);

  useEffect(() => {
    healthKit.isHealthKitAvailable().then(setHealthKitAvailable);
  }, []);

  const hasModified = bedtime !== 22 || wakeTime !== 7 || quality !== 3 || notes !== '' || wakeUps !== 0 || disturbances.length > 0;

  const totalHours = calculateSleepHours(bedtime, wakeTime);
  const qualityIndex = quality - 1;

  const handleSave = () => {
    const disturbanceLabels = disturbances.map(id =>
      DISTURBANCE_OPTIONS.find(d => d.id === id)?.label
    ).filter(Boolean);
    const sleepNotes = [
      disturbanceLabels.length > 0 ? `Disturbances: ${disturbanceLabels.join(', ')}` : '',
      wakeUps > 0 ? `Woke up ${wakeUps} time${wakeUps > 1 ? 's' : ''}` : '',
      `Quality: ${QUALITY_LABELS[qualityIndex]}`,
      notes,
    ].filter(Boolean).join('. ');

    logSleep.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        totalHours: totalHours.toString(),
        source: 'manual',
        notes: sleepNotes || undefined,
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

  const handleImportHealthKit = async () => {
    if (Platform.OS === 'web') {
      showToast('info', 'iOS Only', 'Open this app in Expo Go on your iPhone to import from Apple Health');
      return;
    }
    if (!healthKitAvailable) {
      showToast('info', 'Not Available', 'Apple Health is not available on this device');
      return;
    }
    setHealthKitLoading(true);
    try {
      const authorized = await healthKit.requestPermissions();
      if (!authorized) {
        showToast('error', 'Permission Denied', 'Please allow access to Apple Health in Settings');
        setHealthKitLoading(false);
        return;
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();
      const sleepData = await healthKit.getSleepData(yesterday, today);
      if (sleepData.length > 0) {
        const latest = sleepData[sleepData.length - 1];
        const bedHour = parseInt(latest.bedtime.split(':')[0], 10);
        const wakeHour = parseInt(latest.wakeTime.split(':')[0], 10);
        if (bedHour >= 18 && bedHour <= 28) setBedtime(bedHour);
        if (wakeHour >= 4 && wakeHour <= 14) setWakeTime(wakeHour);
        showToast('success', 'Imported', `Sleep data from Apple Health: ${latest.totalHours}h`);
      } else {
        showToast('info', 'No Data', 'No sleep data found for last night in Apple Health');
      }
    } catch {
      showToast('error', 'Import Failed', 'Could not import from Apple Health');
    }
    setHealthKitLoading(false);
  };

  const toggleDisturbance = (id: string) => {
    setDisturbances(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
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
        <TouchableOpacity onPress={() => {
          if (hasModified) {
            setShowDiscardDialog(true);
          } else {
            router.back();
          }
        }} style={styles.backButton} testID="button-back-sleep">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Sleep</Text>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')} style={styles.homeButton} testID="button-home-sleep">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Ionicons name="moon" size={36} color="#6366F1" />
          <Text style={[styles.hoursText, { color: getHoursColor() }]}>{totalHours}h</Text>
          <Text style={styles.hoursMessage}>{getHoursMessage()}</Text>
        </Card>

        <TouchableOpacity
          style={styles.healthKitBtn}
          onPress={handleImportHealthKit}
          disabled={healthKitLoading}
          testID="button-import-healthkit"
        >
          {healthKitLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="heart-circle-outline" size={20} color="#EF4444" />
          )}
          <Text style={styles.healthKitBtnText}>
            {healthKitLoading ? 'Importing...' : 'Import from Apple Health'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>

        {Platform.OS === 'web' ? (
          <Card style={styles.healthKitDisclaimer}>
            <Ionicons name="information-circle" size={18} color="#F59E0B" />
            <Text style={styles.healthKitDisclaimerText}>
              Apple Health import requires an iPhone with Expo Go. On this device, data is entered manually.
            </Text>
          </Card>
        ) : null}

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

        <View style={styles.disturbanceSection}>
          <Text style={styles.sectionTitle}>Sleep Disturbances</Text>
          <Text style={styles.disturbanceSubtitle}>
            {disturbances.length > 0 ? `${disturbances.length} selected` : 'Tap any that apply'}
          </Text>
          <View style={styles.disturbanceGrid}>
            {DISTURBANCE_OPTIONS.map((item) => {
              const selected = disturbances.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.disturbanceChip, selected ? styles.disturbanceChipActive : undefined]}
                  onPress={() => toggleDisturbance(item.id)}
                  testID={`button-disturbance-${item.id}`}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={selected ? '#6366F1' : '#94A3B8'}
                  />
                  <Text style={[styles.disturbanceChipText, selected ? styles.disturbanceChipTextActive : undefined]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Input
          label="Notes (optional)"
          placeholder="Dreams, how you felt waking up, anything else..."
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

      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard Sleep Log?"
        message="Your sleep data hasn't been saved yet."
        onConfirm={() => {
          setShowDiscardDialog(false);
          router.back();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
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
  healthKitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 24,
  },
  healthKitBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C1C',
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
  disturbanceSection: {
    marginBottom: 24,
  },
  disturbanceSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 12,
  },
  disturbanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  disturbanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  disturbanceChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  disturbanceChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  disturbanceChipTextActive: {
    color: '#6366F1',
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
  healthKitDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  healthKitDisclaimerText: {
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

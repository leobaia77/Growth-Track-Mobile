import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Select } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { notificationService, NotificationPreferences } from '@/services/notifications';

const TIME_OPTIONS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [morningBriefEnabled, setMorningBriefEnabled] = useState(true);
  const [morningBriefTime, setMorningBriefTime] = useState<string | null>('07:00');
  const [checkinReminder, setCheckinReminder] = useState(true);
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [mealReminder, setMealReminder] = useState(false);
  const [sleepReminder, setSleepReminder] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getPreferences();
        setMorningBriefEnabled(prefs.morningBriefEnabled);
        setMorningBriefTime(prefs.morningBriefTime);
        setCheckinReminder(prefs.checkinReminder);
        setWorkoutReminder(prefs.workoutReminder);
        setMealReminder(prefs.mealReminder);
        setSleepReminder(prefs.sleepReminder);
      } catch {}
      setLoading(false);
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      const prefs: NotificationPreferences = {
        morningBriefEnabled,
        morningBriefTime: morningBriefTime || '07:00',
        checkinReminder,
        workoutReminder,
        mealReminder,
        sleepReminder,
      };
      await notificationService.savePreferences(prefs);
      showToast('success', 'Preferences Saved', 'Your notification settings have been updated.');
    } catch {
      showToast('error', 'Save Failed', 'Could not save notification preferences. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'web' ? (
          <Card style={styles.webInfoCard}>
            <Ionicons name="phone-portrait-outline" size={20} color="#F59E0B" />
            <Text style={styles.webInfoText}>
              Push notifications are only available on mobile devices. Run this app in Expo Go to receive notifications.
            </Text>
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>Morning Brief</Text>
        <Card style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Daily Morning Brief</Text>
              <Text style={styles.optionDescription}>
                Start your day with yesterday's summary and today's plan
              </Text>
            </View>
            <Switch
              value={morningBriefEnabled}
              onValueChange={setMorningBriefEnabled}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={morningBriefEnabled ? '#10B981' : '#94A3B8'}
              testID="switch-morning-brief"
            />
          </View>

          {morningBriefEnabled ? (
            <View style={styles.timeSection}>
              <Select
                label="Delivery Time"
                options={TIME_OPTIONS}
                value={morningBriefTime}
                onValueChange={setMorningBriefTime}
                testID="select-morning-time"
              />
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Reminders</Text>
        <Card style={styles.remindersCard}>
          <View style={styles.reminderItem}>
            <View style={styles.reminderInfo}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.reminderTitle}>Daily Check-in</Text>
            </View>
            <Switch
              value={checkinReminder}
              onValueChange={setCheckinReminder}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={checkinReminder ? '#10B981' : '#94A3B8'}
              testID="switch-checkin-reminder"
            />
          </View>

          <View style={styles.reminderItem}>
            <View style={styles.reminderInfo}>
              <Ionicons name="barbell" size={20} color="#F59E0B" />
              <Text style={styles.reminderTitle}>Workout Reminder</Text>
            </View>
            <Switch
              value={workoutReminder}
              onValueChange={setWorkoutReminder}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={workoutReminder ? '#10B981' : '#94A3B8'}
              testID="switch-workout-reminder"
            />
          </View>

          <View style={styles.reminderItem}>
            <View style={styles.reminderInfo}>
              <Ionicons name="nutrition" size={20} color="#10B981" />
              <Text style={styles.reminderTitle}>Meal Logging</Text>
            </View>
            <Switch
              value={mealReminder}
              onValueChange={setMealReminder}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={mealReminder ? '#10B981' : '#94A3B8'}
              testID="switch-meal-reminder"
            />
          </View>

          <View style={[styles.reminderItem, styles.reminderItemLast]}>
            <View style={styles.reminderInfo}>
              <Ionicons name="moon" size={20} color="#8B5CF6" />
              <Text style={styles.reminderTitle}>Sleep Reminder</Text>
            </View>
            <Switch
              value={sleepReminder}
              onValueChange={setSleepReminder}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={sleepReminder ? '#10B981' : '#94A3B8'}
              testID="switch-sleep-reminder"
            />
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Reminders help you build healthy habits. You can always log your data manually at any time.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Preferences"
          onPress={handleSave}
          testID="button-save-notifications"
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  optionCard: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  timeSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  remindersCard: {
    padding: 0,
    marginBottom: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  reminderItemLast: {
    borderBottomWidth: 0,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderTitle: {
    fontSize: 16,
    color: '#374151',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  webInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginBottom: 24,
  },
  webInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

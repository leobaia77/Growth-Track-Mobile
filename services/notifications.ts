import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = '@growthtrack_notification_prefs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowInForeground: true,
  }),
});

export interface NotificationPreferences {
  morningBriefEnabled: boolean;
  morningBriefTime: string;
  checkinReminder: boolean;
  workoutReminder: boolean;
  mealReminder: boolean;
  sleepReminder: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  morningBriefEnabled: true,
  morningBriefTime: '07:00',
  checkinReminder: true,
  workoutReminder: true,
  mealReminder: false,
  sleepReminder: true,
};

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_PREFS;
  },

  async savePreferences(prefs: NotificationPreferences): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    await this.scheduleAll(prefs);
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async scheduleAll(prefs: NotificationPreferences): Promise<void> {
    await this.cancelAll();

    if (Platform.OS === 'web') return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    if (prefs.morningBriefEnabled) {
      const [hours, minutes] = prefs.morningBriefTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good Morning!',
          body: 'Check your morning brief and start the day strong.',
          data: { type: 'morning_brief' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }

    if (prefs.checkinReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Check-in',
          body: 'How are you feeling today? Take a moment to log your mood and energy.',
          data: { type: 'checkin' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
        },
      });
    }

    if (prefs.workoutReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Train',
          body: "Don't forget your workout today. Stay consistent!",
          data: { type: 'workout' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 16,
          minute: 0,
        },
      });
    }

    if (prefs.mealReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Log Your Meal',
          body: 'Track your nutrition to fuel your performance.',
          data: { type: 'meal' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 12,
          minute: 30,
        },
      });
    }

    if (prefs.sleepReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wind Down',
          body: "It's getting late. Start your bedtime routine for better recovery.",
          data: { type: 'sleep' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 30,
        },
      });
    }
  },
};

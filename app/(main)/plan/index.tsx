import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider, Select } from '@/components/ui';
import { useRouter } from 'expo-router';

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  activities: Activity[];
}

interface Activity {
  id: string;
  name: string;
  time: string;
  duration: number;
  type: string;
  description?: string;
  reminder?: boolean;
  reminderMinutes?: number;
  completed?: boolean;
}

const ACTIVITY_TYPES = [
  { label: 'Training', value: 'training' },
  { label: 'Game/Match', value: 'game' },
  { label: 'Weight Lifting', value: 'weightlifting' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Water Polo', value: 'waterpolo' },
  { label: 'PT/Rehab', value: 'pt' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'School', value: 'school' },
  { label: 'Other', value: 'other' },
];

const WEIGHT_LIFTING_TEMPLATES = [
  { name: 'Upper Body', duration: 60, description: 'Bench press, rows, shoulder press, curls' },
  { name: 'Lower Body', duration: 60, description: 'Squats, deadlifts, lunges, leg press' },
  { name: 'Push Day', duration: 50, description: 'Chest, shoulders, triceps focus' },
  { name: 'Pull Day', duration: 50, description: 'Back, biceps, rear delts focus' },
  { name: 'Leg Day', duration: 55, description: 'Quads, hamstrings, glutes, calves' },
  { name: 'Full Body', duration: 45, description: 'Compound lifts: squat, bench, deadlift' },
  { name: 'Core & Abs', duration: 30, description: 'Planks, crunches, leg raises' },
  { name: 'Olympic Lifts', duration: 60, description: 'Clean & jerk, snatch, power cleans' },
  { name: 'A: Back/Biceps/Calves', duration: 50, description: 'Lat Pulldown (RP), DB Row, Barbell Curl (RP), Calf Raise. RP = Rest-Pause.' },
  { name: 'B: Chest/Shoulders/Tri', duration: 50, description: 'DB Press (RP), Incline Press, Shoulder Press (RP), Triceps Ext (RP).' },
  { name: 'C: Legs & Glutes', duration: 55, description: 'Squats, Leg Press (WM), RDL, Leg Curl (WM), Hip Thrust. WM = Widowmaker.' },
  { name: 'PPL: Push', duration: 45, description: 'Bench, Incline, Shoulder Press, Lateral Raises, Triceps. Progressive overload.' },
  { name: 'PPL: Pull', duration: 45, description: 'Deadlift, Rows, Lat Pulldown, Face Pulls, Bicep Curls. Form over weight.' },
  { name: 'PPL: Legs', duration: 50, description: 'Squats, Leg Press, RDL, Extensions, Curls, Calves. Full development.' },
  { name: 'Upper/Lower: Upper', duration: 50, description: 'Bench, Rows, Shoulder Press, Pull-ups, Arm work. 2-3 sets each.' },
  { name: 'Upper/Lower: Lower', duration: 50, description: 'Squats, RDL, Leg Press, Lunges, Calves. Compound focus.' },
];

const SWIMMING_TEMPLATES = [
  { name: 'Swim Practice', duration: 90, description: 'Warm-up, drills, main set, cool-down' },
  { name: 'Swim Drills', duration: 60, description: 'Kick sets, pull sets, technique' },
  { name: 'Sprint Set', duration: 45, description: '10x50m sprints with rest' },
  { name: 'Distance', duration: 75, description: 'Endurance continuous swim' },
];

const WATER_POLO_TEMPLATES = [
  { name: 'WP Practice', duration: 90, description: 'Treading, passing, shooting drills' },
  { name: 'WP Scrimmage', duration: 60, description: 'Team scrimmage game situations' },
  { name: 'WP Conditioning', duration: 45, description: 'Eggbeater drills, sprint swims' },
];

const REMINDER_OPTIONS = [
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
];

export default function PlanScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [activityTime, setActivityTime] = useState('4:00 PM');
  const [plannedActivities, setPlannedActivities] = useState<Activity[]>([
    { id: '1', name: 'Soccer Practice', time: '4:00 PM', duration: 90, type: 'training', reminder: true, reminderMinutes: 30, completed: false },
    { id: '2', name: 'Upper Body', time: '6:00 PM', duration: 60, type: 'weightlifting', description: 'Bench press, rows, shoulder press, curls', reminder: true, reminderMinutes: 15, completed: false },
  ]);

  const getWeekDays = (): DayData[] => {
    const today = new Date();
    const days: DayData[] = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayActivities = i === 0 ? plannedActivities : [];
      
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
        activities: dayActivities,
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  const handleAddActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityName || getDefaultName(activityType),
      time: activityTime,
      duration,
      type: activityType || 'other',
      description: notes,
      reminder: reminderEnabled,
      reminderMinutes: reminderEnabled ? reminderMinutes : undefined,
      completed: false,
    };
    
    setPlannedActivities(prev => [...prev, newActivity]);
    resetForm();
    setAddModalVisible(false);
  };

  const resetForm = () => {
    setActivityType(null);
    setActivityName('');
    setDuration(60);
    setIntensity(5);
    setNotes('');
    setReminderEnabled(true);
    setReminderMinutes(30);
    setActivityTime('4:00 PM');
  };

  const getDefaultName = (type: string | null): string => {
    switch (type) {
      case 'weightlifting': return 'Weight Lifting Session';
      case 'swimming': return 'Swimming Practice';
      case 'waterpolo': return 'Water Polo Practice';
      case 'training': return 'Training Session';
      case 'game': return 'Game/Match';
      case 'pt': return 'PT/Rehab Session';
      case 'cardio': return 'Cardio Workout';
      default: return 'Activity';
    }
  };

  const handleAcceptActivity = (activity: Activity) => {
    setPlannedActivities(prev => 
      prev.map(a => a.id === activity.id ? { ...a, completed: true } : a)
    );
    router.push('/(main)/log/workout-log');
  };

  const handleDeleteActivity = (activityId: string) => {
    setPlannedActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const applyTemplate = (template: { name: string; duration: number; description: string }) => {
    setActivityName(template.name);
    setDuration(template.duration);
    setNotes(template.description);
  };

  const getTemplatesForType = () => {
    switch (activityType) {
      case 'weightlifting': return WEIGHT_LIFTING_TEMPLATES;
      case 'swimming': return SWIMMING_TEMPLATES;
      case 'waterpolo': return WATER_POLO_TEMPLATES;
      default: return [];
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'weightlifting': return 'barbell';
      case 'swimming': return 'water';
      case 'waterpolo': return 'water';
      case 'training': return 'football';
      case 'game': return 'trophy';
      case 'pt': return 'fitness';
      case 'cardio': return 'pulse';
      default: return 'calendar';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plan</Text>
        <Text style={styles.subtitle}>Schedule and manage activities</Text>
      </View>

      <View style={styles.weekContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScroll}
        >
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                day.isToday && styles.dayCardToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayCardSelected,
              ]}
              onPress={() => setSelectedDay(day.date)}
            >
              <Text style={[
                styles.dayName,
                day.isToday && styles.dayNameToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayNameSelected,
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                day.isToday && styles.dayNumberToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayNumberSelected,
              ]}>
                {day.dayNumber}
              </Text>
              {day.activities.length > 0 && (
                <View style={styles.activityDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateHeader}>
          {selectedDay.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        {weekDays.find(d => d.date.toDateString() === selectedDay.toDateString())?.activities.map((activity) => (
          <Card key={activity.id} style={[styles.activityCard, activity.completed && styles.activityCardCompleted]}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, activity.completed && styles.activityIconCompleted]}>
                <Ionicons name={getActivityIcon(activity.type) as never} size={24} color={activity.completed ? '#94A3B8' : '#10B981'} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityName, activity.completed && styles.activityNameCompleted]}>{activity.name}</Text>
                <Text style={styles.activityTime}>{activity.time} • {activity.duration} min</Text>
                {activity.description ? (
                  <Text style={styles.activityDescription} numberOfLines={1}>{activity.description}</Text>
                ) : null}
                {activity.reminder && !activity.completed ? (
                  <View style={styles.reminderBadge}>
                    <Ionicons name="notifications" size={12} color="#3B82F6" />
                    <Text style={styles.reminderText}>{activity.reminderMinutes}min before</Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => handleDeleteActivity(activity.id)} testID={`button-delete-${activity.id}`}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
            {!activity.completed ? (
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptActivity(activity)}
                testID={`button-accept-${activity.id}`}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>Accept & Log Workout</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </Card>
        )) || (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No activities planned</Text>
            <Text style={styles.emptyText}>Tap the + button to add an activity</Text>
          </Card>
        )}

        <View style={styles.freeTimeBlock}>
          <View style={styles.freeTimeHeader}>
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <Text style={styles.freeTimeTitle}>Available Time</Text>
          </View>
          <Text style={styles.freeTimeText}>Evening (5pm - 10pm)</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        testID="button-add-activity"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Select
                label="Activity Type"
                placeholder="Select type"
                options={ACTIVITY_TYPES}
                value={activityType}
                onValueChange={(val) => {
                  setActivityType(val);
                  setActivityName('');
                  setNotes('');
                }}
                testID="select-activity-type"
              />

              {getTemplatesForType().length > 0 ? (
                <View style={styles.templatesSection}>
                  <Text style={styles.templatesSectionTitle}>Quick Templates</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {getTemplatesForType().map((template, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.templateChip}
                        onPress={() => applyTemplate(template)}
                        testID={`button-plan-template-${index}`}
                      >
                        <Text style={styles.templateChipName}>{template.name}</Text>
                        <Text style={styles.templateChipDuration}>{template.duration}min</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <Input
                label="Activity Name"
                placeholder="e.g., Morning Workout"
                value={activityName}
                onChangeText={setActivityName}
                testID="input-activity-name"
              />

              <Select
                label="Time"
                placeholder="Select time"
                options={[
                  { label: '6:00 AM', value: '6:00 AM' },
                  { label: '7:00 AM', value: '7:00 AM' },
                  { label: '8:00 AM', value: '8:00 AM' },
                  { label: '9:00 AM', value: '9:00 AM' },
                  { label: '10:00 AM', value: '10:00 AM' },
                  { label: '11:00 AM', value: '11:00 AM' },
                  { label: '12:00 PM', value: '12:00 PM' },
                  { label: '1:00 PM', value: '1:00 PM' },
                  { label: '2:00 PM', value: '2:00 PM' },
                  { label: '3:00 PM', value: '3:00 PM' },
                  { label: '4:00 PM', value: '4:00 PM' },
                  { label: '5:00 PM', value: '5:00 PM' },
                  { label: '6:00 PM', value: '6:00 PM' },
                  { label: '7:00 PM', value: '7:00 PM' },
                  { label: '8:00 PM', value: '8:00 PM' },
                  { label: '9:00 PM', value: '9:00 PM' },
                ]}
                value={activityTime}
                onValueChange={setActivityTime}
                testID="select-activity-time"
              />

              <View style={styles.durationSection}>
                <Text style={styles.durationLabel}>Duration: {duration} minutes</Text>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={15}
                  max={180}
                  step={15}
                  leftLabel="15m"
                  rightLabel="3h"
                  showValue={false}
                  testID="slider-duration"
                />
              </View>

              <Slider
                label="Intensity (RPE)"
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
                leftLabel="Easy"
                rightLabel="Max"
                testID="slider-intensity"
              />

              <Input
                label="Description/Notes"
                placeholder="Drills, exercises, goals..."
                value={notes}
                onChangeText={setNotes}
                multiline
                testID="input-activity-notes"
              />

              <View style={styles.reminderSection}>
                <View style={styles.reminderRow}>
                  <View style={styles.reminderLabelContainer}>
                    <Ionicons name="notifications-outline" size={20} color="#374151" />
                    <Text style={styles.reminderLabel}>Set Reminder</Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                    thumbColor={reminderEnabled ? '#10B981' : '#94A3B8'}
                    testID="switch-reminder"
                  />
                </View>
                {reminderEnabled ? (
                  <Select
                    placeholder="Select reminder time"
                    options={REMINDER_OPTIONS.map(r => ({ label: r.label, value: r.value.toString() }))}
                    value={reminderMinutes.toString()}
                    onValueChange={(val) => setReminderMinutes(parseInt(val || '30'))}
                    testID="select-reminder-time"
                  />
                ) : null}
              </View>

              <Button
                title="Add Activity"
                onPress={handleAddActivity}
                disabled={!activityType}
                testID="button-confirm-activity"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  weekContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  weekScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayCard: {
    width: 56,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  dayCardToday: {
    backgroundColor: '#E8F5F0',
  },
  dayCardSelected: {
    backgroundColor: '#10B981',
  },
  dayName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dayNameToday: {
    color: '#10B981',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayNumberToday: {
    color: '#10B981',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#F1F5F9',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconCompleted: {
    backgroundColor: '#E2E8F0',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
  },
  activityDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reminderText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  completedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  freeTimeBlock: {
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  freeTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  freeTimeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  freeTimeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 28,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  durationSection: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  templatesSection: {
    marginBottom: 16,
  },
  templatesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  templateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#E8F5F0',
    borderRadius: 10,
    marginRight: 10,
  },
  templateChipName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  templateChipDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reminderSection: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});

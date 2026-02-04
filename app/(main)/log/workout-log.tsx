import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select, Slider } from '@/components/ui';

const WORKOUT_TYPES = [
  { label: 'Sport Practice', value: 'practice' },
  { label: 'Game/Match', value: 'game' },
  { label: 'Strength Training', value: 'strength' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Flexibility/Yoga', value: 'flexibility' },
  { label: 'Other', value: 'other' },
];

const SPORTS = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Football', value: 'football' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Water Polo', value: 'water-polo' },
  { label: 'Track & Field', value: 'track' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Other', value: 'other' },
];

interface WorkoutTemplate {
  name: string;
  duration: number;
  type: string;
  sport: string | null;
  description?: string;
}

const QUICK_TEMPLATES: WorkoutTemplate[] = [
  { name: 'Soccer Practice', duration: 90, type: 'practice', sport: 'soccer', description: 'Warm-up, passing drills, scrimmage' },
  { name: 'Gym Session', duration: 45, type: 'strength', sport: null, description: 'Full body strength training' },
  { name: 'Morning Run', duration: 30, type: 'cardio', sport: null, description: 'Easy pace cardio' },
  { name: 'Game Day', duration: 60, type: 'game', sport: 'soccer', description: 'Full match competition' },
  { name: 'Swim Practice', duration: 90, type: 'practice', sport: 'swimming', description: 'Warm-up 400m, drills, main set, cool-down' },
  { name: 'Swim Drills', duration: 60, type: 'practice', sport: 'swimming', description: 'Kick sets, pull sets, stroke technique' },
  { name: 'Swim Sprint Set', duration: 45, type: 'practice', sport: 'swimming', description: '10x50m sprints with 30s rest' },
  { name: 'Swim Distance', duration: 75, type: 'practice', sport: 'swimming', description: 'Endurance: 2000m continuous swim' },
  { name: 'Water Polo Practice', duration: 90, type: 'practice', sport: 'water-polo', description: 'Treading, passing, shooting drills' },
  { name: 'Water Polo Scrimmage', duration: 60, type: 'practice', sport: 'water-polo', description: 'Team scrimmage with game situations' },
  { name: 'Water Polo Conditioning', duration: 45, type: 'practice', sport: 'water-polo', description: 'Eggbeater drills, sprint swims, leg work' },
  { name: 'Water Polo Game', duration: 50, type: 'game', sport: 'water-polo', description: 'Full match (4x8 min quarters)' },
  { name: 'Upper Body', duration: 60, type: 'strength', sport: null, description: 'Bench press, rows, shoulder press, curls' },
  { name: 'Lower Body', duration: 60, type: 'strength', sport: null, description: 'Squats, deadlifts, lunges, leg press' },
  { name: 'Push Day', duration: 50, type: 'strength', sport: null, description: 'Chest, shoulders, triceps focus' },
  { name: 'Pull Day', duration: 50, type: 'strength', sport: null, description: 'Back, biceps, rear delts focus' },
  { name: 'Leg Day', duration: 55, type: 'strength', sport: null, description: 'Quads, hamstrings, glutes, calves' },
  { name: 'Full Body Strength', duration: 45, type: 'strength', sport: null, description: 'Compound lifts: squat, bench, deadlift' },
  { name: 'Core & Abs', duration: 30, type: 'strength', sport: null, description: 'Planks, crunches, leg raises, Russian twists' },
  { name: 'Olympic Lifts', duration: 60, type: 'strength', sport: null, description: 'Clean & jerk, snatch, power cleans' },
  { name: 'A: Back/Biceps/Calves', duration: 50, type: 'strength', sport: null, description: 'Wide-Grip Lat Pulldown (RP 15-30 reps), One-Arm DB Row (2x12-20), Barbell Curl (RP 15-30), Calf Raise (2x12-20). RP = Rest-Pause: set to failure, rest 15-20s, repeat 2-3 mini-sets.' },
  { name: 'B: Chest/Shoulders/Tri', duration: 50, type: 'strength', sport: null, description: 'Flat DB Press (RP 15-30), Incline DB Press (2x12-15), DB Shoulder Press (RP 15-30), Overhead Triceps Extension (RP 15-30). RP = Rest-Pause for intensity.' },
  { name: 'C: Legs & Glutes', duration: 55, type: 'strength', sport: null, description: 'Barbell Squats (2x12-20), Leg Press Close Feet (WM 1x20), Romanian Deadlift (2x12-20), Leg Curl (WM 1x20), Hip Thrust (2x12-20). WM = Widowmaker: 20-rep set to failure.' },
  { name: 'PPL: Push', duration: 45, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Push day. Bench Press, Incline Press, Shoulder Press, Lateral Raises, Tricep Pushdowns. Focus on progressive overload.' },
  { name: 'PPL: Pull', duration: 45, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Pull day. Deadlift, Barbell Rows, Lat Pulldown, Face Pulls, Bicep Curls. Prioritize form over weight.' },
  { name: 'PPL: Legs', duration: 50, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Leg day. Squats, Leg Press, Romanian Deadlift, Leg Extensions, Leg Curls, Calf Raises. Full leg development.' },
  { name: 'Upper/Lower: Upper', duration: 50, type: 'strength', sport: null, description: 'Upper/Lower split - Upper day. Bench Press, Rows, Shoulder Press, Pull-ups, Bicep/Tricep work. 2-3 sets per exercise.' },
  { name: 'Upper/Lower: Lower', duration: 50, type: 'strength', sport: null, description: 'Upper/Lower split - Lower day. Squats, Romanian Deadlift, Leg Press, Lunges, Calf Raises. Focus on compound movements.' },
  { name: 'Bro Split: Chest', duration: 40, type: 'strength', sport: null, description: 'Chest focus day. Flat Bench Press, Incline DB Press, Cable Flyes, Dips. 3-4 sets each, 8-12 reps. Warm up properly.' },
  { name: 'Bro Split: Back', duration: 45, type: 'strength', sport: null, description: 'Back focus day. Deadlifts, Lat Pulldown, Barbell Rows, Seated Cable Rows, Face Pulls. Pull with your back, not arms.' },
  { name: 'Bro Split: Arms', duration: 35, type: 'strength', sport: null, description: 'Arms focus day. Barbell Curls, Hammer Curls, Tricep Pushdowns, Skull Crushers, Close-Grip Bench. Superset for pump.' },
];

export default function WorkoutLogScreen() {
  const router = useRouter();
  const [workoutType, setWorkoutType] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    router.back();
  };

  const applyTemplate = (template: WorkoutTemplate) => {
    setWorkoutType(template.type);
    setDuration(template.duration);
    if (template.sport) setSport(template.sport);
    if (template.description) setNotes(template.description);
  };

  const showSportSelector = workoutType === 'practice' || workoutType === 'game';

  const getRpeDescription = (value: number) => {
    if (value <= 2) return 'Very Light';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'Maximum Effort';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-workout">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Workout</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-workout">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.templatesScroll}
        >
          {QUICK_TEMPLATES.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={styles.templateChip}
              onPress={() => applyTemplate(template)}
              testID={`button-template-${index}`}
            >
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDuration}>{template.duration}min</Text>
              {template.description ? (
                <Text style={styles.templateDescription} numberOfLines={1}>{template.description}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Select
          label="Workout Type"
          placeholder="Select type"
          options={WORKOUT_TYPES}
          value={workoutType}
          onValueChange={setWorkoutType}
          testID="select-workout-type"
        />

        {showSportSelector && (
          <Select
            label="Sport"
            placeholder="Select sport"
            options={SPORTS}
            value={sport}
            onValueChange={setSport}
            testID="select-sport"
          />
        )}

        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Duration: {duration} minutes</Text>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={10}
            max={180}
            step={5}
            leftLabel="10m"
            rightLabel="3h"
            showValue={false}
            testID="slider-duration"
          />
        </View>

        <View style={styles.rpeSection}>
          <View style={styles.rpeHeader}>
            <Text style={styles.rpeLabel}>RPE (Rate of Perceived Exertion)</Text>
            <Text style={styles.rpeValue}>{rpe}/10</Text>
          </View>
          <Text style={styles.rpeDescription}>{getRpeDescription(rpe)}</Text>
          <Slider
            value={rpe}
            onValueChange={setRpe}
            min={1}
            max={10}
            step={1}
            leftLabel="Easy"
            rightLabel="Max"
            showValue={false}
            testID="slider-rpe"
          />
        </View>

        <Input
          label="Notes (optional)"
          placeholder="How did it go? Any specifics..."
          value={notes}
          onChangeText={setNotes}
          multiline
          testID="input-workout-notes"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Workout"
          onPress={handleSave}
          disabled={!workoutType}
          testID="button-save-workout"
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templatesScroll: {
    marginBottom: 24,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    marginRight: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  templateDuration: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  templateDescription: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    maxWidth: 140,
  },
  durationSection: {
    marginBottom: 24,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  rpeSection: {
    marginBottom: 24,
  },
  rpeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rpeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  rpeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  rpeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

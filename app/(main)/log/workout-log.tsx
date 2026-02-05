import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select, Slider } from '@/components/ui';
import { useLogWorkout } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

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

interface ExerciseSet {
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

interface WorkoutTemplate {
  name: string;
  duration: number;
  type: string;
  sport: string | null;
  description?: string;
  exercises?: { name: string; sets: number; reps: string; weight?: string }[];
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
  { name: 'Upper Body', duration: 60, type: 'strength', sport: null, description: 'Bench press, rows, shoulder press, curls',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: '8-12' },
      { name: 'Barbell Row', sets: 3, reps: '8-12' },
      { name: 'Shoulder Press', sets: 3, reps: '10-12' },
      { name: 'Bicep Curls', sets: 3, reps: '12-15' },
    ]},
  { name: 'Lower Body', duration: 60, type: 'strength', sport: null, description: 'Squats, deadlifts, lunges, leg press',
    exercises: [
      { name: 'Barbell Squat', sets: 3, reps: '8-12' },
      { name: 'Romanian Deadlift', sets: 3, reps: '8-12' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each' },
      { name: 'Leg Press', sets: 3, reps: '10-15' },
    ]},
  { name: 'Push Day', duration: 50, type: 'strength', sport: null, description: 'Chest, shoulders, triceps focus',
    exercises: [
      { name: 'Flat Bench Press', sets: 4, reps: '8-10' },
      { name: 'Incline DB Press', sets: 3, reps: '10-12' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
    ]},
  { name: 'Pull Day', duration: 50, type: 'strength', sport: null, description: 'Back, biceps, rear delts focus',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: '5-8' },
      { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
      { name: 'Face Pulls', sets: 3, reps: '15-20' },
      { name: 'Barbell Curl', sets: 3, reps: '10-12' },
    ]},
  { name: 'Leg Day', duration: 55, type: 'strength', sport: null, description: 'Quads, hamstrings, glutes, calves',
    exercises: [
      { name: 'Barbell Squat', sets: 4, reps: '6-10' },
      { name: 'Leg Press', sets: 3, reps: '10-15' },
      { name: 'Leg Curl', sets: 3, reps: '12-15' },
      { name: 'Calf Raises', sets: 4, reps: '15-20' },
    ]},
  { name: 'Full Body Strength', duration: 45, type: 'strength', sport: null, description: 'Compound lifts: squat, bench, deadlift',
    exercises: [
      { name: 'Barbell Squat', sets: 3, reps: '5-8' },
      { name: 'Bench Press', sets: 3, reps: '5-8' },
      { name: 'Deadlift', sets: 3, reps: '5-8' },
    ]},
  { name: 'Core & Abs', duration: 30, type: 'strength', sport: null, description: 'Planks, crunches, leg raises, Russian twists' },
  { name: 'Olympic Lifts', duration: 60, type: 'strength', sport: null, description: 'Clean & jerk, snatch, power cleans' },
  { name: 'A: Back/Biceps/Calves', duration: 50, type: 'strength', sport: null, description: 'Wide-Grip Lat Pulldown (RP 15-30 reps), One-Arm DB Row (2x12-20), Barbell Curl (RP 15-30), Calf Raise (2x12-20). RP = Rest-Pause: set to failure, rest 15-20s, repeat 2-3 mini-sets.',
    exercises: [
      { name: 'Wide-Grip Lat Pulldown (RP)', sets: 1, reps: '15-30' },
      { name: 'One-Arm DB Row', sets: 2, reps: '12-20' },
      { name: 'Barbell Curl (RP)', sets: 1, reps: '15-30' },
      { name: 'Calf Raise', sets: 2, reps: '12-20' },
    ]},
  { name: 'B: Chest/Shoulders/Tri', duration: 50, type: 'strength', sport: null, description: 'Flat DB Press (RP 15-30), Incline DB Press (2x12-15), DB Shoulder Press (RP 15-30), Overhead Triceps Extension (RP 15-30). RP = Rest-Pause for intensity.',
    exercises: [
      { name: 'Flat DB Press (RP)', sets: 1, reps: '15-30' },
      { name: 'Incline DB Press', sets: 2, reps: '12-15' },
      { name: 'DB Shoulder Press (RP)', sets: 1, reps: '15-30' },
      { name: 'Overhead Triceps Ext (RP)', sets: 1, reps: '15-30' },
    ]},
  { name: 'C: Legs & Glutes', duration: 55, type: 'strength', sport: null, description: 'Barbell Squats (2x12-20), Leg Press Close Feet (WM 1x20), Romanian Deadlift (2x12-20), Leg Curl (WM 1x20), Hip Thrust (2x12-20). WM = Widowmaker: 20-rep set to failure.',
    exercises: [
      { name: 'Barbell Squat', sets: 2, reps: '12-20' },
      { name: 'Leg Press Close Feet (WM)', sets: 1, reps: '20' },
      { name: 'Romanian Deadlift', sets: 2, reps: '12-20' },
      { name: 'Leg Curl (WM)', sets: 1, reps: '20' },
      { name: 'Hip Thrust', sets: 2, reps: '12-20' },
    ]},
  { name: 'PPL: Push', duration: 45, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Push day. Bench Press, Incline Press, Shoulder Press, Lateral Raises, Tricep Pushdowns. Focus on progressive overload.',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '6-10' },
      { name: 'Incline Press', sets: 3, reps: '8-12' },
      { name: 'Shoulder Press', sets: 3, reps: '8-12' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
    ]},
  { name: 'PPL: Pull', duration: 45, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Pull day. Deadlift, Barbell Rows, Lat Pulldown, Face Pulls, Bicep Curls. Prioritize form over weight.',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: '5-8' },
      { name: 'Barbell Rows', sets: 3, reps: '8-12' },
      { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
      { name: 'Face Pulls', sets: 3, reps: '15-20' },
      { name: 'Bicep Curls', sets: 3, reps: '10-12' },
    ]},
  { name: 'PPL: Legs', duration: 50, type: 'strength', sport: null, description: 'Push/Pull/Legs split - Leg day. Squats, Leg Press, Romanian Deadlift, Leg Extensions, Leg Curls, Calf Raises. Full leg development.',
    exercises: [
      { name: 'Barbell Squat', sets: 4, reps: '6-10' },
      { name: 'Leg Press', sets: 3, reps: '10-15' },
      { name: 'Romanian Deadlift', sets: 3, reps: '8-12' },
      { name: 'Leg Extensions', sets: 3, reps: '12-15' },
      { name: 'Leg Curls', sets: 3, reps: '12-15' },
      { name: 'Calf Raises', sets: 4, reps: '15-20' },
    ]},
  { name: 'Upper/Lower: Upper', duration: 50, type: 'strength', sport: null, description: 'Upper/Lower split - Upper day. Bench Press, Rows, Shoulder Press, Pull-ups, Bicep/Tricep work. 2-3 sets per exercise.',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: '8-10' },
      { name: 'Barbell Row', sets: 3, reps: '8-10' },
      { name: 'Shoulder Press', sets: 3, reps: '10-12' },
      { name: 'Pull-ups', sets: 3, reps: '6-10' },
      { name: 'Bicep Curls', sets: 2, reps: '12-15' },
      { name: 'Tricep Dips', sets: 2, reps: '10-12' },
    ]},
  { name: 'Upper/Lower: Lower', duration: 50, type: 'strength', sport: null, description: 'Upper/Lower split - Lower day. Squats, Romanian Deadlift, Leg Press, Lunges, Calf Raises. Focus on compound movements.',
    exercises: [
      { name: 'Barbell Squat', sets: 4, reps: '6-10' },
      { name: 'Romanian Deadlift', sets: 3, reps: '8-12' },
      { name: 'Leg Press', sets: 3, reps: '10-15' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each' },
      { name: 'Calf Raises', sets: 4, reps: '15-20' },
    ]},
  { name: 'Bro Split: Chest', duration: 40, type: 'strength', sport: null, description: 'Chest focus day. Flat Bench Press, Incline DB Press, Cable Flyes, Dips. 3-4 sets each, 8-12 reps. Warm up properly.',
    exercises: [
      { name: 'Flat Bench Press', sets: 4, reps: '8-12' },
      { name: 'Incline DB Press', sets: 3, reps: '10-12' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15' },
      { name: 'Dips', sets: 3, reps: '8-12' },
    ]},
  { name: 'Bro Split: Back', duration: 45, type: 'strength', sport: null, description: 'Back focus day. Deadlifts, Lat Pulldown, Barbell Rows, Seated Cable Rows, Face Pulls. Pull with your back, not arms.',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: '5-8' },
      { name: 'Lat Pulldown', sets: 3, reps: '10-12' },
      { name: 'Barbell Rows', sets: 3, reps: '8-12' },
      { name: 'Seated Cable Rows', sets: 3, reps: '10-12' },
      { name: 'Face Pulls', sets: 3, reps: '15-20' },
    ]},
  { name: 'Bro Split: Arms', duration: 35, type: 'strength', sport: null, description: 'Arms focus day. Barbell Curls, Hammer Curls, Tricep Pushdowns, Skull Crushers, Close-Grip Bench. Superset for pump.',
    exercises: [
      { name: 'Barbell Curls', sets: 3, reps: '10-12' },
      { name: 'Hammer Curls', sets: 3, reps: '10-12' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
      { name: 'Skull Crushers', sets: 3, reps: '10-12' },
      { name: 'Close-Grip Bench', sets: 3, reps: '8-10' },
    ]},
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function RestTimer({ onDismiss }: { onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(90);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (Platform.OS !== 'web') { Vibration.vibrate(500); }
            setIsRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, seconds]);

  const presets = [30, 60, 90, 120, 180];

  return (
    <View style={timerStyles.container}>
      <View style={timerStyles.header}>
        <Text style={timerStyles.title}>Rest Timer</Text>
        <TouchableOpacity onPress={onDismiss} testID="button-dismiss-timer">
          <Ionicons name="close-circle" size={28} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      <Text style={[timerStyles.time, seconds === 0 ? timerStyles.timeDone : undefined]}>
        {formatTime(seconds)}
      </Text>
      {seconds === 0 ? (
        <Text style={timerStyles.doneText}>Time to lift!</Text>
      ) : null}
      <View style={timerStyles.presets}>
        {presets.map((p) => (
          <TouchableOpacity
            key={p}
            style={[timerStyles.preset, seconds === p && isRunning ? timerStyles.presetActive : undefined]}
            onPress={() => { setSeconds(p); setIsRunning(true); }}
            testID={`button-timer-${p}`}
          >
            <Text style={[timerStyles.presetText, seconds === p && isRunning ? timerStyles.presetTextActive : undefined]}>
              {p >= 60 ? `${p / 60}m` : `${p}s`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={timerStyles.controls}>
        <TouchableOpacity
          style={timerStyles.controlBtn}
          onPress={() => setIsRunning(!isRunning)}
          testID="button-toggle-timer"
        >
          <Ionicons name={isRunning ? 'pause' : 'play'} size={20} color="#10B981" />
        </TouchableOpacity>
        <TouchableOpacity
          style={timerStyles.controlBtn}
          onPress={() => { setSeconds(90); setIsRunning(true); }}
          testID="button-reset-timer"
        >
          <Ionicons name="refresh" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ExerciseCard({
  exercise,
  onUpdate,
  onRemove,
}: {
  exercise: Exercise;
  onUpdate: (updated: Exercise) => void;
  onRemove: () => void;
}) {
  const updateSet = (setIndex: number, field: keyof ExerciseSet, value: string | boolean) => {
    const newSets = [...exercise.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    onUpdate({ ...exercise, sets: newSets });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    onUpdate({
      ...exercise,
      sets: [...exercise.sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '', completed: false }],
    });
  };

  const removeSet = (setIndex: number) => {
    if (exercise.sets.length <= 1) return;
    const newSets = exercise.sets.filter((_, i) => i !== setIndex);
    onUpdate({ ...exercise, sets: newSets });
  };

  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <View style={exerciseStyles.card}>
      <View style={exerciseStyles.header}>
        <TextInput
          style={exerciseStyles.nameInput}
          value={exercise.name}
          onChangeText={(text) => onUpdate({ ...exercise, name: text })}
          placeholder="Exercise name"
          placeholderTextColor="#94A3B8"
          testID={`input-exercise-name-${exercise.id}`}
        />
        <View style={exerciseStyles.headerRight}>
          <Text style={exerciseStyles.progress}>{completedSets}/{exercise.sets.length}</Text>
          <TouchableOpacity onPress={onRemove} testID={`button-remove-exercise-${exercise.id}`}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={exerciseStyles.setHeader}>
        <Text style={[exerciseStyles.setHeaderText, { width: 36 }]}>Set</Text>
        <Text style={[exerciseStyles.setHeaderText, { flex: 1 }]}>Weight</Text>
        <Text style={[exerciseStyles.setHeaderText, { flex: 1 }]}>Reps</Text>
        <View style={{ width: 32 }} />
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View key={setIndex} style={exerciseStyles.setRow}>
          <Text style={exerciseStyles.setNumber}>{setIndex + 1}</Text>
          <TextInput
            style={[exerciseStyles.setInput, set.completed ? exerciseStyles.setInputDone : undefined]}
            value={set.weight}
            onChangeText={(v) => updateSet(setIndex, 'weight', v)}
            placeholder="lbs"
            placeholderTextColor="#CBD5E1"
            keyboardType="numeric"
            testID={`input-weight-${exercise.id}-${setIndex}`}
          />
          <TextInput
            style={[exerciseStyles.setInput, set.completed ? exerciseStyles.setInputDone : undefined]}
            value={set.reps}
            onChangeText={(v) => updateSet(setIndex, 'reps', v)}
            placeholder="reps"
            placeholderTextColor="#CBD5E1"
            keyboardType="numeric"
            testID={`input-reps-${exercise.id}-${setIndex}`}
          />
          <TouchableOpacity
            style={[exerciseStyles.checkBtn, set.completed ? exerciseStyles.checkBtnDone : undefined]}
            onPress={() => updateSet(setIndex, 'completed', !set.completed)}
            testID={`button-complete-set-${exercise.id}-${setIndex}`}
          >
            <Ionicons name="checkmark" size={16} color={set.completed ? '#fff' : '#CBD5E1'} />
          </TouchableOpacity>
        </View>
      ))}

      <View style={exerciseStyles.actions}>
        <TouchableOpacity style={exerciseStyles.addSetBtn} onPress={addSet} testID={`button-add-set-${exercise.id}`}>
          <Ionicons name="add" size={16} color="#10B981" />
          <Text style={exerciseStyles.addSetText}>Add Set</Text>
        </TouchableOpacity>
        {exercise.sets.length > 1 ? (
          <TouchableOpacity
            style={exerciseStyles.removeSetBtn}
            onPress={() => removeSet(exercise.sets.length - 1)}
            testID={`button-remove-set-${exercise.id}`}
          >
            <Ionicons name="remove" size={16} color="#EF4444" />
            <Text style={exerciseStyles.removeSetText}>Remove Set</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function WorkoutLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logWorkout = useLogWorkout();
  const [workoutType, setWorkoutType] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'exercises'>('details');

  const handleSave = () => {
    const exerciseSummary = exercises
      .filter((e) => e.name.trim())
      .map((e) => {
        const completedSets = e.sets.filter((s) => s.completed);
        const setDetails = completedSets
          .map((s, i) => `${s.weight || '0'}lbs x ${s.reps || '0'}`)
          .join(', ');
        return `${e.name}: ${setDetails || `${e.sets.length} sets`}`;
      })
      .join('\n');

    const fullNotes = [notes, exerciseSummary].filter(Boolean).join('\n---\n');

    logWorkout.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        workoutType: workoutType || 'other',
        durationMinutes: duration,
        rpe,
        notes: fullNotes || null,
        source: 'manual',
      },
      {
        onSuccess: () => {
          showToast('success', 'Workout Saved', 'Great session! Keep it up');
          setTimeout(() => router.back(), 600);
        },
        onError: (error) => {
          showToast('error', 'Save Failed', error.message || 'Could not save workout');
        },
      }
    );
  };

  const applyTemplate = (template: WorkoutTemplate) => {
    setWorkoutType(template.type);
    setDuration(template.duration);
    if (template.sport) setSport(template.sport);
    if (template.description) setNotes(template.description);
    if (template.exercises) {
      const newExercises: Exercise[] = template.exercises.map((e, i) => ({
        id: `${Date.now()}-${i}`,
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({
          weight: e.weight || '',
          reps: '',
          completed: false,
        })),
      }));
      setExercises(newExercises);
      setActiveTab('exercises');
    }
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', sets: [{ weight: '', reps: '', completed: false }] },
    ]);
  };

  const updateExercise = useCallback((id: string, updated: Exercise) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const showSportSelector = workoutType === 'practice' || workoutType === 'game';
  const isStrength = workoutType === 'strength';

  const getRpeDescription = (value: number) => {
    if (value <= 2) return 'Very Light';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'Maximum Effort';
  };

  const totalCompletedSets = exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length, 0
  );
  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-workout">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Workout</Text>
        <View style={styles.headerActions}>
          {isStrength ? (
            <TouchableOpacity
              onPress={() => setShowTimer(!showTimer)}
              style={styles.timerButton}
              testID="button-show-timer"
            >
              <Ionicons name="timer-outline" size={22} color={showTimer ? '#10B981' : '#64748B'} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-workout">
            <Ionicons name="home-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {showTimer ? <RestTimer onDismiss={() => setShowTimer(false)} /> : null}

      {isStrength || exercises.length > 0 ? (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' ? styles.tabActive : undefined]}
            onPress={() => setActiveTab('details')}
            testID="tab-details"
          >
            <Text style={[styles.tabText, activeTab === 'details' ? styles.tabTextActive : undefined]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'exercises' ? styles.tabActive : undefined]}
            onPress={() => setActiveTab('exercises')}
            testID="tab-exercises"
          >
            <Text style={[styles.tabText, activeTab === 'exercises' ? styles.tabTextActive : undefined]}>
              Exercises {totalSets > 0 ? `(${totalCompletedSets}/${totalSets})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'details' ? (
          <>
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

            {showSportSelector ? (
              <Select
                label="Sport"
                placeholder="Select sport"
                options={SPORTS}
                value={sport}
                onValueChange={setSport}
                testID="select-sport"
              />
            ) : null}

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
          </>
        ) : (
          <>
            {exercises.length > 0 ? (
              <View style={styles.exerciseSummary}>
                <Text style={styles.exerciseSummaryText}>
                  {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} - {totalCompletedSets}/{totalSets} sets done
                </Text>
              </View>
            ) : null}
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={(updated) => updateExercise(exercise.id, updated)}
                onRemove={() => removeExercise(exercise.id)}
              />
            ))}
            <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise} testID="button-add-exercise">
              <Ionicons name="add-circle" size={24} color="#10B981" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={logWorkout.isPending ? 'Saving...' : 'Save Workout'}
          onPress={handleSave}
          disabled={!workoutType || logWorkout.isPending}
          testID="button-save-workout"
        />
      </View>
    </SafeAreaView>
  );
}

const timerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timeDone: {
    color: '#EF4444',
  },
  doneText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5F0',
  },
  presetActive: {
    backgroundColor: '#10B981',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  presetTextActive: {
    color: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const exerciseStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    padding: 0,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progress: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  setHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  setNumber: {
    width: 28,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
  },
  setInputDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  addSetText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  removeSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  removeSetText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
});

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#10B981',
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
  exerciseSummary: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  exerciseSummaryText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    textAlign: 'center',
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8F5F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addExerciseText: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

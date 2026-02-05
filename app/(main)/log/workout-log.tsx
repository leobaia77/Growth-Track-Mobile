import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Vibration, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Slider } from '@/components/ui';
import { useLogWorkout } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

interface ExerciseSet {
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: ExerciseSet[];
  duration: string;
  completed: boolean;
}

interface WorkoutTemplate {
  name: string;
  duration: number;
  description: string;
  exercises: { name: string; sets: number; reps: string; weight?: string; description?: string; duration?: string }[];
}

interface WorkoutCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  templates: WorkoutTemplate[];
}

const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'strength',
    label: 'Strength Training',
    icon: 'barbell',
    color: '#EF4444',
    description: 'Weight lifting, resistance training, and bodyweight exercises',
    templates: [
      { name: 'Upper Body', duration: 60, description: 'Chest, shoulders, back, and arms. Focus on compound pressing and pulling movements.',
        exercises: [
          { name: 'Bench Press', sets: 3, reps: '8-12', description: 'Lie flat, grip bar shoulder-width, lower to chest, press up' },
          { name: 'Barbell Row', sets: 3, reps: '8-12', description: 'Hinge at hips, pull bar to lower chest, squeeze shoulder blades' },
          { name: 'Shoulder Press', sets: 3, reps: '10-12', description: 'Press dumbbells overhead from shoulder height, control the descent' },
          { name: 'Bicep Curls', sets: 3, reps: '12-15', description: 'Curl dumbbells with elbows pinned to sides, full range of motion' },
        ]},
      { name: 'Lower Body', duration: 60, description: 'Quads, hamstrings, glutes, and calves. Heavy compound movements for leg development.',
        exercises: [
          { name: 'Barbell Squat', sets: 3, reps: '8-12', description: 'Bar on upper back, squat to parallel or below, drive through heels' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', description: 'Hinge at hips with slight knee bend, feel hamstring stretch, squeeze glutes at top' },
          { name: 'Walking Lunges', sets: 3, reps: '12 each', description: 'Step forward into a deep lunge, alternate legs with each step' },
          { name: 'Leg Press', sets: 3, reps: '10-15', description: 'Feet shoulder-width on platform, press to full extension without locking knees' },
        ]},
      { name: 'Full Body Strength', duration: 45, description: 'Big three compound lifts for total body strength. Keep rest periods 2-3 minutes.',
        exercises: [
          { name: 'Barbell Squat', sets: 3, reps: '5-8', description: 'Heavy compound lift - focus on depth and bracing your core' },
          { name: 'Bench Press', sets: 3, reps: '5-8', description: 'Plant feet, arch slightly, press with power off the chest' },
          { name: 'Deadlift', sets: 3, reps: '5-8', description: 'Bar over midfoot, flat back, drive through the floor' },
        ]},
      { name: 'Push Day', duration: 50, description: 'PPL Split - Push. Chest, shoulders, and triceps. Progressive overload each session.',
        exercises: [
          { name: 'Flat Bench Press', sets: 4, reps: '8-10', description: 'Primary chest builder - controlled descent, explosive push' },
          { name: 'Incline DB Press', sets: 3, reps: '10-12', description: '30-degree incline targets upper chest fibers' },
          { name: 'Lateral Raises', sets: 3, reps: '12-15', description: 'Slight bend in elbows, raise to shoulder height, control the negative' },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', description: 'Keep elbows pinned, extend fully, squeeze at the bottom' },
        ]},
      { name: 'Pull Day', duration: 50, description: 'PPL Split - Pull. Back, biceps, and rear delts. Prioritize mind-muscle connection.',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5-8', description: 'King of back exercises - maintain neutral spine throughout' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', description: 'Wide grip, pull to upper chest, squeeze lats at the bottom' },
          { name: 'Face Pulls', sets: 3, reps: '15-20', description: 'Pull rope to face level, externally rotate at the end' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', description: 'Strict form, no swinging - curl with controlled tempo' },
        ]},
      { name: 'Leg Day', duration: 55, description: 'PPL Split - Legs. Complete quad, hamstring, glute, and calf development.',
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '6-10', description: 'Primary leg builder - hit depth and drive up explosively' },
          { name: 'Leg Press', sets: 3, reps: '10-15', description: 'High and wide foot placement for glute emphasis' },
          { name: 'Leg Curl', sets: 3, reps: '12-15', description: 'Squeeze hamstrings at peak contraction, slow eccentric' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', description: 'Full stretch at bottom, pause at top, high reps for growth' },
        ]},
      { name: 'Upper/Lower: Upper', duration: 50, description: '4-day split upper session. Balance push and pull volume equally.',
        exercises: [
          { name: 'Bench Press', sets: 3, reps: '8-10', description: 'Horizontal push - retract scapula, plant feet firmly' },
          { name: 'Barbell Row', sets: 3, reps: '8-10', description: 'Horizontal pull - keep torso angle consistent' },
          { name: 'Shoulder Press', sets: 3, reps: '10-12', description: 'Overhead press with dumbbells or barbell' },
          { name: 'Pull-ups', sets: 3, reps: '6-10', description: 'Full hang to chin over bar - add weight if needed' },
          { name: 'Bicep Curls', sets: 2, reps: '12-15', description: 'Isolation finisher for biceps' },
          { name: 'Tricep Dips', sets: 2, reps: '10-12', description: 'Lean slightly forward for chest, upright for triceps' },
        ]},
      { name: 'Upper/Lower: Lower', duration: 50, description: '4-day split lower session. Prioritize squat and hip-hinge patterns.',
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '6-10', description: 'Knee-dominant compound - brace hard, control the descent' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', description: 'Hip-dominant compound - feel the hamstring stretch' },
          { name: 'Leg Press', sets: 3, reps: '10-15', description: 'Adjust foot position for quad vs glute emphasis' },
          { name: 'Walking Lunges', sets: 3, reps: '12 each', description: 'Unilateral work to fix imbalances' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', description: 'Standing or seated - full range of motion' },
        ]},
      { name: 'A: Back/Biceps/Calves', duration: 50, description: 'A/B/C Split - Day A. Uses Rest-Pause (RP) technique: go to failure, rest 15-20s, repeat 2-3 mini-sets.',
        exercises: [
          { name: 'Wide-Grip Lat Pulldown (RP)', sets: 1, reps: '15-30', description: 'Rest-Pause: 1 set to failure, rest 15-20s, repeat for 15-30 total reps' },
          { name: 'One-Arm DB Row', sets: 2, reps: '12-20', description: 'Brace on bench, row to hip, squeeze at the top' },
          { name: 'Barbell Curl (RP)', sets: 1, reps: '15-30', description: 'Rest-Pause: strict curls to failure, brief rest, continue' },
          { name: 'Calf Raise', sets: 2, reps: '12-20', description: 'Full stretch at bottom, pause and squeeze at top' },
        ]},
      { name: 'B: Chest/Shoulders/Tri', duration: 50, description: 'A/B/C Split - Day B. Rest-Pause sets for intensity. Push movements with controlled tempo.',
        exercises: [
          { name: 'Flat DB Press (RP)', sets: 1, reps: '15-30', description: 'Rest-Pause: press to failure, rack 15-20s, continue' },
          { name: 'Incline DB Press', sets: 2, reps: '12-15', description: 'Upper chest focus with 30-degree incline' },
          { name: 'DB Shoulder Press (RP)', sets: 1, reps: '15-30', description: 'Rest-Pause: overhead press to failure, brief rest, continue' },
          { name: 'Overhead Triceps Ext (RP)', sets: 1, reps: '15-30', description: 'Rest-Pause: full stretch at bottom, lock out at top' },
        ]},
      { name: 'C: Legs & Glutes', duration: 55, description: 'A/B/C Split - Day C. Widowmaker (WM) sets: one brutal 20-rep set to failure.',
        exercises: [
          { name: 'Barbell Squat', sets: 2, reps: '12-20', description: 'Moderate weight, controlled tempo, full depth' },
          { name: 'Leg Press Close Feet (WM)', sets: 1, reps: '20', description: 'Widowmaker: 20-rep set to absolute failure - choose weight wisely' },
          { name: 'Romanian Deadlift', sets: 2, reps: '12-20', description: 'Hip hinge with barbell, deep hamstring stretch' },
          { name: 'Leg Curl (WM)', sets: 1, reps: '20', description: 'Widowmaker: 20 grueling reps - no stopping' },
          { name: 'Hip Thrust', sets: 2, reps: '12-20', description: 'Back on bench, drive hips up, squeeze glutes 2 seconds at top' },
        ]},
      { name: 'Bro Split: Chest', duration: 40, description: 'Chest isolation day. High volume pressing and flye movements for maximum pump.',
        exercises: [
          { name: 'Flat Bench Press', sets: 4, reps: '8-12', description: 'Primary mass builder - touch chest, press to lockout' },
          { name: 'Incline DB Press', sets: 3, reps: '10-12', description: 'Upper chest development - 30-45 degree angle' },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', description: 'Squeeze at the center, maintain slight elbow bend' },
          { name: 'Dips', sets: 3, reps: '8-12', description: 'Lean forward for chest emphasis, deep stretch at bottom' },
        ]},
      { name: 'Bro Split: Back', duration: 45, description: 'Back isolation day. Mix of vertical and horizontal pulls for width and thickness.',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5-8', description: 'Heavy compound - set up tight, brace core, pull' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', description: 'Wide grip for lat width, pull to upper chest' },
          { name: 'Barbell Rows', sets: 3, reps: '8-12', description: 'Back thickness builder - row to belly button' },
          { name: 'Seated Cable Rows', sets: 3, reps: '10-12', description: 'V-grip handle, squeeze shoulder blades together' },
          { name: 'Face Pulls', sets: 3, reps: '15-20', description: 'Rear delt and rotator cuff health - essential' },
        ]},
      { name: 'Bro Split: Arms', duration: 35, description: 'Dedicated arm day. Superset biceps and triceps for maximum pump and efficiency.',
        exercises: [
          { name: 'Barbell Curls', sets: 3, reps: '10-12', description: 'Standing strict curls - no swinging or leaning' },
          { name: 'Hammer Curls', sets: 3, reps: '10-12', description: 'Neutral grip targets brachialis for arm thickness' },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', description: 'Cable pushdowns with straight or V-bar attachment' },
          { name: 'Skull Crushers', sets: 3, reps: '10-12', description: 'Lower bar to forehead, extend arms - feel the stretch' },
          { name: 'Close-Grip Bench', sets: 3, reps: '8-10', description: 'Hands shoulder-width, elbows tucked for tricep emphasis' },
        ]},
      { name: 'Core & Abs', duration: 30, description: 'Targeted core strengthening. Mix of stability, flexion, and rotation exercises.',
        exercises: [
          { name: 'Plank Hold', sets: 3, reps: '30-60s', description: 'Maintain straight line from head to heels, brace core tight', duration: '30-60s' },
          { name: 'Hanging Leg Raises', sets: 3, reps: '10-15', description: 'Hang from bar, raise legs to parallel, control the swing' },
          { name: 'Russian Twists', sets: 3, reps: '20 total', description: 'Sit with feet elevated, rotate torso side to side with weight' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '8-12', description: 'Roll out as far as possible, pull back with core - not arms' },
        ]},
    ],
  },
  {
    id: 'swimming',
    label: 'Swimming',
    icon: 'water',
    color: '#3B82F6',
    description: 'Pool workouts, lap swimming, and swim drills',
    templates: [
      { name: 'Swim Practice', duration: 90, description: 'Full structured practice: warm-up, drill work, main set, and cool-down.',
        exercises: [
          { name: 'Warm-Up', sets: 1, reps: '400m', description: 'Easy freestyle to get blood flowing and loosen up', duration: '10 min' },
          { name: 'Kick Drills', sets: 4, reps: '50m', description: 'Flutter kick with board, focus on ankle flexibility and hip drive', duration: '10 min' },
          { name: 'Main Set', sets: 8, reps: '100m', description: 'Freestyle at 80% effort with 15s rest between reps', duration: '25 min' },
          { name: 'Pull Set', sets: 4, reps: '100m', description: 'With pull buoy, focus on catch and pull-through mechanics', duration: '15 min' },
          { name: 'Cool-Down', sets: 1, reps: '200m', description: 'Easy backstroke or choice stroke, stretch in water', duration: '5 min' },
        ]},
      { name: 'Swim Drills', duration: 60, description: 'Technique-focused session. Work on stroke mechanics, catch, and body position.',
        exercises: [
          { name: 'Catch-Up Drill', sets: 4, reps: '50m', description: 'One arm stays extended until other hand catches up - improves timing', duration: '8 min' },
          { name: 'Fingertip Drag', sets: 4, reps: '50m', description: 'Drag fingertips along water surface during recovery - high elbow practice', duration: '8 min' },
          { name: 'Kick Sets', sets: 6, reps: '50m', description: 'Alternate flutter and dolphin kick with kickboard', duration: '15 min' },
          { name: 'Pull Sets', sets: 4, reps: '100m', description: 'Pull buoy between legs, focus purely on arm mechanics', duration: '15 min' },
          { name: 'Stroke Count', sets: 4, reps: '50m', description: 'Count strokes per length, try to reduce by 1 each set', duration: '10 min' },
        ]},
      { name: 'Sprint Set', duration: 45, description: 'High-intensity speed work. Short bursts with adequate recovery between efforts.',
        exercises: [
          { name: 'Warm-Up', sets: 1, reps: '300m', description: 'Easy mixed stroke to elevate heart rate gradually', duration: '8 min' },
          { name: 'Sprint 50s', sets: 10, reps: '50m', description: 'All-out sprint freestyle with 30 seconds rest between each', duration: '20 min' },
          { name: 'Recovery 100s', sets: 3, reps: '100m', description: 'Easy pace between sprint blocks to clear lactate', duration: '10 min' },
          { name: 'Cool-Down', sets: 1, reps: '200m', description: 'Very easy pace, stretch in the water after', duration: '5 min' },
        ]},
      { name: 'Distance Swim', duration: 75, description: 'Endurance-focused continuous swimming. Build aerobic base and stroke efficiency.',
        exercises: [
          { name: 'Warm-Up', sets: 1, reps: '400m', description: 'Progressive warm-up: easy to moderate pace', duration: '10 min' },
          { name: 'Continuous Swim', sets: 1, reps: '2000m', description: 'Steady-state freestyle at conversational pace, focus on breathing rhythm', duration: '40 min' },
          { name: 'Negative Split 200s', sets: 4, reps: '200m', description: 'Second 100m faster than first 100m of each rep', duration: '20 min' },
          { name: 'Cool-Down', sets: 1, reps: '200m', description: 'Easy backstroke, deep breathing, in-water stretching', duration: '5 min' },
        ]},
    ],
  },
  {
    id: 'water-polo',
    label: 'Water Polo',
    icon: 'football',
    color: '#8B5CF6',
    description: 'Water polo drills, conditioning, and game preparation',
    templates: [
      { name: 'WP Practice', duration: 90, description: 'Full team practice with treading, passing, shooting, and positional play.',
        exercises: [
          { name: 'Eggbeater Warm-Up', sets: 1, reps: '10 min', description: 'Tread water with eggbeater kick, raise arms progressively higher', duration: '10 min' },
          { name: 'Passing Drills', sets: 3, reps: '5 min', description: 'Partner passing: dry pass, wet pass, skip shot, lob pass', duration: '15 min' },
          { name: 'Shooting Drills', sets: 4, reps: '10 shots', description: 'Practice different shots: power, skip, lob, backhand from various positions', duration: '20 min' },
          { name: 'Positional Play', sets: 3, reps: '8 min', description: '6-on-6 half-court offense/defense with set plays', duration: '25 min' },
          { name: 'Sprint Swims', sets: 8, reps: '25m', description: 'Sprint with head up (game-like position) with ball', duration: '10 min' },
          { name: 'Cool-Down', sets: 1, reps: '200m', description: 'Easy swim with stretching in water', duration: '5 min' },
        ]},
      { name: 'WP Scrimmage', duration: 60, description: 'Game-situation scrimmage with focus on strategy, transitions, and team communication.',
        exercises: [
          { name: 'Dynamic Warm-Up', sets: 1, reps: '10 min', description: 'Tread, pass, sprint drills to get game-ready', duration: '10 min' },
          { name: 'Half-Court Sets', sets: 4, reps: '5 min', description: 'Practice offensive sets: drive, pick, and crash plays', duration: '20 min' },
          { name: 'Full Scrimmage', sets: 2, reps: '8 min', description: 'Full-game simulation with quarters, shot clock, and refs', duration: '20 min' },
          { name: 'Counterattack Drills', sets: 4, reps: '3 min', description: 'Practice fast break transitions: 3-on-2, 4-on-3 situations', duration: '10 min' },
        ]},
      { name: 'WP Conditioning', duration: 45, description: 'High-intensity pool conditioning. Builds the endurance and leg strength needed for games.',
        exercises: [
          { name: 'Eggbeater Intervals', sets: 6, reps: '2 min', description: 'Tread with hands out of water, alternate pressing up and holding weights', duration: '15 min' },
          { name: 'Sprint Swims', sets: 10, reps: '50m', description: 'Head-up sprints simulating game swimming intensity', duration: '15 min' },
          { name: 'Leg Work', sets: 4, reps: '3 min', description: 'Vertical jumps in deep water, wrestling position holds, ball-up drills', duration: '12 min' },
          { name: 'Cool-Down', sets: 1, reps: '100m', description: 'Easy backstroke to recover', duration: '3 min' },
        ]},
      { name: 'WP Game Day', duration: 50, description: 'Full match warm-up and game structure. 4 quarters of 8 minutes each.',
        exercises: [
          { name: 'Pre-Game Warm-Up', sets: 1, reps: '10 min', description: 'Easy swim, passing drills, shooting practice to warm up', duration: '10 min' },
          { name: 'Quarter 1', sets: 1, reps: '8 min', description: 'Full intensity - execute set plays, press defense', duration: '8 min' },
          { name: 'Quarter 2', sets: 1, reps: '8 min', description: 'Adjust strategy based on Q1, focus on counterattacks', duration: '8 min' },
          { name: 'Quarter 3', sets: 1, reps: '8 min', description: 'Maintain intensity, manage substitutions and fouls', duration: '8 min' },
          { name: 'Quarter 4', sets: 1, reps: '8 min', description: 'Close out the game, manage clock, execute under pressure', duration: '8 min' },
        ]},
    ],
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: 'heart',
    color: '#F59E0B',
    description: 'Running, cycling, and endurance training',
    templates: [
      { name: 'Easy Run', duration: 30, description: 'Low-intensity run at a conversational pace. Great for active recovery days.',
        exercises: [
          { name: 'Warm-Up Walk', sets: 1, reps: '5 min', description: 'Brisk walk to ease into movement', duration: '5 min' },
          { name: 'Easy Jog', sets: 1, reps: '20 min', description: 'Run at a pace where you can hold a conversation comfortably', duration: '20 min' },
          { name: 'Cool-Down Walk', sets: 1, reps: '5 min', description: 'Gradually slow to a walk, stretch after', duration: '5 min' },
        ]},
      { name: 'Interval Run', duration: 35, description: 'Alternating high and low intensity intervals. Builds speed and cardiovascular fitness.',
        exercises: [
          { name: 'Warm-Up Jog', sets: 1, reps: '5 min', description: 'Easy jog to elevate heart rate gradually', duration: '5 min' },
          { name: 'Sprint Intervals', sets: 8, reps: '30s on / 60s off', description: 'Sprint 30 seconds, jog/walk 60 seconds recovery', duration: '12 min' },
          { name: 'Tempo Run', sets: 1, reps: '10 min', description: 'Steady moderate-hard pace - comfortably uncomfortable', duration: '10 min' },
          { name: 'Cool-Down', sets: 1, reps: '5 min', description: 'Easy jog to walk, dynamic stretching', duration: '5 min' },
        ]},
      { name: 'HIIT Circuit', duration: 25, description: 'High-intensity bodyweight circuit. Maximum calorie burn in minimum time.',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: '45s', description: 'Full range of motion, arms overhead, feet together/apart', duration: '45s' },
          { name: 'Burpees', sets: 3, reps: '30s', description: 'Drop to push-up, jump up explosively with arms overhead', duration: '30s' },
          { name: 'Mountain Climbers', sets: 3, reps: '45s', description: 'Plank position, drive knees to chest alternately at speed', duration: '45s' },
          { name: 'High Knees', sets: 3, reps: '30s', description: 'Run in place driving knees above hip height', duration: '30s' },
          { name: 'Box Jumps', sets: 3, reps: '10', description: 'Jump onto a sturdy surface, step down, repeat', duration: '30s' },
        ]},
    ],
  },
  {
    id: 'flexibility',
    label: 'Flexibility & Yoga',
    icon: 'body',
    color: '#10B981',
    description: 'Stretching, yoga flows, and mobility work',
    templates: [
      { name: 'Morning Stretch', duration: 15, description: 'Gentle full-body stretch to wake up your muscles and improve mobility.',
        exercises: [
          { name: 'Neck Rolls', sets: 1, reps: '1 min each direction', description: 'Slow circles, pause where you feel tightness', duration: '2 min' },
          { name: 'Cat-Cow Stretch', sets: 1, reps: '10 cycles', description: 'On hands and knees, alternate arching and rounding spine', duration: '3 min' },
          { name: 'Downward Dog', sets: 1, reps: '30s hold', description: 'Inverted V position, press heels toward floor, pedal feet', duration: '2 min' },
          { name: 'Hip Flexor Stretch', sets: 2, reps: '30s each side', description: 'Lunge position, push hips forward, feel front of hip open', duration: '3 min' },
          { name: 'Hamstring Stretch', sets: 2, reps: '30s each side', description: 'Seated or standing, reach toward toes keeping back straight', duration: '3 min' },
        ]},
      { name: 'Yoga Flow', duration: 30, description: 'Sun salutation-based flow connecting breath with movement. All levels.',
        exercises: [
          { name: 'Mountain Pose & Breathing', sets: 1, reps: '2 min', description: 'Stand tall, ground through feet, deep belly breaths', duration: '2 min' },
          { name: 'Sun Salutation A', sets: 5, reps: '1 flow', description: 'Forward fold, plank, chaturanga, updog, downdog - breath-led', duration: '10 min' },
          { name: 'Warrior Series', sets: 2, reps: 'each side', description: 'Warrior I, II, III - hold each for 5 breaths per side', duration: '8 min' },
          { name: 'Balance Poses', sets: 2, reps: 'each side', description: 'Tree pose, dancer pose - focus on a fixed point', duration: '5 min' },
          { name: 'Savasana', sets: 1, reps: '5 min', description: 'Lie flat, close eyes, release all tension, final relaxation', duration: '5 min' },
        ]},
    ],
  },
  {
    id: 'sport',
    label: 'Sport Practice',
    icon: 'trophy',
    color: '#EC4899',
    description: 'Team sport practices, drills, and game preparation',
    templates: [
      { name: 'Soccer Practice', duration: 90, description: 'Full team practice with technical drills, tactical work, and scrimmage.',
        exercises: [
          { name: 'Dynamic Warm-Up', sets: 1, reps: '15 min', description: 'Jogging, high knees, butt kicks, lateral shuffles, leg swings', duration: '15 min' },
          { name: 'Passing & Control', sets: 1, reps: '15 min', description: 'Short and long passing drills, first touch practice', duration: '15 min' },
          { name: 'Shooting Drills', sets: 1, reps: '15 min', description: 'Finishing from various positions, volleys, headers', duration: '15 min' },
          { name: 'Small-Sided Game', sets: 1, reps: '20 min', description: '5v5 or 6v6 on reduced field for quick decision making', duration: '20 min' },
          { name: 'Scrimmage', sets: 1, reps: '20 min', description: 'Full-field 11v11 game simulation with tactical adjustments', duration: '20 min' },
          { name: 'Cool-Down & Stretch', sets: 1, reps: '5 min', description: 'Light jog, static stretching for quads, hamstrings, hip flexors', duration: '5 min' },
        ]},
      { name: 'Basketball Practice', duration: 75, description: 'Skills development with shooting, ball handling, and live play.',
        exercises: [
          { name: 'Ball Handling Drills', sets: 1, reps: '10 min', description: 'Crossovers, between legs, behind back, figure 8s', duration: '10 min' },
          { name: 'Shooting Drills', sets: 1, reps: '15 min', description: 'Spot shooting, catch-and-shoot, off-the-dribble from 5 spots', duration: '15 min' },
          { name: 'Layup Lines', sets: 1, reps: '10 min', description: 'Right and left hand finishes, reverse layups, floaters', duration: '10 min' },
          { name: 'Defensive Slides', sets: 3, reps: '2 min', description: 'Lateral shuffle, closeouts, drop steps in defensive stance', duration: '10 min' },
          { name: 'Full Court Scrimmage', sets: 1, reps: '25 min', description: 'Live 5v5 game play with coach stoppages for teaching', duration: '25 min' },
        ]},
      { name: 'Game Day Warm-Up', duration: 25, description: 'Pre-game activation routine to get mentally and physically ready.',
        exercises: [
          { name: 'Light Jog', sets: 1, reps: '5 min', description: 'Easy jog around the field/court to increase body temperature', duration: '5 min' },
          { name: 'Dynamic Stretching', sets: 1, reps: '8 min', description: 'Leg swings, arm circles, hip openers, walking lunges', duration: '8 min' },
          { name: 'Sport-Specific Drills', sets: 1, reps: '7 min', description: 'Quick touches, passes, shots - get comfortable with the ball', duration: '7 min' },
          { name: 'Mental Preparation', sets: 1, reps: '5 min', description: 'Visualization, deep breaths, review game plan and personal goals', duration: '5 min' },
        ]},
    ],
  },
];

type ScreenStep = 'type-select' | 'template-select' | 'workout-active';

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
        <Text style={timerStyles.doneText}>Time to go!</Text>
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

function ActiveExerciseCard({
  exercise,
  index,
  onUpdate,
  onRemove,
  onToggleComplete,
}: {
  exercise: Exercise;
  index: number;
  onUpdate: (updated: Exercise) => void;
  onRemove: () => void;
  onToggleComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(!exercise.completed);

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
    onUpdate({ ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) });
  };

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const allSetsCompleted = completedSets === exercise.sets.length && exercise.sets.length > 0;

  return (
    <View style={[exStyles.card, exercise.completed ? exStyles.cardDone : undefined]}>
      <TouchableOpacity
        style={exStyles.cardHeader}
        onPress={() => setExpanded(!expanded)}
        testID={`button-toggle-exercise-${exercise.id}`}
      >
        <TouchableOpacity
          style={[exStyles.checkbox, exercise.completed ? exStyles.checkboxDone : undefined]}
          onPress={onToggleComplete}
          testID={`button-done-exercise-${exercise.id}`}
        >
          {exercise.completed ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
        </TouchableOpacity>
        <View style={exStyles.cardInfo}>
          <Text style={[exStyles.cardName, exercise.completed ? exStyles.cardNameDone : undefined]}>
            {index + 1}. {exercise.name}
          </Text>
          {exercise.description ? (
            <Text style={exStyles.cardDesc} numberOfLines={expanded ? undefined : 1}>{exercise.description}</Text>
          ) : null}
        </View>
        <View style={exStyles.cardMeta}>
          {exercise.duration ? (
            <Text style={exStyles.metaText}>{exercise.duration}</Text>
          ) : (
            <Text style={exStyles.metaText}>{completedSets}/{exercise.sets.length} sets</Text>
          )}
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={exStyles.cardBody}>
          {exercise.sets.length > 0 && !exercise.duration ? (
            <>
              <View style={exStyles.setHeader}>
                <Text style={[exStyles.setHeaderText, { width: 32 }]}>Set</Text>
                <Text style={[exStyles.setHeaderText, { flex: 1 }]}>Weight</Text>
                <Text style={[exStyles.setHeaderText, { flex: 1 }]}>Reps</Text>
                <View style={{ width: 32 }} />
              </View>
              {exercise.sets.map((set, si) => (
                <View key={si} style={exStyles.setRow}>
                  <Text style={exStyles.setNum}>{si + 1}</Text>
                  <TextInput
                    style={[exStyles.setInput, set.completed ? exStyles.setInputDone : undefined]}
                    value={set.weight}
                    onChangeText={(v) => updateSet(si, 'weight', v)}
                    placeholder="lbs"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    testID={`input-weight-${exercise.id}-${si}`}
                  />
                  <TextInput
                    style={[exStyles.setInput, set.completed ? exStyles.setInputDone : undefined]}
                    value={set.reps}
                    onChangeText={(v) => updateSet(si, 'reps', v)}
                    placeholder="reps"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    testID={`input-reps-${exercise.id}-${si}`}
                  />
                  <TouchableOpacity
                    style={[exStyles.setCheck, set.completed ? exStyles.setCheckDone : undefined]}
                    onPress={() => updateSet(si, 'completed', !set.completed)}
                    testID={`button-set-done-${exercise.id}-${si}`}
                  >
                    <Ionicons name="checkmark" size={14} color={set.completed ? '#fff' : '#CBD5E1'} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={exStyles.setActions}>
                <TouchableOpacity style={exStyles.setActionBtn} onPress={addSet} testID={`button-add-set-${exercise.id}`}>
                  <Ionicons name="add" size={14} color="#10B981" />
                  <Text style={exStyles.setActionAdd}>Add Set</Text>
                </TouchableOpacity>
                {exercise.sets.length > 1 ? (
                  <TouchableOpacity style={exStyles.setActionBtn} onPress={() => removeSet(exercise.sets.length - 1)} testID={`button-rm-set-${exercise.id}`}>
                    <Ionicons name="remove" size={14} color="#EF4444" />
                    <Text style={exStyles.setActionRm}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : null}

          <View style={exStyles.editRow}>
            <TextInput
              style={exStyles.editName}
              value={exercise.name}
              onChangeText={(text) => onUpdate({ ...exercise, name: text })}
              placeholder="Exercise name"
              placeholderTextColor="#94A3B8"
              testID={`input-name-${exercise.id}`}
            />
            <TouchableOpacity onPress={onRemove} style={exStyles.deleteBtn} testID={`button-delete-exercise-${exercise.id}`}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function WorkoutLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logWorkout = useLogWorkout();
  const [step, setStep] = useState<ScreenStep>('type-select');
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [customCategories, setCustomCategories] = useState<WorkoutCategory[]>([]);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [duration, setDuration] = useState(60);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showTimer, setShowTimer] = useState(false);

  const allCategories = [...WORKOUT_CATEGORIES, ...customCategories];

  const handleSelectCategory = (cat: WorkoutCategory) => {
    setSelectedCategory(cat);
    setStep('template-select');
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setDuration(template.duration);
    setNotes(template.description);
    const newExercises: Exercise[] = template.exercises.map((e, i) => ({
      id: `${Date.now()}-${i}`,
      name: e.name,
      description: e.description || '',
      duration: e.duration || '',
      completed: false,
      sets: e.duration ? [] : Array.from({ length: e.sets }, () => ({
        weight: e.weight || '',
        reps: '',
        completed: false,
      })),
    }));
    setExercises(newExercises);
    setStep('workout-active');
  };

  const handleStartCustom = () => {
    setSelectedTemplate(null);
    setExercises([]);
    setNotes('');
    setStep('workout-active');
  };

  const handleAddCustomType = () => {
    if (!newTypeName.trim()) return;
    const newCat: WorkoutCategory = {
      id: `custom-${Date.now()}`,
      label: newTypeName.trim(),
      icon: 'fitness',
      color: '#6B7280',
      description: 'Custom workout type',
      templates: [],
    };
    setCustomCategories((prev) => [...prev, newCat]);
    setNewTypeName('');
    setShowAddType(false);
    handleSelectCategory(newCat);
  };

  const handleSave = () => {
    const exerciseSummary = exercises
      .filter((e) => e.name.trim())
      .map((e) => {
        const completedSets = e.sets.filter((s) => s.completed);
        if (e.duration) {
          return `${e.name}: ${e.completed ? 'Done' : 'Skipped'} (${e.duration})`;
        }
        const setDetails = completedSets
          .map((s) => `${s.weight || '0'}lbs x ${s.reps || '0'}`)
          .join(', ');
        return `${e.name}: ${setDetails || `${e.sets.length} sets`}`;
      })
      .join('\n');

    const fullNotes = [notes, exerciseSummary].filter(Boolean).join('\n---\n');

    logWorkout.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        workoutType: selectedCategory?.id || 'other',
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

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', description: '', duration: '', completed: false, sets: [{ weight: '', reps: '', completed: false }] },
    ]);
  };

  const updateExercise = useCallback((id: string, updated: Exercise) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleExerciseComplete = useCallback((id: string) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  }, []);

  const completedCount = exercises.filter((e) => e.completed).length;

  const getRpeDescription = (value: number) => {
    if (value <= 2) return 'Very Light';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'Maximum Effort';
  };

  const handleBack = () => {
    if (step === 'workout-active') {
      setStep('template-select');
    } else if (step === 'template-select') {
      setStep('type-select');
      setSelectedCategory(null);
    } else {
      router.back();
    }
  };

  const getTitle = () => {
    if (step === 'type-select') return 'Log Workout';
    if (step === 'template-select') return selectedCategory?.label || 'Templates';
    return selectedTemplate?.name || 'Workout';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="button-back-workout">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{getTitle()}</Text>
        <View style={styles.headerActions}>
          {step === 'workout-active' ? (
            <TouchableOpacity
              onPress={() => setShowTimer(!showTimer)}
              style={styles.timerButton}
              testID="button-show-timer"
            >
              <Ionicons name="timer-outline" size={22} color={showTimer ? '#10B981' : '#64748B'} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-workout">
            <Ionicons name="home-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {showTimer ? <RestTimer onDismiss={() => setShowTimer(false)} /> : null}

      {step === 'type-select' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Choose Workout Type</Text>
          <Text style={styles.sectionSubtitle}>Select a category to see available templates</Text>

          <View style={styles.categoryGrid}>
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleSelectCategory(cat)}
                testID={`button-category-${cat.id}`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon as never} size={28} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryDesc} numberOfLines={2}>{cat.description}</Text>
                <Text style={styles.categoryCount}>{cat.templates.length} template{cat.templates.length !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {showAddType ? (
            <View style={styles.addTypeForm}>
              <TextInput
                style={styles.addTypeInput}
                placeholder="Enter workout type name..."
                placeholderTextColor="#94A3B8"
                value={newTypeName}
                onChangeText={setNewTypeName}
                autoFocus
                testID="input-new-type-name"
              />
              <View style={styles.addTypeActions}>
                <TouchableOpacity style={styles.addTypeCancel} onPress={() => { setShowAddType(false); setNewTypeName(''); }} testID="button-cancel-type">
                  <Text style={styles.addTypeCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addTypeConfirm} onPress={handleAddCustomType} testID="button-confirm-type">
                  <Text style={styles.addTypeConfirmText}>Add Type</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addTypeBtn} onPress={() => setShowAddType(true)} testID="button-add-type">
              <Ionicons name="add-circle-outline" size={22} color="#10B981" />
              <Text style={styles.addTypeBtnText}>Add Custom Type</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : null}

      {step === 'template-select' && selectedCategory ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.selectedCatHeader}>
            <View style={[styles.selectedCatIcon, { backgroundColor: selectedCategory.color + '15' }]}>
              <Ionicons name={selectedCategory.icon as never} size={24} color={selectedCategory.color} />
            </View>
            <View style={styles.selectedCatInfo}>
              <Text style={styles.selectedCatLabel}>{selectedCategory.label}</Text>
              <Text style={styles.selectedCatDesc}>{selectedCategory.description}</Text>
            </View>
          </View>

          {selectedCategory.templates.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Choose a Template</Text>
              {selectedCategory.templates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateCard}
                  onPress={() => handleSelectTemplate(template)}
                  testID={`button-template-${index}`}
                >
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.templateMeta}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.templateDuration}>{template.duration} min</Text>
                    </View>
                  </View>
                  <Text style={styles.templateDesc}>{template.description}</Text>
                  <View style={styles.templateExercises}>
                    {template.exercises.slice(0, 4).map((ex, ei) => (
                      <View key={ei} style={styles.templateExItem}>
                        <View style={styles.templateExDot} />
                        <Text style={styles.templateExName}>{ex.name}</Text>
                        <Text style={styles.templateExDetail}>
                          {ex.duration ? ex.duration : `${ex.sets}x${ex.reps}`}
                        </Text>
                      </View>
                    ))}
                    {template.exercises.length > 4 ? (
                      <Text style={styles.templateMore}>+{template.exercises.length - 4} more exercises</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyTemplates}>
              <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No templates for this type yet</Text>
              <Text style={styles.emptySubtext}>Start a custom workout instead</Text>
            </View>
          )}

          <TouchableOpacity style={styles.customWorkoutBtn} onPress={handleStartCustom} testID="button-custom-workout">
            <Ionicons name="create-outline" size={20} color="#10B981" />
            <Text style={styles.customWorkoutText}>Start Custom Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}

      {step === 'workout-active' ? (
        <>
          {exercises.length > 0 ? (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(completedCount / exercises.length) * 100}%` }]} />
              <Text style={styles.progressText}>{completedCount}/{exercises.length} completed</Text>
            </View>
          ) : null}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {selectedTemplate ? (
              <View style={styles.activeHeader}>
                <Text style={styles.activeDesc}>{selectedTemplate.description}</Text>
              </View>
            ) : null}

            {exercises.map((exercise, index) => (
              <ActiveExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onUpdate={(updated) => updateExercise(exercise.id, updated)}
                onRemove={() => removeExercise(exercise.id)}
                onToggleComplete={() => toggleExerciseComplete(exercise.id)}
              />
            ))}

            <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise} testID="button-add-exercise">
              <Ionicons name="add-circle" size={22} color="#10B981" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>

            <View style={styles.workoutDetails}>
              <View style={styles.durationSection}>
                <Text style={styles.durationLabel}>Duration: {duration} min</Text>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={5}
                  max={180}
                  step={5}
                  leftLabel="5m"
                  rightLabel="3h"
                  showValue={false}
                  testID="slider-duration"
                />
              </View>

              <View style={styles.rpeSection}>
                <View style={styles.rpeHeader}>
                  <Text style={styles.rpeLabel}>Effort (RPE)</Text>
                  <Text style={styles.rpeValue}>{rpe}/10 - {getRpeDescription(rpe)}</Text>
                </View>
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

              <TextInput
                style={styles.notesInput}
                placeholder="Notes (optional) - How did it go?"
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                testID="input-workout-notes"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={logWorkout.isPending ? 'Saving...' : 'Save Workout'}
              onPress={handleSave}
              disabled={logWorkout.isPending}
              testID="button-save-workout"
            />
          </View>
        </>
      ) : null}
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
  title: { fontSize: 14, fontWeight: '600', color: '#374151' },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timeDone: { color: '#EF4444' },
  doneText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#EF4444', marginBottom: 8 },
  presets: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 8 },
  preset: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E8F5F0' },
  presetActive: { backgroundColor: '#10B981' },
  presetText: { fontSize: 13, fontWeight: '500', color: '#10B981' },
  presetTextActive: { color: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 },
  controlBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E8F5F0', justifyContent: 'center', alignItems: 'center',
  },
});

const exStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardDone: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#CBD5E1',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  cardNameDone: { color: '#10B981', textDecorationLine: 'line-through' },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
  cardMeta: { alignItems: 'flex-end', gap: 2 },
  metaText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  setHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginTop: 10, paddingHorizontal: 2 },
  setHeaderText: { fontSize: 10, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  setNum: { width: 26, fontSize: 13, fontWeight: '600', color: '#94A3B8', textAlign: 'center' },
  setInput: {
    flex: 1, height: 34, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 8, paddingHorizontal: 8, fontSize: 13, color: '#1F2937',
    backgroundColor: '#F8FAFC', textAlign: 'center',
  },
  setInputDone: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  setCheck: {
    width: 28, height: 28, borderRadius: 7,
    borderWidth: 2, borderColor: '#E2E8F0',
    justifyContent: 'center', alignItems: 'center',
  },
  setCheckDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  setActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  setActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  setActionAdd: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  setActionRm: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  editRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10,
  },
  editName: {
    flex: 1, height: 36, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 8, paddingHorizontal: 10, fontSize: 13, color: '#374151',
    backgroundColor: '#F8FAFC',
  },
  deleteBtn: { padding: 8 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E8F5F0',
  },
  backButton: { padding: 8 },
  homeButton: { padding: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerButton: { padding: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#1F2937', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5F0',
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  categoryLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  categoryDesc: { fontSize: 11, color: '#64748B', lineHeight: 15, marginBottom: 6 },
  categoryCount: { fontSize: 11, color: '#10B981', fontWeight: '600' },

  addTypeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderWidth: 2, borderColor: '#E8F5F0',
    borderStyle: 'dashed', borderRadius: 14, marginBottom: 30,
  },
  addTypeBtnText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  addTypeForm: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 30,
  },
  addTypeInput: {
    height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 14, fontSize: 15, color: '#1F2937', marginBottom: 12,
  },
  addTypeActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  addTypeCancel: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9' },
  addTypeCancelText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  addTypeConfirm: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#10B981' },
  addTypeConfirmText: { fontSize: 14, color: '#fff', fontWeight: '600' },

  selectedCatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: '#E8F5F0', marginBottom: 20,
  },
  selectedCatIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  selectedCatInfo: { flex: 1 },
  selectedCatLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  selectedCatDesc: { fontSize: 12, color: '#64748B' },

  templateCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E8F5F0',
  },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  templateName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  templateMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  templateDuration: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  templateDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 10 },
  templateExercises: { gap: 4 },
  templateExItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  templateExDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  templateExName: { flex: 1, fontSize: 13, color: '#374151' },
  templateExDetail: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  templateMore: { fontSize: 12, color: '#10B981', fontWeight: '500', marginTop: 4, paddingLeft: 13 },

  emptyTemplates: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#CBD5E1', marginTop: 4 },

  customWorkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderWidth: 2, borderColor: '#E8F5F0',
    borderStyle: 'dashed', borderRadius: 14, marginTop: 8, marginBottom: 30,
  },
  customWorkoutText: { fontSize: 14, color: '#10B981', fontWeight: '600' },

  progressBar: {
    height: 28, backgroundColor: '#F1F5F9', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  progressFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: '#D1FAE5',
  },
  progressText: {
    textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#10B981', zIndex: 1,
  },

  activeHeader: { marginBottom: 16 },
  activeDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, fontStyle: 'italic' },

  addExerciseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderWidth: 2, borderColor: '#E8F5F0',
    borderStyle: 'dashed', borderRadius: 14, marginBottom: 20,
  },
  addExerciseText: { fontSize: 14, color: '#10B981', fontWeight: '600' },

  workoutDetails: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E8F5F0', marginBottom: 30,
  },
  durationSection: { marginBottom: 20 },
  durationLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  rpeSection: { marginBottom: 16 },
  rpeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rpeLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  rpeValue: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  notesInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1F2937', minHeight: 70,
    textAlignVertical: 'top', backgroundColor: '#F8FAFC',
  },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E8F5F0' },
});

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { usePtRoutines, useLogPtAdherence } from '@/hooks/useApi';

interface ExerciseFeedback {
  difficulty: number;
  painLevel: 'none' | 'mild' | 'significant';
}

interface Exercise {
  id: string;
  name: string;
  description?: string;
  durationSeconds?: number;
  repetitions?: number;
  sets?: number;
  instructions?: string[];
  targetArea?: string;
  completed: boolean;
  feedback?: ExerciseFeedback;
}

interface Routine {
  id: string;
  name: string;
  exercises: { exercise: Exercise; orderIndex: number; customNotes?: string }[];
}

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Cat-Cow Stretch',
    sets: 1,
    durationSeconds: 60,
    completed: false,
    description: 'Alternate between arching your back (cow) and rounding it (cat) while on hands and knees.',
    instructions: [
      'Start on hands and knees with wrists under shoulders',
      'Inhale: Drop belly, lift head and tailbone (cow)',
      'Exhale: Round spine, tuck chin and tailbone (cat)',
      'Move slowly and smoothly between positions',
    ],
    targetArea: 'Spine Mobility',
  },
  {
    id: '2',
    name: "Child's Pose",
    sets: 1,
    durationSeconds: 45,
    completed: false,
    description: 'A gentle resting stretch that elongates the spine and relieves tension.',
    instructions: [
      'Kneel on the floor, big toes together',
      'Sit back on your heels',
      'Fold forward, reaching arms out in front',
      'Rest forehead on the floor and breathe deeply',
    ],
    targetArea: 'Back & Hips',
  },
  {
    id: '3',
    name: 'Pelvic Tilt',
    sets: 3,
    repetitions: 10,
    durationSeconds: 30,
    completed: false,
    description: 'Engages deep core muscles to stabilize the pelvis and lower back.',
    instructions: [
      'Lie on your back with knees bent, feet flat',
      'Flatten your lower back against the floor',
      'Tighten your abs and hold for 3-5 seconds',
      'Release and repeat',
    ],
    targetArea: 'Core & Pelvis',
  },
  {
    id: '4',
    name: 'Side Stretch',
    sets: 2,
    durationSeconds: 30,
    completed: false,
    description: 'Stretches the concave side of the spinal curve to promote balance.',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Raise one arm overhead',
      'Lean gently to the opposite side',
      'Hold the stretch, breathing deeply',
    ],
    targetArea: 'Lateral Spine',
  },
  {
    id: '5',
    name: 'Core Breathing',
    sets: 1,
    durationSeconds: 90,
    completed: false,
    description: 'Diaphragmatic breathing that strengthens core stability and promotes spinal alignment.',
    instructions: [
      'Lie on your back with knees bent',
      'Place one hand on chest, one on belly',
      'Breathe in through nose - belly should rise',
      'Exhale slowly through mouth - belly falls',
      'Keep chest relatively still throughout',
    ],
    targetArea: 'Core & Breathing',
  },
];

const DIFFICULTY_LABELS = ['Easy', '', 'Medium', '', 'Hard'];
const PAIN_OPTIONS: { key: 'none' | 'mild' | 'significant'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'none', label: 'None', icon: 'happy-outline' },
  { key: 'mild', label: 'Mild', icon: 'alert-circle-outline' },
  { key: 'significant', label: 'Significant', icon: 'warning-outline' },
];

export default function PTRoutineScreen() {
  const router = useRouter();
  const { data: routinesData } = usePtRoutines();
  const logAdherence = useLogPtAdherence();

  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDifficulty, setFeedbackDifficulty] = useState(0);
  const [feedbackPain, setFeedbackPain] = useState<'none' | 'mild' | 'significant' | ''>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (routinesData && Array.isArray(routinesData) && routinesData.length > 0) {
      const routine = routinesData[0] as Routine;
      if (routine.exercises && routine.exercises.length > 0) {
        setExercises(routine.exercises.map(e => ({
          ...e.exercise,
          completed: false,
        })));
      }
    }
  }, [routinesData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startExercise = (exercise: Exercise) => {
    if (!sessionStartTime) setSessionStartTime(new Date());
    setActiveExercise(exercise);
    setTimeRemaining(exercise.durationSeconds || 30);
    setCurrentSet(1);
    setTimerModalVisible(true);
    setIsTimerRunning(false);
    setShowFeedback(false);
    setFeedbackDifficulty(0);
    setFeedbackPain('');
    setShowInstructions(true);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTimerRunning(false);
    } else {
      setShowInstructions(false);
      setIsTimerRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const nextSet = () => {
    if (activeExercise && currentSet < (activeExercise.sets || 1)) {
      setCurrentSet(currentSet + 1);
      setTimeRemaining(activeExercise.durationSeconds || 30);
      setIsTimerRunning(false);
    }
  };

  const handleExerciseComplete = () => {
    setShowFeedback(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTimerRunning(false);
  };

  const submitFeedback = () => {
    if (activeExercise) {
      const feedback: ExerciseFeedback = {
        difficulty: feedbackDifficulty > 0 ? feedbackDifficulty : 3,
        painLevel: feedbackPain || 'none',
      };
      setExercises(exercises.map(e =>
        e.id === activeExercise.id ? { ...e, completed: true, feedback } : e
      ));
    }
    setTimerModalVisible(false);
    setActiveExercise(null);
    setIsTimerRunning(false);
    setShowFeedback(false);
  };

  const finishExercise = () => {
    if (activeExercise) {
      setExercises(exercises.map(e =>
        e.id === activeExercise.id ? { ...e, completed: true } : e
      ));
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerModalVisible(false);
    setActiveExercise(null);
    setIsTimerRunning(false);
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  const handleComplete = async () => {
    if (sessionStartTime) {
      const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
      const routineId = routinesData && Array.isArray(routinesData) && routinesData.length > 0
        ? (routinesData[0] as Routine).id
        : undefined;

      if (routineId) {
        await logAdherence.mutateAsync({
          routineId,
          completed: completedCount === exercises.length,
          durationMinutes,
          exercisesCompleted: exercises.filter(e => e.completed).map(e => e.id),
        });
      }
    }
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExerciseInfo = (exerciseId: string) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  const allSetsComplete = activeExercise
    ? currentSet >= (activeExercise.sets || 1) && timeRemaining === 0
    : false;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Session Progress</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {completedCount} of {exercises.length} exercises completed
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.map((exercise, index) => (
          <Card key={exercise.id} style={[styles.exerciseCard, exercise.completed && styles.exerciseCompleted]}>
            <TouchableOpacity
              style={styles.exerciseContent}
              onPress={() => startExercise(exercise)}
              disabled={exercise.completed}
              testID={`button-exercise-${index}`}
            >
              <View style={styles.exerciseLeft}>
                <View style={[styles.exerciseNumber, exercise.completed && styles.exerciseNumberCompleted]}>
                  {exercise.completed ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={[styles.exerciseName, exercise.completed && styles.exerciseNameCompleted]}>
                      {exercise.name}
                    </Text>
                    {exercise.targetArea ? (
                      <View style={styles.targetBadgeSmall}>
                        <Text style={styles.targetBadgeSmallText}>{exercise.targetArea}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets ? `${exercise.sets} sets` : ''}
                    {exercise.repetitions ? ` \u00b7 ${exercise.repetitions} reps` : ''}
                    {exercise.durationSeconds ? ` \u00b7 ${formatTime(exercise.durationSeconds)}` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseActions}>
                {exercise.description ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleExerciseInfo(exercise.id);
                    }}
                    style={styles.infoButton}
                    testID={`button-exercise-info-${exercise.id}`}
                  >
                    <Ionicons
                      name={expandedExerciseId === exercise.id ? 'information-circle' : 'information-circle-outline'}
                      size={24}
                      color="#8B5CF6"
                    />
                  </TouchableOpacity>
                ) : null}
                {!exercise.completed ? (
                  <Ionicons name="play-circle" size={32} color="#8B5CF6" />
                ) : null}
              </View>
            </TouchableOpacity>

            {expandedExerciseId === exercise.id ? (
              <View style={styles.expandedInfo}>
                {exercise.description ? (
                  <Text style={styles.expandedDescription} testID={`text-exercise-description-${exercise.id}`}>
                    {exercise.description}
                  </Text>
                ) : null}
                {exercise.instructions && exercise.instructions.length > 0 ? (
                  <View style={styles.expandedInstructions}>
                    {exercise.instructions.map((step, i) => (
                      <View key={i} style={styles.instructionStep}>
                        <Text style={styles.instructionNumber}>{i + 1}.</Text>
                        <Text style={styles.instructionText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {exercise.completed && exercise.feedback ? (
              <View style={styles.feedbackSummary}>
                <Text style={styles.feedbackSummaryText}>
                  Difficulty: {exercise.feedback.difficulty}/5 | Pain: {exercise.feedback.painLevel}
                </Text>
              </View>
            ) : null}
          </Card>
        ))}

        <Button
          title={completedCount === exercises.length ? 'Complete Session' : 'Save & Exit'}
          onPress={handleComplete}
          style={styles.completeButton}
          testID="button-complete-session"
        />

        <View style={styles.footer} />
      </ScrollView>

      <Modal
        visible={timerModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTimerModalVisible(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>

            {activeExercise?.targetArea ? (
              <View style={styles.targetBadge}>
                <Ionicons name="fitness-outline" size={14} color="#8B5CF6" />
                <Text style={styles.targetBadgeText}>{activeExercise.targetArea}</Text>
              </View>
            ) : null}

            <Text style={styles.modalExerciseName}>{activeExercise?.name}</Text>

            {activeExercise?.description ? (
              <Text style={styles.modalDescription}>{activeExercise.description}</Text>
            ) : null}

            {activeExercise?.sets && activeExercise.sets > 1 ? (
              <Text style={styles.modalSetLabel}>Set {currentSet} of {activeExercise.sets}</Text>
            ) : null}

            {showInstructions && activeExercise?.instructions && activeExercise.instructions.length > 0 && !showFeedback ? (
              <Card style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Instructions</Text>
                {activeExercise.instructions.map((step, i) => (
                  <View key={i} style={styles.modalInstructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.modalInstructionText}>{step}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {!showFeedback ? (
              <>
                <View style={styles.timerRing}>
                  <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
                </View>

                <View style={styles.timerControls}>
                  <TouchableOpacity
                    style={[styles.timerButton, isTimerRunning && styles.pauseButton]}
                    onPress={toggleTimer}
                    testID="button-timer-toggle"
                  >
                    <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  {activeExercise?.sets && currentSet < activeExercise.sets ? (
                    <Button
                      title="Next Set"
                      onPress={nextSet}
                      disabled={timeRemaining > 0}
                      style={styles.modalButton}
                      testID="button-next-set"
                    />
                  ) : (
                    <Button
                      title="Complete Exercise"
                      onPress={handleExerciseComplete}
                      style={styles.modalButton}
                      testID="button-finish-exercise"
                    />
                  )}
                </View>
              </>
            ) : (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>How hard was that?</Text>
                <View style={styles.difficultyRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[
                        styles.difficultyCircle,
                        feedbackDifficulty === n ? styles.difficultyCircleActive : null,
                      ]}
                      onPress={() => setFeedbackDifficulty(n)}
                      testID={`button-difficulty-${n}`}
                    >
                      <Text style={[
                        styles.difficultyNumber,
                        feedbackDifficulty === n ? styles.difficultyNumberActive : null,
                      ]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.difficultyLabels}>
                  <Text style={styles.difficultyLabelText}>Easy</Text>
                  <Text style={styles.difficultyLabelText}>Hard</Text>
                </View>

                <Text style={styles.feedbackTitle}>Any discomfort?</Text>
                <View style={styles.painRow}>
                  {PAIN_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.painOption,
                        feedbackPain === option.key ? styles.painOptionActive : null,
                      ]}
                      onPress={() => setFeedbackPain(option.key)}
                      testID={`button-pain-${option.key}`}
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={feedbackPain === option.key ? '#FFFFFF' : '#64748B'}
                      />
                      <Text style={[
                        styles.painOptionText,
                        feedbackPain === option.key ? styles.painOptionTextActive : null,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Save & Continue"
                  onPress={submitFeedback}
                  style={styles.feedbackSubmitButton}
                />
                <TouchableOpacity onPress={finishExercise} style={styles.skipFeedback}>
                  <Text style={styles.skipFeedbackText}>Skip feedback</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    padding: 24,
  },
  progressCard: {
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
  },
  exerciseCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberCompleted: {
    backgroundColor: '#10B981',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  exerciseNameCompleted: {
    color: '#059669',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoButton: {
    padding: 4,
  },
  targetBadgeSmall: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  targetBadgeSmallText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  expandedInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  expandedDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  expandedInstructions: {
    gap: 6,
  },
  instructionStep: {
    flexDirection: 'row',
    gap: 8,
  },
  instructionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    width: 18,
  },
  instructionText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  feedbackSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  feedbackSummaryText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  completeButton: {
    marginTop: 24,
    backgroundColor: '#8B5CF6',
  },
  footer: {
    height: 24,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalScrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 56,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    padding: 8,
    zIndex: 10,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  targetBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  modalExerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  modalSetLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  instructionsCard: {
    width: '100%',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FAFAFE',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalInstructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalInstructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    marginBottom: 32,
  },
  timerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  modalActions: {
    width: '100%',
    paddingHorizontal: 24,
  },
  modalButton: {
    backgroundColor: '#8B5CF6',
  },
  feedbackContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  difficultyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  difficultyCircleActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  difficultyNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  difficultyNumberActive: {
    color: '#FFFFFF',
  },
  difficultyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 276,
    marginBottom: 28,
  },
  difficultyLabelText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  painRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  painOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minWidth: 90,
    gap: 6,
  },
  painOptionActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  painOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  painOptionTextActive: {
    color: '#FFFFFF',
  },
  feedbackSubmitButton: {
    backgroundColor: '#8B5CF6',
    width: '100%',
  },
  skipFeedback: {
    marginTop: 12,
    padding: 8,
  },
  skipFeedbackText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

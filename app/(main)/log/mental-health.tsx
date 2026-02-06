import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Slider, ConfirmDialog } from '@/components/ui';
import { useLogMentalHealth } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

type LogType = 'meditation' | 'mood' | 'journal';
type MeditationState = 'select' | 'configure' | 'active' | 'complete';

interface MeditationTemplate {
  name: string;
  duration: number;
  description: string;
  longDescription: string;
  icon: string;
  steps: string[];
}

interface MoodOption {
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface JournalTemplate {
  name: string;
  prompts: string[];
  description: string;
  icon: string;
}

const MEDITATION_TEMPLATES: MeditationTemplate[] = [
  {
    name: 'Guided Breathing',
    duration: 5,
    description: 'Calm your nervous system with controlled breathing patterns',
    longDescription: 'This practice uses rhythmic breathing techniques to activate your parasympathetic nervous system, reducing stress hormones and promoting deep relaxation. Perfect for pre-game nerves or winding down after training.',
    icon: 'leaf',
    steps: [
      'Find a comfortable seated position and close your eyes',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath gently for 4 counts',
      'Exhale slowly through your mouth for 6 counts',
      'Repeat this cycle, letting each breath deepen your relaxation',
      'If your mind wanders, gently return focus to your breathing',
    ],
  },
  {
    name: 'Body Scan',
    duration: 10,
    description: 'Progressive relaxation from head to toe to release physical tension',
    longDescription: 'A systematic journey through your body, noticing areas of tension and consciously releasing them. Especially beneficial for athletes to identify tight muscles and promote recovery between training sessions.',
    icon: 'body',
    steps: [
      'Lie down comfortably or sit with your back supported',
      'Start at the top of your head - notice any tension in your scalp',
      'Move awareness to your face, jaw, and neck - soften these areas',
      'Scan through your shoulders, arms, and hands - release any grip',
      'Notice your chest and stomach - let your breathing be natural',
      'Continue through your hips, thighs, calves, and feet',
      'Finally, feel your whole body as one relaxed, connected unit',
    ],
  },
  {
    name: 'Mindfulness',
    duration: 15,
    description: 'Present-moment awareness to sharpen focus and reduce overthinking',
    longDescription: 'Train your attention to stay in the present moment without judgment. This practice builds the mental clarity and focus that translates directly to athletic performance - helping you stay in the zone during competition.',
    icon: 'eye',
    steps: [
      'Sit comfortably and take three deep settling breaths',
      'Bring your attention to sounds around you - just observe, do not label',
      'Shift focus to physical sensations - the weight of your body, temperature of air',
      'Now observe your thoughts as they arise - like clouds passing through the sky',
      'Do not try to stop thinking, just notice thoughts without engaging',
      'When you get caught in a thought, gently acknowledge it and return to observing',
      'End by expanding awareness to your whole body and surroundings',
    ],
  },
  {
    name: 'Sleep Meditation',
    duration: 20,
    description: 'Calming visualization to prepare for deep, restorative sleep',
    longDescription: 'Sleep is when your body repairs and grows. This meditation combines progressive muscle relaxation with gentle imagery to help you fall asleep faster and improve sleep quality - critical for athletic recovery and next-day performance.',
    icon: 'moon',
    steps: [
      'Lie in bed in your usual sleeping position',
      'Tense and release each muscle group starting with your toes',
      'Imagine a warm, golden light slowly spreading through your body',
      'Picture a peaceful place - a quiet beach, a calm forest, or starry sky',
      'With each exhale, feel yourself sinking deeper into your mattress',
      'Let go of any thoughts about tomorrow - this moment is just for rest',
      'Allow the visualization to fade as drowsiness naturally takes over',
    ],
  },
  {
    name: 'Morning Focus',
    duration: 10,
    description: 'Set intentions and build mental clarity for the day ahead',
    longDescription: 'Start your day with purpose and energy. This practice combines gentle alertness exercises with intention-setting to prime your mind for peak performance. Great before morning training or competition days.',
    icon: 'sunny',
    steps: [
      'Sit upright with a tall spine - feel alert yet relaxed',
      'Take 5 energizing breaths: quick inhale through nose, strong exhale through mouth',
      'Set one clear intention for today - what will you focus on?',
      'Visualize yourself accomplishing your most important task with ease',
      'Feel the energy and confidence building in your body',
      'Open your eyes slowly and carry this focused energy into your day',
    ],
  },
  {
    name: 'Stress Relief',
    duration: 8,
    description: 'Quick techniques to manage anxiety and overwhelm in the moment',
    longDescription: 'When pressure builds up - before a big game, during exams, or in tough training sessions - this practice gives you immediate tools to regulate your stress response and regain composure.',
    icon: 'heart',
    steps: [
      'Pause whatever you are doing and place both feet flat on the ground',
      'Press your feet into the floor - feel the solid ground beneath you',
      'Take 3 slow breaths: 4 counts in, 7 counts out',
      'Name 5 things you can see, 4 you can touch, 3 you can hear',
      'Remind yourself: this feeling is temporary and you have handled hard things before',
      'Take one final deep breath and release any remaining tension',
    ],
  },
  {
    name: 'Gratitude Practice',
    duration: 5,
    description: 'Shift your mindset by reflecting on what you appreciate',
    longDescription: 'Research shows gratitude practice rewires your brain for positivity and resilience. Athletes who practice gratitude report better team relationships, improved motivation, and greater satisfaction with their training progress.',
    icon: 'star',
    steps: [
      'Close your eyes and bring a gentle smile to your face',
      'Think of one person who has supported your growth - feel that appreciation',
      'Think of one moment today that brought you even a small amount of joy',
      'Think of one ability or strength your body has that you are grateful for',
      'Let the warmth of gratitude fill your chest and spread outward',
      'Commit to expressing your gratitude to one person today',
    ],
  },
  {
    name: 'Visualization',
    duration: 12,
    description: 'Mentally rehearse success for upcoming competitions and goals',
    longDescription: 'Elite athletes use visualization to improve performance by up to 13%. By vividly imagining yourself executing skills perfectly, you strengthen the same neural pathways as physical practice. Use this before games, meets, or important events.',
    icon: 'trophy',
    steps: [
      'Close your eyes and take several calming breaths to settle in',
      'Picture the venue or location of your upcoming event in vivid detail',
      'See yourself arriving confident and prepared - feel the energy',
      'Walk through your performance step by step - every movement crisp and controlled',
      'Imagine overcoming a challenge mid-performance with composure',
      'See yourself succeeding - the final play, the finish line, the personal best',
      'Feel the satisfaction and pride of giving your best effort',
      'Open your eyes carrying that confidence with you',
    ],
  },
];

const MOOD_OPTIONS: MoodOption[] = [
  { name: 'Happy', icon: 'sunny', color: '#FFD93D', description: 'Feeling joyful, content, or cheerful. Things are going well and you are enjoying the moment.' },
  { name: 'Calm', icon: 'leaf', color: '#6BCB77', description: 'Peaceful and relaxed state of mind. You feel balanced and at ease with yourself.' },
  { name: 'Energetic', icon: 'flash', color: '#FF6B6B', description: 'Full of energy and ready to take on challenges. You feel motivated and driven.' },
  { name: 'Focused', icon: 'eye', color: '#4D96FF', description: 'Sharp mental clarity and concentration. You feel locked in and productive.' },
  { name: 'Anxious', icon: 'alert-circle', color: '#FFA500', description: 'Feeling worried or uneasy about something. Your mind may be racing with concerns.' },
  { name: 'Stressed', icon: 'thunderstorm', color: '#9B59B6', description: 'Feeling overwhelmed or under pressure. Too many demands and not enough time or energy.' },
  { name: 'Sad', icon: 'rainy', color: '#74B9FF', description: 'Feeling down, disappointed, or melancholy. It is okay to acknowledge these feelings.' },
  { name: 'Tired', icon: 'moon', color: '#636E72', description: 'Physically or mentally drained. Your body or mind needs rest and recovery.' },
  { name: 'Frustrated', icon: 'flame', color: '#E74C3C', description: 'Feeling stuck or annoyed. Things are not going as planned and patience is wearing thin.' },
  { name: 'Grateful', icon: 'heart', color: '#E91E63', description: 'Feeling thankful and appreciative. You recognize the good things in your life.' },
];

const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    name: 'Gratitude Journal',
    prompts: ['What are 3 things you are grateful for today?', 'Who made a positive impact on you recently?', 'What small moment brought you joy?'],
    description: 'Shift your perspective by focusing on the positive aspects of your life. Regular gratitude journaling has been shown to improve mood, sleep quality, and overall well-being.',
    icon: 'heart',
  },
  {
    name: 'Daily Reflection',
    prompts: ['How did you feel overall today?', 'What went well today?', 'What could have gone better?', 'What did you learn?'],
    description: 'Process your day thoughtfully to build self-awareness. Reflecting on wins and growth areas helps you make continuous progress in all aspects of life.',
    icon: 'book',
  },
  {
    name: 'Goal Setting',
    prompts: ['What is your main goal for tomorrow?', 'What steps will you take to achieve it?', 'What obstacles might you face?'],
    description: 'Plan and prepare for success by writing clear intentions. Athletes who set specific, written goals achieve them more consistently.',
    icon: 'flag',
  },
  {
    name: 'Worry Dump',
    prompts: ['What is worrying you right now?', 'What is the worst that could happen?', 'What can you actually control?', 'What is one small step you can take?'],
    description: 'Release anxious thoughts onto the page. Writing worries down externalizes them and reduces their power over your mind, helping you think more clearly.',
    icon: 'cloud',
  },
  {
    name: 'Affirmations',
    prompts: ['What are you proud of about yourself?', 'What strengths did you use today?', 'Write 3 positive statements about yourself.'],
    description: 'Build self-confidence through positive self-talk. Affirmations reprogram negative thought patterns and strengthen your belief in your abilities.',
    icon: 'star',
  },
  {
    name: 'Performance Review',
    prompts: ['How was your training/practice today?', 'What skills are improving?', 'What mental challenges did you face?', 'How will you prepare for next time?'],
    description: 'Reflect on your athletic performance and growth. Tracking your training mindset helps identify patterns and accelerate improvement.',
    icon: 'trophy',
  },
];

function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function MeditationTimer({
  template,
  duration,
  onComplete,
  onCancel,
}: {
  template: MeditationTemplate;
  duration: number;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const totalSeconds = duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elapsed = totalSeconds - remaining;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const currentStepIndex = Math.min(
    Math.floor(progress * template.steps.length),
    template.steps.length - 1
  );

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            if (Platform.OS !== 'web') { Vibration.vibrate([0, 300, 200, 300]); }
            setIsRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, remaining]);

  const isComplete = remaining === 0;

  return (
    <View style={mTimerStyles.container}>
      <View style={mTimerStyles.header}>
        <TouchableOpacity onPress={onCancel} style={mTimerStyles.cancelBtn} testID="button-cancel-meditation">
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={mTimerStyles.headerTitle}>{template.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={mTimerStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={mTimerStyles.timerCircle}>
          <Text style={mTimerStyles.timerText}>{formatTimerDisplay(remaining)}</Text>
          <Text style={mTimerStyles.timerLabel}>
            {isComplete ? 'Session Complete' : isRunning ? 'In Progress' : 'Paused'}
          </Text>
        </View>

        <View style={mTimerStyles.progressBarContainer}>
          <View style={[mTimerStyles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={mTimerStyles.stepsContainer}>
          <Text style={mTimerStyles.stepsTitle}>Session Guide</Text>
          {template.steps.map((step, index) => {
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <View key={index} style={[mTimerStyles.stepRow, isCurrent ? mTimerStyles.stepRowCurrent : undefined]}>
                <View style={[mTimerStyles.stepDot, isPast ? mTimerStyles.stepDotDone : undefined, isCurrent ? mTimerStyles.stepDotCurrent : undefined]}>
                  {isPast ? <Ionicons name="checkmark" size={10} color="#fff" /> : null}
                </View>
                <Text style={[mTimerStyles.stepText, isCurrent ? mTimerStyles.stepTextCurrent : undefined, isPast ? mTimerStyles.stepTextDone : undefined]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={mTimerStyles.controls}>
        {isComplete ? (
          <TouchableOpacity style={mTimerStyles.completeBtn} onPress={onComplete} testID="button-finish-meditation">
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={mTimerStyles.completeBtnText}>Save & Finish</Text>
          </TouchableOpacity>
        ) : (
          <View style={mTimerStyles.controlRow}>
            <TouchableOpacity
              style={[mTimerStyles.controlBtn, isRunning ? mTimerStyles.pauseBtn : mTimerStyles.playBtn]}
              onPress={() => setIsRunning(!isRunning)}
              testID="button-toggle-meditation"
            >
              <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={mTimerStyles.skipBtn}
              onPress={onComplete}
              testID="button-skip-meditation"
            >
              <Text style={mTimerStyles.skipBtnText}>End Early & Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function MentalHealthLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logMentalHealth = useLogMentalHealth();
  const [logType, setLogType] = useState<LogType>('meditation');
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationTemplate | null>(null);
  const [meditationState, setMeditationState] = useState<MeditationState>('select');
  const [meditationDuration, setMeditationDuration] = useState(10);
  const [meditationNotes, setMeditationNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<JournalTemplate | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const hasSubstantiveData =
    selectedMood !== null ||
    journalEntry.trim().length > 0 ||
    meditationState === 'active' ||
    meditationState === 'complete';

  const handleSave = () => {
    const data: Record<string, unknown> = {
      date: new Date().toISOString().split('T')[0],
      type: logType,
    };

    if (logType === 'meditation') {
      data.subType = selectedMeditation?.name || 'General';
      data.durationMinutes = meditationDuration;
      data.notes = meditationNotes;
    } else if (logType === 'mood') {
      data.subType = selectedMood?.name || 'General';
      data.moodLevel = moodIntensity;
      data.notes = moodNotes;
    } else if (logType === 'journal') {
      data.subType = selectedJournal?.name || 'Free Write';
      data.notes = journalEntry;
    }

    logMentalHealth.mutate(data, {
      onSuccess: () => {
        const labels = { meditation: 'Meditation', mood: 'Mood', journal: 'Journal' };
        showToast('success', `${labels[logType]} Saved`, 'Your mental health entry has been recorded');
        setTimeout(() => router.back(), 600);
      },
      onError: (error) => {
        showToast('error', 'Save Failed', error.message || 'Could not save entry');
      },
    });
  };

  const handleMeditationSelect = (template: MeditationTemplate) => {
    setSelectedMeditation(template);
    setMeditationDuration(template.duration);
    setMeditationState('configure');
  };

  const handleStartMeditation = () => {
    setMeditationState('active');
  };

  const handleMeditationComplete = () => {
    setMeditationState('complete');
    setMeditationNotes(`Completed ${selectedMeditation?.name} for ${meditationDuration} minutes`);
    handleSave();
  };

  const handleMeditationCancel = () => {
    setMeditationState('configure');
  };

  const applyJournalTemplate = (template: JournalTemplate) => {
    setSelectedJournal(template);
    setJournalEntry(template.prompts.map(p => `${p}\n\n`).join(''));
  };

  const handleMeditationBack = () => {
    if (meditationState === 'configure') {
      setMeditationState('select');
      setSelectedMeditation(null);
    } else {
      setMeditationState('select');
    }
  };

  if (logType === 'meditation' && meditationState === 'active' && selectedMeditation) {
    return (
      <SafeAreaView style={styles.safe}>
        <MeditationTimer
          template={selectedMeditation}
          duration={meditationDuration}
          onComplete={handleMeditationComplete}
          onCancel={handleMeditationCancel}
        />
      </SafeAreaView>
    );
  }

  const renderMeditationSection = () => {
    if (meditationState === 'configure' && selectedMeditation) {
      return (
        <>
          <TouchableOpacity style={styles.backLink} onPress={handleMeditationBack} testID="button-meditation-back">
            <Ionicons name="arrow-back" size={18} color="#10B981" />
            <Text style={styles.backLinkText}>All meditations</Text>
          </TouchableOpacity>

          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <View style={styles.configIconWrap}>
                <Ionicons name={selectedMeditation.icon as never} size={28} color="#10B981" />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>{selectedMeditation.name}</Text>
                <Text style={styles.configDuration}>{meditationDuration} minutes</Text>
              </View>
            </View>

            <Text style={styles.configLongDesc}>{selectedMeditation.longDescription}</Text>

            <View style={styles.configSteps}>
              <Text style={styles.configStepsTitle}>What you will do:</Text>
              {selectedMeditation.steps.map((step, index) => (
                <View key={index} style={styles.configStepRow}>
                  <Text style={styles.configStepNum}>{index + 1}</Text>
                  <Text style={styles.configStepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.durationSection}>
            <Text style={styles.durationLabel}>Session Duration: {meditationDuration} min</Text>
            <Slider
              value={meditationDuration}
              onValueChange={setMeditationDuration}
              min={1}
              max={60}
              step={1}
              leftLabel="1m"
              rightLabel="60m"
              showValue={false}
              testID="slider-meditation-duration"
            />
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStartMeditation} testID="button-start-meditation">
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.startBtnText}>Start Session</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add any notes before or after your session..."
            value={meditationNotes}
            onChangeText={setMeditationNotes}
            multiline
            numberOfLines={3}
            testID="input-meditation-notes"
          />
        </>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Choose Your Practice</Text>
        <Text style={styles.sectionSubtitle}>Select a meditation to see details and begin a guided session</Text>

        {MEDITATION_TEMPLATES.map((template, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.meditationCard, selectedMeditation?.name === template.name ? styles.meditationCardSelected : undefined]}
            onPress={() => handleMeditationSelect(template)}
            testID={`button-meditation-${index}`}
          >
            <View style={styles.meditationHeader}>
              <View style={[styles.meditationIcon, selectedMeditation?.name === template.name ? styles.meditationIconSelected : undefined]}>
                <Ionicons name={template.icon as never} size={22} color={selectedMeditation?.name === template.name ? '#fff' : '#10B981'} />
              </View>
              <View style={styles.meditationInfo}>
                <Text style={styles.meditationName}>{template.name}</Text>
                <Text style={styles.meditationDuration}>{template.duration} min</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </View>
            <Text style={styles.meditationDesc}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderMoodSection = () => (
    <>
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
      <Text style={styles.sectionSubtitle}>Select the mood that best describes your current state</Text>

      {MOOD_OPTIONS.map((mood, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.moodCard, selectedMood?.name === mood.name ? { borderColor: mood.color, backgroundColor: mood.color + '10' } : undefined]}
          onPress={() => setSelectedMood(mood)}
          testID={`button-mood-${index}`}
        >
          <View style={[styles.moodIconWrap, { backgroundColor: mood.color + '20' }]}>
            <Ionicons name={mood.icon as never} size={24} color={mood.color} />
          </View>
          <View style={styles.moodInfo}>
            <Text style={[styles.moodName, selectedMood?.name === mood.name ? { color: mood.color } : undefined]}>{mood.name}</Text>
            <Text style={styles.moodDesc} numberOfLines={2}>{mood.description}</Text>
          </View>
          {selectedMood?.name === mood.name ? (
            <View style={[styles.moodCheck, { backgroundColor: mood.color }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : null}
        </TouchableOpacity>
      ))}

      {selectedMood ? (
        <>
          <View style={styles.intensitySection}>
            <View style={styles.intensityHeader}>
              <Text style={styles.intensityLabel}>Intensity Level</Text>
              <Text style={[styles.intensityValue, { color: selectedMood.color }]}>{moodIntensity}/10</Text>
            </View>
            <Text style={styles.intensityHint}>
              {moodIntensity <= 3 ? 'Mild - barely noticeable' : moodIntensity <= 6 ? 'Moderate - clearly present' : 'Strong - hard to ignore'}
            </Text>
            <Slider
              value={moodIntensity}
              onValueChange={setMoodIntensity}
              min={1}
              max={10}
              step={1}
              leftLabel="Mild"
              rightLabel="Intense"
              showValue={false}
              testID="slider-mood-intensity"
            />
          </View>

          <Text style={styles.inputLabel}>What is contributing to this feeling?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe what is on your mind..."
            value={moodNotes}
            onChangeText={setMoodNotes}
            multiline
            numberOfLines={4}
            testID="input-mood-notes"
          />
        </>
      ) : null}
    </>
  );

  const renderJournalSection = () => (
    <>
      <Text style={styles.sectionTitle}>Choose Journal Type</Text>
      <Text style={styles.sectionSubtitle}>Pick a template for guided prompts, or start free writing</Text>

      <View style={styles.journalGrid}>
        {JOURNAL_TEMPLATES.map((template, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.journalCard, selectedJournal?.name === template.name ? styles.journalCardSelected : undefined]}
            onPress={() => applyJournalTemplate(template)}
            testID={`button-journal-${index}`}
          >
            <View style={[styles.journalIcon, selectedJournal?.name === template.name ? styles.journalIconSelected : undefined]}>
              <Ionicons name={template.icon as never} size={20} color={selectedJournal?.name === template.name ? '#fff' : '#10B981'} />
            </View>
            <Text style={[styles.journalName, selectedJournal?.name === template.name ? styles.journalNameSelected : undefined]}>{template.name}</Text>
            <Text style={styles.journalDesc} numberOfLines={3}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>{selectedJournal ? selectedJournal.name : 'Your Entry'}</Text>
      <TextInput
        style={[styles.textInput, styles.journalInput]}
        placeholder={selectedJournal ? 'Start writing your reflections...' : 'Select a template above or start free writing...'}
        value={journalEntry}
        onChangeText={setJournalEntry}
        multiline
        numberOfLines={12}
        textAlignVertical="top"
        testID="input-journal-entry"
      />
    </>
  );

  const canSave = () => {
    switch (logType) {
      case 'meditation': return selectedMeditation !== null;
      case 'mood': return selectedMood !== null;
      case 'journal': return journalEntry.trim().length > 0;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (hasSubstantiveData) {
            setShowDiscardDialog(true);
          } else {
            router.back();
          }
        }} style={styles.backButton} testID="button-back-mental-health">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mental Health</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-mental-health">
          <Ionicons name="home-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, logType === 'meditation' ? styles.tabActive : undefined]}
          onPress={() => { setLogType('meditation'); setMeditationState('select'); setSelectedMeditation(null); }}
          testID="tab-meditation"
        >
          <Ionicons name="leaf" size={18} color={logType === 'meditation' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'meditation' ? styles.tabTextActive : undefined]}>Meditation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, logType === 'mood' ? styles.tabActive : undefined]}
          onPress={() => setLogType('mood')}
          testID="tab-mood"
        >
          <Ionicons name="happy" size={18} color={logType === 'mood' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'mood' ? styles.tabTextActive : undefined]}>Feelings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, logType === 'journal' ? styles.tabActive : undefined]}
          onPress={() => setLogType('journal')}
          testID="tab-journal"
        >
          <Ionicons name="book" size={18} color={logType === 'journal' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'journal' ? styles.tabTextActive : undefined]}>Journal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {logType === 'meditation' ? renderMeditationSection() : null}
        {logType === 'mood' ? renderMoodSection() : null}
        {logType === 'journal' ? renderJournalSection() : null}

        <View style={{ height: 30 }} />
      </ScrollView>

      {meditationState !== 'active' ? (
        <View style={styles.footer}>
          <Button
            title={logType === 'meditation' && meditationState === 'configure' ? 'Log Without Timer' : 'Save Entry'}
            onPress={handleSave}
            loading={logMentalHealth.isPending}
            disabled={!canSave() || logMentalHealth.isPending}
            testID="button-save-mental-health"
          />
        </View>
      ) : null}

      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard Entry?"
        message="Your mental health log hasn't been saved yet."
        onConfirm={() => {
          setShowDiscardDialog(false);
          router.back();
        }}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </SafeAreaView>
  );
}

const mTimerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  cancelBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#E2E8F0' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  timerCircle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 4, borderColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
    marginVertical: 24,
  },
  timerText: { fontSize: 44, fontWeight: '700', color: '#10B981', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  progressBarContainer: {
    width: '100%', height: 4, backgroundColor: '#1E293B',
    borderRadius: 2, marginBottom: 24, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 2 },
  stepsContainer: { width: '100%' },
  stepsTitle: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 12 },
  stepRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  stepRowCurrent: { backgroundColor: '#1E293B' },
  stepDot: {
    width: 20, height: 20, borderRadius: 10, marginTop: 2,
    borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center',
  },
  stepDotDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepDotCurrent: { borderColor: '#10B981', backgroundColor: '#10B981' + '30' },
  stepText: { flex: 1, fontSize: 14, color: '#64748B', lineHeight: 20 },
  stepTextCurrent: { color: '#E2E8F0', fontWeight: '500' },
  stepTextDone: { color: '#10B981', textDecorationLine: 'line-through' },
  controls: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1E293B' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  controlBtn: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  pauseBtn: { backgroundColor: '#F59E0B' },
  playBtn: { backgroundColor: '#10B981' },
  skipBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  skipBtnText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 14,
  },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E8F5F0',
  },
  backButton: { padding: 8 },
  homeButton: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1F2937' },
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8F5F0',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F1F5F9',
  },
  tabActive: { backgroundColor: '#E8F5F0' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  tabTextActive: { color: '#10B981' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16 },

  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, paddingVertical: 4 },
  backLinkText: { fontSize: 14, color: '#10B981', fontWeight: '500' },

  meditationCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E8F5F0',
  },
  meditationCardSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  meditationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  meditationIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#E8F5F0',
    justifyContent: 'center', alignItems: 'center',
  },
  meditationIconSelected: { backgroundColor: '#10B981' },
  meditationInfo: { flex: 1 },
  meditationName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  meditationDuration: { fontSize: 12, color: '#64748B', marginTop: 1 },
  meditationDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, paddingLeft: 54 },

  configCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#E8F5F0', marginBottom: 20,
  },
  configHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  configIconWrap: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#E8F5F0',
    justifyContent: 'center', alignItems: 'center',
  },
  configInfo: { flex: 1 },
  configName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  configDuration: { fontSize: 13, color: '#10B981', fontWeight: '500', marginTop: 2 },
  configLongDesc: { fontSize: 14, color: '#475569', lineHeight: 21, marginBottom: 16 },
  configSteps: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
  },
  configStepsTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  configStepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  configStepNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#10B981',
    color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 22,
  },
  configStepText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 18 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 14, marginBottom: 20,
  },
  startBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  durationSection: { marginBottom: 20 },
  durationLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  textInput: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 14, color: '#1F2937',
    borderWidth: 1, borderColor: '#E2E8F0', minHeight: 80, textAlignVertical: 'top',
  },

  moodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#E8F5F0',
  },
  moodIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  moodInfo: { flex: 1 },
  moodName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  moodDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  moodCheck: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  intensitySection: { marginVertical: 16 },
  intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  intensityLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  intensityValue: { fontSize: 18, fontWeight: '700' },
  intensityHint: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },

  journalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  journalCard: {
    width: '47%', padding: 14, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8F5F0',
  },
  journalCardSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  journalIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F5F0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  journalIconSelected: { backgroundColor: '#10B981' },
  journalName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  journalNameSelected: { color: '#10B981' },
  journalDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  journalInput: { minHeight: 250 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E8F5F0' },
});

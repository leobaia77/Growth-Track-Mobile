import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Slider } from '@/components/ui';

type LogType = 'meditation' | 'mood' | 'journal';

interface MeditationTemplate {
  name: string;
  duration: number;
  description: string;
  icon: string;
}

interface MoodOption {
  name: string;
  emoji: string;
  color: string;
}

interface JournalTemplate {
  name: string;
  prompts: string[];
  description: string;
}

const MEDITATION_TEMPLATES: MeditationTemplate[] = [
  { name: 'Guided Breathing', duration: 5, description: 'Deep breathing exercises to calm your mind and reduce stress. Focus on slow, rhythmic breaths.', icon: 'leaf' },
  { name: 'Body Scan', duration: 10, description: 'Progressive relaxation from head to toe. Notice tension and consciously release it.', icon: 'body' },
  { name: 'Mindfulness', duration: 15, description: 'Present-moment awareness meditation. Observe thoughts without judgment.', icon: 'eye' },
  { name: 'Sleep Meditation', duration: 20, description: 'Calming visualization to prepare for restful sleep. Ideal before bedtime.', icon: 'moon' },
  { name: 'Morning Focus', duration: 10, description: 'Set intentions and mental clarity for the day ahead. Energizing yet calm.', icon: 'sunny' },
  { name: 'Stress Relief', duration: 8, description: 'Quick relaxation techniques to manage anxiety and overwhelm.', icon: 'heart' },
  { name: 'Gratitude Practice', duration: 5, description: 'Reflect on things you are thankful for. Builds positive mindset.', icon: 'star' },
  { name: 'Visualization', duration: 12, description: 'Picture your goals and success. Great for athletes before competition.', icon: 'trophy' },
];

const MOOD_OPTIONS: MoodOption[] = [
  { name: 'Happy', emoji: 'sunny', color: '#FFD93D' },
  { name: 'Calm', emoji: 'leaf', color: '#6BCB77' },
  { name: 'Energetic', emoji: 'flash', color: '#FF6B6B' },
  { name: 'Focused', emoji: 'eye', color: '#4D96FF' },
  { name: 'Anxious', emoji: 'alert-circle', color: '#FFA500' },
  { name: 'Stressed', emoji: 'thunderstorm', color: '#9B59B6' },
  { name: 'Sad', emoji: 'rainy', color: '#74B9FF' },
  { name: 'Tired', emoji: 'moon', color: '#636E72' },
  { name: 'Frustrated', emoji: 'flame', color: '#E74C3C' },
  { name: 'Grateful', emoji: 'heart', color: '#E91E63' },
];

const JOURNAL_TEMPLATES: JournalTemplate[] = [
  { 
    name: 'Gratitude Journal', 
    prompts: ['What are 3 things you are grateful for today?', 'Who made a positive impact on you recently?', 'What small moment brought you joy?'],
    description: 'Focus on the positive aspects of your life'
  },
  { 
    name: 'Daily Reflection', 
    prompts: ['How did you feel overall today?', 'What went well today?', 'What could have gone better?', 'What did you learn?'],
    description: 'Review and process your day'
  },
  { 
    name: 'Goal Setting', 
    prompts: ['What is your main goal for tomorrow?', 'What steps will you take to achieve it?', 'What obstacles might you face?'],
    description: 'Plan and prepare for success'
  },
  { 
    name: 'Worry Dump', 
    prompts: ['What is worrying you right now?', 'What is the worst that could happen?', 'What can you actually control?', 'What is one small step you can take?'],
    description: 'Release anxious thoughts onto paper'
  },
  { 
    name: 'Positive Affirmations', 
    prompts: ['What are you proud of about yourself?', 'What strengths did you use today?', 'Write 3 positive statements about yourself.'],
    description: 'Build self-confidence and positivity'
  },
  { 
    name: 'Performance Review', 
    prompts: ['How was your training/practice today?', 'What skills are improving?', 'What mental challenges did you face?', 'How will you prepare for next time?'],
    description: 'Reflect on athletic performance and growth'
  },
];

export default function MentalHealthLogScreen() {
  const router = useRouter();
  const [logType, setLogType] = useState<LogType>('meditation');
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationTemplate | null>(null);
  const [meditationDuration, setMeditationDuration] = useState(10);
  const [meditationNotes, setMeditationNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<JournalTemplate | null>(null);
  const [journalEntry, setJournalEntry] = useState('');

  const handleSave = () => {
    router.back();
  };

  const applyMeditationTemplate = (template: MeditationTemplate) => {
    setSelectedMeditation(template);
    setMeditationDuration(template.duration);
    setMeditationNotes(template.description);
  };

  const applyJournalTemplate = (template: JournalTemplate) => {
    setSelectedJournal(template);
    setJournalEntry(template.prompts.map(p => `${p}\n\n`).join(''));
  };

  const renderMeditationSection = () => (
    <>
      <Text style={styles.sectionTitle}>Select Meditation Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
        {MEDITATION_TEMPLATES.map((template, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.templateCard, selectedMeditation?.name === template.name && styles.templateCardSelected]}
            onPress={() => applyMeditationTemplate(template)}
            testID={`button-meditation-${index}`}
          >
            <View style={[styles.templateIcon, selectedMeditation?.name === template.name && styles.templateIconSelected]}>
              <Ionicons name={template.icon as never} size={24} color={selectedMeditation?.name === template.name ? '#FFFFFF' : '#10B981'} />
            </View>
            <Text style={[styles.templateName, selectedMeditation?.name === template.name && styles.templateNameSelected]}>{template.name}</Text>
            <Text style={styles.templateDuration}>{template.duration} min</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedMeditation ? (
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>{selectedMeditation.name}</Text>
          <Text style={styles.detailDescription}>{selectedMeditation.description}</Text>
        </Card>
      ) : null}

      <View style={styles.durationSection}>
        <Text style={styles.durationLabel}>Duration: {meditationDuration} minutes</Text>
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

      <Text style={styles.inputLabel}>Notes (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="How did you feel during the meditation?"
        value={meditationNotes}
        onChangeText={setMeditationNotes}
        multiline
        numberOfLines={4}
        testID="input-meditation-notes"
      />
    </>
  );

  const renderMoodSection = () => (
    <>
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.moodCard, selectedMood?.name === mood.name && { backgroundColor: mood.color + '30', borderColor: mood.color }]}
            onPress={() => setSelectedMood(mood)}
            testID={`button-mood-${index}`}
          >
            <Ionicons name={mood.emoji as never} size={28} color={mood.color} />
            <Text style={[styles.moodName, selectedMood?.name === mood.name && { color: mood.color }]}>{mood.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMood ? (
        <>
          <View style={styles.intensitySection}>
            <View style={styles.intensityHeader}>
              <Text style={styles.intensityLabel}>Intensity</Text>
              <Text style={[styles.intensityValue, { color: selectedMood.color }]}>{moodIntensity}/10</Text>
            </View>
            <Slider
              value={moodIntensity}
              onValueChange={setMoodIntensity}
              min={1}
              max={10}
              step={1}
              leftLabel="Mild"
              rightLabel="Strong"
              showValue={false}
              testID="slider-mood-intensity"
            />
          </View>

          <Text style={styles.inputLabel}>What is contributing to this feeling?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe what's on your mind..."
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
        {JOURNAL_TEMPLATES.map((template, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.journalCard, selectedJournal?.name === template.name && styles.journalCardSelected]}
            onPress={() => applyJournalTemplate(template)}
            testID={`button-journal-${index}`}
          >
            <Text style={[styles.journalName, selectedJournal?.name === template.name && styles.journalNameSelected]}>{template.name}</Text>
            <Text style={styles.journalDescription}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.inputLabel}>{selectedJournal ? selectedJournal.name : 'Your Entry'}</Text>
      <TextInput
        style={[styles.textInput, styles.journalInput]}
        placeholder={selectedJournal ? 'Start writing...' : 'Select a journal type above or start free writing...'}
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
      case 'meditation': return selectedMeditation !== null || meditationDuration > 0;
      case 'mood': return selectedMood !== null;
      case 'journal': return journalEntry.trim().length > 0;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-mental-health">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Mental Health</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-mental-health">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, logType === 'meditation' && styles.tabActive]}
          onPress={() => setLogType('meditation')}
          testID="tab-meditation"
        >
          <Ionicons name="leaf" size={20} color={logType === 'meditation' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'meditation' && styles.tabTextActive]}>Meditation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, logType === 'mood' && styles.tabActive]}
          onPress={() => setLogType('mood')}
          testID="tab-mood"
        >
          <Ionicons name="happy" size={20} color={logType === 'mood' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'mood' && styles.tabTextActive]}>Feelings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, logType === 'journal' && styles.tabActive]}
          onPress={() => setLogType('journal')}
          testID="tab-journal"
        >
          <Ionicons name="book" size={20} color={logType === 'journal' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabText, logType === 'journal' && styles.tabTextActive]}>Journal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {logType === 'meditation' && renderMeditationSection()}
        {logType === 'mood' && renderMoodSection()}
        {logType === 'journal' && renderJournalSection()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Entry"
          onPress={handleSave}
          disabled={!canSave()}
          testID="button-save-mental-health"
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: '#E8F5F0',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  templatesScroll: {
    marginBottom: 20,
  },
  templateCard: {
    width: 120,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5F0',
  },
  templateCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#E8F5F0',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateIconSelected: {
    backgroundColor: '#10B981',
  },
  templateName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateNameSelected: {
    color: '#10B981',
  },
  templateDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  detailCard: {
    marginBottom: 20,
    backgroundColor: '#E8F5F0',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  durationSection: {
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  moodCard: {
    width: '31%',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5F0',
  },
  moodName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 6,
  },
  intensitySection: {
    marginBottom: 20,
  },
  intensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  intensityValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  journalCard: {
    width: 160,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E8F5F0',
  },
  journalCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#E8F5F0',
  },
  journalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  journalNameSelected: {
    color: '#10B981',
  },
  journalDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  journalInput: {
    minHeight: 250,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider, ConfirmDialog } from '@/components/ui';
import { useCreateCheckin } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const LEVEL_ICONS: { name: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { name: 'sad-outline', color: '#EF4444' },
  { name: 'sad', color: '#F59E0B' },
  { name: 'remove-circle-outline', color: '#64748B' },
  { name: 'happy-outline', color: '#10B981' },
  { name: 'happy', color: '#10B981' },
];

export default function CheckinScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const createCheckin = useCreateCheckin();
  const [energy, setEnergy] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(2);
  const [painFlag, setPainFlag] = useState(false);
  const [painNotes, setPainNotes] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSliderChange = (setter: (v: number) => void) => (value: number) => {
    setter(value);
    setHasInteracted(true);
  };

  const handleSave = () => {
    createCheckin.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        energyLevel: energy,
        sorenessLevel: soreness,
        moodLevel: mood,
        stressLevel: stress,
        hasPainFlag: painFlag,
        painNotes: painFlag ? painNotes : null,
      },
      {
        onSuccess: () => {
          showToast('success', 'Check-in Saved', 'Your daily check-in has been recorded');
          setTimeout(() => router.back(), 600);
        },
        onError: (error) => {
          showToast('error', 'Save Failed', error.message || 'Could not save check-in');
        },
      }
    );
  };

  const getLevelIcon = (value: number) => {
    const icon = LEVEL_ICONS[value - 1];
    return <Ionicons name={icon.name} size={24} color={icon.color} />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (hasInteracted) {
            setShowDiscardDialog(true);
          } else {
            router.back();
          }
        }} style={styles.backButton} testID="button-back-checkin">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Check-in</Text>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')} style={styles.homeButton} testID="button-home-checkin">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.introCard}>
          <Ionicons name="heart" size={32} color="#EF4444" />
          <Text style={styles.introTitle}>How are you feeling today?</Text>
          <Text style={styles.introText}>
            Take a moment to check in with yourself
          </Text>
        </Card>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Energy Level</Text>
            <View style={styles.sliderIcon} testID="icon-energy-level">{getLevelIcon(energy)}</View>
          </View>
          <Slider
            value={energy}
            onValueChange={handleSliderChange(setEnergy)}
            min={1}
            max={5}
            step={1}
            leftLabel="Exhausted"
            rightLabel="Energized"
            showValue={false}
            testID="slider-energy"
          />
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Soreness</Text>
            <Text style={styles.sliderValue} testID="text-soreness-value">{soreness}/5</Text>
          </View>
          <Slider
            value={soreness}
            onValueChange={handleSliderChange(setSoreness)}
            min={1}
            max={5}
            step={1}
            leftLabel="None"
            rightLabel="Very sore"
            showValue={false}
            testID="slider-soreness"
          />
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Mood</Text>
            <View style={styles.sliderIcon} testID="icon-mood-level">{getLevelIcon(mood)}</View>
          </View>
          <Slider
            value={mood}
            onValueChange={handleSliderChange(setMood)}
            min={1}
            max={5}
            step={1}
            leftLabel="Low"
            rightLabel="Great"
            showValue={false}
            testID="slider-mood"
          />
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Stress Level</Text>
            <Text style={styles.sliderValue} testID="text-stress-value">{stress}/5</Text>
          </View>
          <Slider
            value={stress}
            onValueChange={handleSliderChange(setStress)}
            min={1}
            max={5}
            step={1}
            leftLabel="Relaxed"
            rightLabel="Very stressed"
            showValue={false}
            testID="slider-stress"
          />
        </View>

        <Card style={[styles.painCard, painFlag ? styles.painCardActive : undefined]}>
          <View style={styles.painHeader}>
            <View style={styles.painLabel}>
              <Ionicons 
                name="alert-circle" 
                size={24} 
                color={painFlag ? '#EF4444' : '#64748B'} 
              />
              <View>
                <Text style={styles.painTitle}>Pain Flag</Text>
                <Text style={styles.painSubtitle}>
                  Are you experiencing any pain?
                </Text>
              </View>
            </View>
            <Switch
              value={painFlag}
              onValueChange={setPainFlag}
              trackColor={{ false: '#E2E8F0', true: '#FECACA' }}
              thumbColor={painFlag ? '#EF4444' : '#94A3B8'}
              testID="switch-pain-flag"
            />
          </View>

          {painFlag ? (
            <View style={styles.painNotes}>
              <Input
                placeholder="Describe where and how it feels..."
                value={painNotes}
                onChangeText={setPainNotes}
                multiline
                testID="input-pain-notes"
              />
            </View>
          ) : null}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={createCheckin.isPending ? 'Saving...' : 'Submit Check-in'}
          onPress={handleSave}
          disabled={createCheckin.isPending}
          testID="button-submit-checkin"
        />
      </View>

      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard Check-in?"
        message="Your daily check-in hasn't been saved yet."
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
  introCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FEF2F2',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  introText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  sliderSection: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  sliderIcon: {
    width: 32,
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  painCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  painCardActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  painHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  painLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  painTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  painSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  painNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

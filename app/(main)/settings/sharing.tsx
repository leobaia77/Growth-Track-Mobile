import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

const SHARING_STORAGE_KEY = 'sharing_preferences';

interface SharingOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_SHARING_OPTIONS: SharingOption[] = [
  { id: 'sleep_trends', title: 'Sleep Trends', description: 'Weekly sleep averages', enabled: true },
  { id: 'sleep_detailed', title: 'Detailed Sleep Logs', description: 'Daily sleep times', enabled: false },
  { id: 'training_trends', title: 'Training Trends', description: 'Weekly training hours', enabled: true },
  { id: 'training_detailed', title: 'Detailed Workouts', description: 'Individual sessions', enabled: true },
  { id: 'nutrition_trends', title: 'Nutrition Trends', description: 'Daily meal logging status', enabled: true },
  { id: 'nutrition_detailed', title: 'Detailed Nutrition', description: 'Individual meals', enabled: false },
  { id: 'checkins', title: 'Daily Check-ins', description: 'Energy, mood, soreness', enabled: true },
  { id: 'safety_alerts', title: 'Safety Alerts', description: 'Pain flags, overtraining', enabled: true },
];

export default function SharingScreen() {
  const router = useRouter();
  const toast = useToast();
  const [options, setOptions] = useState<SharingOption[]>(DEFAULT_SHARING_OPTIONS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(SHARING_STORAGE_KEY);
      if (saved) {
        const savedMap: Record<string, boolean> = JSON.parse(saved);
        setOptions(prev => prev.map(opt => ({
          ...opt,
          enabled: savedMap[opt.id] !== undefined ? savedMap[opt.id] : opt.enabled,
        })));
      }
    } catch {}
  };

  const toggleOption = (id: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefsMap: Record<string, boolean> = {};
      options.forEach(opt => { prefsMap[opt.id] = opt.enabled; });
      await AsyncStorage.setItem(SHARING_STORAGE_KEY, JSON.stringify(prefsMap));
      toast.show('Preferences saved', 'success');
      router.back();
    } catch {
      toast.show('Could not save preferences. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Sharing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>You're in control</Text>
            <Text style={styles.infoDescription}>
              Control your data privacy settings. Choose what health data is included in exports and reports.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Data Export Settings</Text>
        <Card style={styles.optionsCard}>
          {options.map((option, index) => (
            <View 
              key={option.id}
              style={[
                styles.optionItem,
                index < options.length - 1 ? styles.optionItemBorder : undefined,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                value={option.enabled}
                onValueChange={() => toggleOption(option.id)}
                trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                thumbColor={option.enabled ? '#10B981' : '#94A3B8'}
                disabled={option.id === 'safety_alerts'}
                testID={`switch-${option.id}`}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.noteText}>
            Safety alerts are always included in exports to provide complete health context.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isSaving ? "Saving..." : "Save Preferences"}
          onPress={handleSave}
          disabled={isSaving}
          loading={isSaving}
          testID="button-save-sharing"
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
  content: {
    flex: 1,
    padding: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#E8F5F0',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  optionsCard: {
    padding: 0,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface GuideSection {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  steps: string[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'rocket-outline',
    description: 'Welcome to GrowthTrack! Here\'s how to begin your health journey.',
    steps: [
      'Complete your profile setup during onboarding',
      'Set your health goals (growth, muscle, bone health, etc.)',
      'Select your sports and activities',
      'Connect with a parent for additional support (optional)',
    ],
  },
  {
    id: 'daily-tracking',
    title: 'Daily Health Tracking',
    icon: 'checkbox-outline',
    description: 'Log your daily activities to track your progress.',
    steps: [
      'Use the Track tab to log check-ins, sleep, workouts, and meals',
      'Daily Check-in: Rate your energy, mood, soreness, and stress levels',
      'Sleep Log: Record your bedtime, wake time, and sleep quality',
      'Workout Log: Track your exercises, duration, and intensity',
      'Meal Log: Log your nutrition and hydration',
    ],
  },
  {
    id: 'scoliosis-care',
    title: 'Scoliosis Support',
    icon: 'body-outline',
    description: 'Special features for teens managing scoliosis.',
    steps: [
      'Track your daily brace wear time',
      'Complete assigned PT exercises',
      'Log any symptoms or discomfort',
      'View your weekly progress and compliance',
    ],
  },
  {
    id: 'insights',
    title: 'Understanding Your Insights',
    icon: 'analytics-outline',
    description: 'View trends and patterns in your health data.',
    steps: [
      'Check the Insights tab for sleep and activity trends',
      'View your weekly averages and compare to goals',
      'Get personalized recommendations based on your data',
      'Track your readiness score each morning',
    ],
  },
  {
    id: 'parent-connection',
    title: 'Parent Connection',
    icon: 'people-outline',
    description: 'How parents can stay connected with their teen\'s health.',
    steps: [
      'Parents generate an invite code in their Settings',
      'Teens enter the code to link accounts',
      'Parents can view health summaries and trends',
      'Privacy controls let teens manage what parents see',
    ],
  },
];

const HELPFUL_LINKS = [
  { id: 'privacy', title: 'Privacy Policy', icon: 'shield-checkmark-outline', url: 'https://growthtrack.app/privacy' },
  { id: 'terms', title: 'Terms of Service', icon: 'document-text-outline', url: 'https://growthtrack.app/terms' },
  { id: 'support', title: 'Contact Support', icon: 'mail-outline', url: 'mailto:support@growthtrack.app' },
  { id: 'faq', title: 'FAQs', icon: 'help-circle-outline', url: 'https://growthtrack.app/faq' },
];

export default function InstructionsScreen() {
  const router = useRouter();

  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log('Failed to open URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          testID="button-back-instructions"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>How to Use GrowthTrack</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.welcomeCard}>
          <Ionicons name="heart" size={32} color="#10B981" />
          <Text style={styles.welcomeTitle}>Your Health Journey Starts Here</Text>
          <Text style={styles.welcomeText}>
            GrowthTrack helps teen athletes track their health, stay on top of their goals, 
            and keep parents informed. Explore the sections below to learn how to use each feature.
          </Text>
        </Card>

        {GUIDE_SECTIONS.map((section) => (
          <Card key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name={section.icon} size={24} color="#10B981" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionDescription}>{section.description}</Text>
            <View style={styles.stepsList}>
              {section.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Text style={styles.linksTitle}>Helpful Links</Text>
        <Card style={styles.linksCard}>
          {HELPFUL_LINKS.map((link, index) => (
            <TouchableOpacity
              key={link.id}
              style={[
                styles.linkItem,
                index < HELPFUL_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => handleLinkPress(link.url)}
              testID={`link-${link.id}`}
            >
              <View style={styles.linkLeft}>
                <Ionicons name={link.icon as never} size={20} color="#3B82F6" />
                <Text style={styles.linkText}>{link.title}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need more help? Reach out to our support team anytime.
          </Text>
        </View>
      </ScrollView>
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
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  linksCard: {
    padding: 0,
    marginBottom: 24,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

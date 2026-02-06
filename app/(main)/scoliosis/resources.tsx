import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  content: string[];
  externalUrl: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: '1',
    title: 'Understanding Scoliosis',
    description: 'Learn about the different types of scoliosis and how it affects your spine.',
    category: 'Education',
    icon: 'school-outline',
    color: '#3B82F6',
    content: [
      'Scoliosis is a sideways curvature of the spine that most often occurs during the growth spurt just before puberty.',
      'There are three main types: Idiopathic (most common, cause unknown), Congenital (present at birth), and Neuromuscular (caused by nerve or muscle conditions).',
      'Curves are measured in degrees using the Cobb angle method on X-rays. Curves under 25 degrees are typically monitored, 25-45 degrees may require bracing, and over 45 degrees may need surgery.',
      'Most mild cases do not cause pain and can be effectively managed with observation and physical therapy.',
    ],
    externalUrl: 'https://www.srs.org/patients-and-families/conditions-and-treatments/parents/scoliosis',
  },
  {
    id: '2',
    title: 'Brace Wear Guide',
    description: 'Tips for wearing your brace comfortably and maximizing treatment effectiveness.',
    category: 'Treatment',
    icon: 'body-outline',
    color: '#10B981',
    content: [
      'Wear your brace for the number of hours prescribed by your doctor, typically 16-23 hours per day.',
      'Always wear a thin, seamless cotton shirt underneath to protect your skin and absorb moisture.',
      'Break in your brace gradually over the first 1-2 weeks, adding a few hours each day.',
      'Check daily for any red spots or skin irritation, especially around pressure points. Report persistent redness to your orthotist.',
      'Keep your brace clean by wiping the inside with rubbing alcohol and letting it air dry daily.',
    ],
    externalUrl: 'https://www.srs.org/patients-and-families/conditions-and-treatments/parents/scoliosis/bracing',
  },
  {
    id: '3',
    title: 'PT Exercise Library',
    description: 'Video tutorials for all your physical therapy exercises with proper form guidance.',
    category: 'Exercises',
    icon: 'fitness-outline',
    color: '#8B5CF6',
    content: [
      'Schroth exercises are the gold standard for scoliosis-specific physical therapy, focusing on elongation, de-rotation, and corrective breathing.',
      'Core stabilization exercises help support the spine and maintain posture throughout the day.',
      'Stretching exercises target tight muscles on the concave side of the curve to improve flexibility and reduce discomfort.',
      'Always perform exercises with proper form as taught by your PT. Incorrect form can be counterproductive.',
      'Aim for consistency - doing your exercises regularly (even shorter sessions) is better than occasional long sessions.',
    ],
    externalUrl: 'https://www.scoliosis.org/resources/medicalupdates/exercises.php',
  },
  {
    id: '4',
    title: 'Pain Management Tips',
    description: 'Strategies for managing discomfort and improving your daily comfort.',
    category: 'Wellness',
    icon: 'heart-outline',
    color: '#EC4899',
    content: [
      'Apply heat or ice to sore areas for 15-20 minutes. Heat works well for muscle tightness, while ice is better for inflammation.',
      'Practice good posture throughout the day - sit with your back supported and feet flat on the floor.',
      'Use a supportive mattress and pillow. Sleeping on your back with a pillow under your knees can reduce strain.',
      'Gentle movement and stretching often provides more relief than rest alone. Avoid prolonged sitting or standing.',
      'Deep breathing exercises can help relax tense muscles and reduce pain perception.',
    ],
    externalUrl: 'https://www.spine-health.com/conditions/scoliosis/scoliosis-pain-management',
  },
  {
    id: '5',
    title: 'Sports & Activities',
    description: 'How to stay active safely while managing scoliosis.',
    category: 'Lifestyle',
    icon: 'basketball-outline',
    color: '#F59E0B',
    content: [
      'Most sports and physical activities are safe and encouraged for people with scoliosis.',
      'Swimming is especially beneficial as it strengthens back muscles without compressing the spine.',
      'Yoga and Pilates can improve flexibility, core strength, and body awareness.',
      'High-impact sports like football or gymnastics may need modifications. Talk to your doctor about any specific restrictions.',
      'Stay active and participate in activities you enjoy. Exercise improves physical fitness and mental well-being.',
    ],
    externalUrl: 'https://www.srs.org/patients-and-families/conditions-and-treatments/parents/scoliosis/living-with-scoliosis',
  },
  {
    id: '6',
    title: 'Mental Health Support',
    description: 'Resources for dealing with the emotional aspects of having scoliosis.',
    category: 'Support',
    icon: 'chatbubble-ellipses-outline',
    color: '#6366F1',
    content: [
      'It is completely normal to feel frustrated, self-conscious, or anxious about your diagnosis. These feelings are valid.',
      'Talking to friends, family, or a counselor about your feelings can make a big difference.',
      'Connecting with others who have scoliosis (online groups, local support groups) can help you feel less alone.',
      'Focus on what you can control: doing your exercises, wearing your brace as prescribed, and staying active.',
      'Celebrate small wins in your treatment journey. Progress takes time, and every effort counts.',
    ],
    externalUrl: 'https://www.nssf.org/resources/',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How long do I need to wear my brace each day?',
    answer: 'Most prescribed braces are worn 16-23 hours per day. Your doctor will give you specific instructions based on your curve and brace type.',
  },
  {
    question: 'Can I play sports with scoliosis?',
    answer: 'Most athletes with scoliosis can participate in sports and physical activities. Swimming, yoga, and core-strengthening exercises are often recommended. Talk to your doctor about any specific restrictions.',
  },
  {
    question: 'Will my curve get worse?',
    answer: 'With proper treatment including brace wear and PT exercises, many curves can be stabilized or improved. Following your treatment plan is key to the best outcomes.',
  },
  {
    question: 'What if my brace is uncomfortable?',
    answer: 'Some discomfort is normal initially, but severe pain or skin issues should be reported to your orthotist or doctor. Wearing a thin cotton shirt underneath can help.',
  },
];

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const [expanded, setExpanded] = useState(false);

  const handleOpenLink = () => {
    Linking.openURL(resource.externalUrl).catch(() => {});
  };

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      testID={`resource-${resource.id}`}
    >
      <Card style={styles.resourceCard}>
        <View style={styles.resourceRow}>
          <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
            <Ionicons name={resource.icon} size={24} color={resource.color} />
          </View>
          <View style={styles.resourceContent}>
            <Text style={[styles.resourceCategory, { color: resource.color }]}>
              {resource.category.toUpperCase()}
            </Text>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color="#94A3B8"
          />
        </View>
        {expanded ? (
          <View style={styles.expandedContent}>
            <View style={[styles.expandedDivider, { backgroundColor: `${resource.color}30` }]} />
            {resource.content.map((item, idx) => (
              <View key={idx} style={styles.contentItem}>
                <View style={[styles.contentBullet, { backgroundColor: resource.color }]} />
                <Text style={styles.contentText}>{item}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.learnMoreButton, { backgroundColor: `${resource.color}15` }]}
              onPress={handleOpenLink}
              testID={`link-resource-${resource.id}`}
            >
              <Text style={[styles.learnMoreText, { color: resource.color }]}>
                Learn More Online
              </Text>
              <Ionicons name="open-outline" size={16} color={resource.color} />
            </TouchableOpacity>
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Resources & Support</Text>
        <Text style={styles.subtitle}>
          Educational materials and helpful information for managing scoliosis
        </Text>

        <Text style={styles.sectionTitle}>Learning Center</Text>
        {RESOURCES.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <Card key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color="#8B5CF6" />
              <Text style={styles.faqQuestion}>{item.question}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </Card>
        ))}

        <Card style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <Ionicons name="medical" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpDescription}>
                Contact your healthcare provider if you have concerns about your treatment.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.helpButton}
            data-testid="button-contact-provider"
          >
            <Text style={styles.helpButtonText}>Contact Provider</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.emergencyTitle}>When to Seek Immediate Care</Text>
          </View>
          <View style={styles.emergencyList}>
            <Text style={styles.emergencyItem}>Sudden severe back pain</Text>
            <Text style={styles.emergencyItem}>Numbness or weakness in legs</Text>
            <Text style={styles.emergencyItem}>Loss of bladder or bowel control</Text>
            <Text style={styles.emergencyItem}>Difficulty breathing</Text>
          </View>
          <Text style={styles.emergencyNote}>
            If experiencing any of these symptoms, seek medical attention immediately.
          </Text>
        </Card>

        <View style={styles.footer} />
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  resourceCard: {
    padding: 16,
    marginBottom: 12,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 12,
  },
  expandedDivider: {
    height: 1,
    marginBottom: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 8,
  },
  contentBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
    flexShrink: 0,
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqCard: {
    padding: 20,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    paddingLeft: 32,
  },
  helpCard: {
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: '#8B5CF6',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emergencyCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  emergencyList: {
    marginBottom: 12,
  },
  emergencyItem: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 28,
    paddingLeft: 16,
  },
  emergencyNote: {
    fontSize: 13,
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  footer: {
    height: 24,
  },
});

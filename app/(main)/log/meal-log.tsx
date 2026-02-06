import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Select, ConfirmDialog } from '@/components/ui';
import { useLogNutrition } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const MEAL_TYPES = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

const QUICK_MEALS: { name: string; calories: number; protein: number }[] = [
  { name: 'Protein Shake', calories: 200, protein: 30 },
  { name: 'Banana', calories: 105, protein: 1 },
  { name: 'Chicken & Rice', calories: 500, protein: 40 },
  { name: 'Salad', calories: 250, protein: 10 },
];

export default function MealLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logNutrition = useLogNutrition();
  const [mealType, setMealType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const hasFormData = description !== '' || calories !== '' || protein !== '';

  const handleSave = () => {
    logNutrition.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        mealType: mealType || 'snack',
        description,
        calories: calories ? parseInt(calories, 10) : null,
        protein: protein ? parseInt(protein, 10) : null,
        source: 'manual',
      },
      {
        onSuccess: () => {
          showToast('success', 'Meal Logged', 'Your meal has been recorded');
          setTimeout(() => router.back(), 600);
        },
        onError: (error) => {
          showToast('error', 'Save Failed', error.message || 'Could not save meal');
        },
      }
    );
  };

  const applyQuickMeal = (meal: { name: string; calories: number; protein: number }) => {
    setDescription(meal.name);
    setCalories(meal.calories.toString());
    setProtein(meal.protein.toString());
    setShowMacros(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (hasFormData) {
            setShowDiscardDialog(true);
          } else {
            router.back();
          }
        }} style={styles.backButton} testID="button-back-meal">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Meal</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.homeButton} testID="button-home-meal">
          <Ionicons name="home-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Select
          label="Meal Type"
          placeholder="Select meal type"
          options={MEAL_TYPES}
          value={mealType}
          onValueChange={setMealType}
          testID="select-meal-type"
        />

        <Card style={styles.photoCard}>
          <TouchableOpacity style={styles.photoButton}>
            <Ionicons name="camera" size={32} color="#10B981" />
            <Text style={styles.photoText}>Add Photo (optional)</Text>
          </TouchableOpacity>
        </Card>

        <Input
          label="What did you eat?"
          placeholder="Describe your meal..."
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.descriptionInput}
          testID="input-meal-description"
        />

        <TouchableOpacity 
          style={styles.macroToggle}
          onPress={() => setShowMacros(!showMacros)}
        >
          <Text style={styles.macroToggleText}>Add nutrition details (optional)</Text>
          <Ionicons 
            name={showMacros ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#10B981" 
          />
        </TouchableOpacity>

        {showMacros ? (
          <View style={styles.macroFields}>
            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <Input
                  label="Calories"
                  placeholder="0"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  testID="input-calories"
                />
              </View>
              <View style={styles.macroField}>
                <Input
                  label="Protein (g)"
                  placeholder="0"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  testID="input-protein"
                />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.quickMeals}>
          <Text style={styles.quickMealsTitle}>Quick Add</Text>
          <View style={styles.quickMealsGrid}>
            {QUICK_MEALS.map((meal) => (
              <TouchableOpacity
                key={meal.name}
                style={styles.quickMealChip}
                onPress={() => applyQuickMeal(meal)}
                testID={`button-quick-meal-${meal.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Text style={styles.quickMealText}>{meal.name}</Text>
                <Text style={styles.quickMealCals}>{meal.calories} cal</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={logNutrition.isPending ? 'Saving...' : 'Save Meal'}
          onPress={handleSave}
          disabled={!mealType || !description || logNutrition.isPending}
          testID="button-save-meal"
        />
      </View>

      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard Meal Log?"
        message="Your meal entry hasn't been saved yet."
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
  photoCard: {
    marginBottom: 16,
  },
  photoButton: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#E8F5F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  photoText: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 8,
  },
  descriptionInput: {
    minHeight: 100,
  },
  macroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  macroToggleText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  macroFields: {
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroField: {
    flex: 1,
  },
  quickMeals: {
    marginTop: 8,
  },
  quickMealsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quickMealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickMealChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5F0',
    borderRadius: 20,
  },
  quickMealText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  quickMealCals: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});

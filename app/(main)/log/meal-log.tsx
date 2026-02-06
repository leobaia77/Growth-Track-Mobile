import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Select, ConfirmDialog } from '@/components/ui';
import { useLogNutrition, useNutritionLogs } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

const MEAL_TYPES = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

interface MealTemplate {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEAL_TEMPLATES: Record<string, MealTemplate[]> = {
  protein: [
    { name: 'Protein Shake', calories: 200, protein: 30, carbs: 8, fat: 3 },
    { name: 'Grilled Chicken', calories: 230, protein: 42, carbs: 0, fat: 5 },
    { name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 12, fat: 4 },
    { name: 'Eggs (2)', calories: 140, protein: 12, carbs: 1, fat: 10 },
  ],
  carbs: [
    { name: 'Brown Rice (1 cup)', calories: 220, protein: 5, carbs: 45, fat: 2 },
    { name: 'Sweet Potato', calories: 110, protein: 2, carbs: 26, fat: 0 },
    { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
  ],
  full_meals: [
    { name: 'Chicken & Rice', calories: 500, protein: 40, carbs: 50, fat: 10 },
    { name: 'Pasta & Meat Sauce', calories: 600, protein: 25, carbs: 75, fat: 18 },
    { name: 'Grilled Salmon & Veggies', calories: 450, protein: 35, carbs: 20, fat: 22 },
    { name: 'Burrito Bowl', calories: 550, protein: 30, carbs: 60, fat: 15 },
  ],
  snacks: [
    { name: 'Almonds (handful)', calories: 165, protein: 6, carbs: 6, fat: 14 },
    { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
    { name: 'Protein Bar', calories: 250, protein: 20, carbs: 25, fat: 8 },
    { name: 'Trail Mix', calories: 175, protein: 5, carbs: 15, fat: 12 },
  ],
};

const TEMPLATE_CATEGORIES = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'full_meals', label: 'Full Meals' },
  { key: 'snacks', label: 'Snacks' },
];

const DAILY_TARGETS = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

function getBarColor(current: number, target: number): string {
  const ratio = current / target;
  if (ratio > 1) return '#EF4444';
  if (ratio >= 0.85) return '#F59E0B';
  return '#10B981';
}

export default function MealLogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logNutrition = useLogNutrition();
  const [mealType, setMealType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('protein');

  const today = new Date().toISOString().split('T')[0];
  const { data: todayLogs } = useNutritionLogs(today, today);

  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    if (todayLogs && todayLogs.length > 0) {
      todayLogs.forEach((log) => {
        totals.calories += log.calories || 0;
        totals.protein += log.protein || 0;
        totals.carbs += (log as any).carbs || 0;
        totals.fat += (log as any).fat || 0;
      });
    }
    return totals;
  }, [todayLogs]);

  const hasFormData = description !== '' || calories !== '' || protein !== '' || carbs !== '' || fat !== '';

  const handleSave = () => {
    logNutrition.mutate(
      {
        date: new Date().toISOString().split('T')[0],
        mealType: mealType || 'snack',
        description,
        calories: calories ? parseInt(calories, 10) : null,
        protein: protein ? parseInt(protein, 10) : null,
        carbs: carbs ? parseInt(carbs, 10) : null,
        fat: fat ? parseInt(fat, 10) : null,
        source: 'manual',
      } as any,
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

  const applyQuickMeal = (meal: MealTemplate) => {
    setDescription(meal.name);
    setCalories(meal.calories.toString());
    setProtein(meal.protein.toString());
    setCarbs(meal.carbs.toString());
    setFat(meal.fat.toString());
    setShowMacros(true);
  };

  const renderMacroBar = (label: string, current: number, target: number, unit: string, testID?: string) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100);
    const barColor = getBarColor(current, target);
    return (
      <View style={styles.macroBarContainer} key={label}>
        <View style={styles.macroBarHeader}>
          <Text style={styles.macroBarLabel}>{label}</Text>
          <Text style={[styles.macroBarValue, { color: barColor }]} testID={testID}>
            {current}{unit} / {target}{unit}
          </Text>
        </View>
        <View style={styles.macroBarTrack}>
          <View style={[styles.macroBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
        </View>
      </View>
    );
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
        <Card style={styles.dailySummaryCard}>
          <View style={styles.dailySummaryHeader}>
            <Ionicons name="nutrition-outline" size={20} color="#10B981" />
            <Text style={styles.dailySummaryTitle}>Today's Nutrition</Text>
          </View>
          {renderMacroBar('Calories', dailyTotals.calories, DAILY_TARGETS.calories, '', 'text-daily-calories')}
          {renderMacroBar('Protein', dailyTotals.protein, DAILY_TARGETS.protein, 'g', 'text-daily-protein')}
          {renderMacroBar('Carbs', dailyTotals.carbs, DAILY_TARGETS.carbs, 'g')}
          {renderMacroBar('Fat', dailyTotals.fat, DAILY_TARGETS.fat, 'g')}
        </Card>

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
            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <Input
                  label="Carbs (g)"
                  placeholder="0"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  testID="input-carbs"
                />
              </View>
              <View style={styles.macroField}>
                <Input
                  label="Fat (g)"
                  placeholder="0"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  testID="input-fat"
                />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.quickMeals}>
          <Text style={styles.quickMealsTitle}>Quick Add</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {TEMPLATE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryTab,
                  selectedCategory === cat.key ? styles.categoryTabActive : null,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
                testID={`button-template-category-${cat.key}`}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === cat.key ? styles.categoryTabTextActive : null,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.quickMealsGrid}>
            {MEAL_TEMPLATES[selectedCategory].map((meal) => (
              <TouchableOpacity
                key={meal.name}
                style={styles.quickMealChip}
                onPress={() => applyQuickMeal(meal)}
                testID={`button-quick-meal-${meal.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
              >
                <Text style={styles.quickMealText}>{meal.name}</Text>
                <Text style={styles.quickMealCals}>{meal.calories} cal · {meal.protein}g protein</Text>
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
  dailySummaryCard: {
    marginBottom: 20,
  },
  dailySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dailySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  macroBarContainer: {
    marginBottom: 12,
  },
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroBarLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  macroBarValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroBarTrack: {
    height: 6,
    backgroundColor: '#E8F5F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
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
    marginBottom: 8,
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
  categoryTabs: {
    marginBottom: 12,
  },
  categoryTabsContent: {
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryTabActive: {
    backgroundColor: '#10B981',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
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

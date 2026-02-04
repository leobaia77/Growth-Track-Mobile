# GrowthTrack Mobile App

## Overview

GrowthTrack is a React Native Expo mobile application designed for teen health tracking. The app enables teen athletes to log health metrics (sleep, workouts, nutrition, mental health, daily check-ins), receive personalized recommendations, and includes scoliosis support with PT exercises and brace tracking. The app supports Apple HealthKit integration for automatic health data syncing on iOS devices. The teen's date of birth is used to derive age-appropriate recommendations for growth and performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Removed parent profile functionality** - App is now teen-only with simplified architecture
- **Added mental health logging** - New screen with 3 tabs: Meditation, Mood/Feelings, Journal
  - 8 meditation templates (guided breathing, body scan, mindfulness, sleep, morning focus, stress relief, gratitude, visualization)
  - 10 mood options with intensity tracking (1-10 scale)
  - 6 journal templates (gratitude, daily reflection, goal setting, worry dump, affirmations, performance review)
- **Enhanced workout templates** - Added A/B/C split, PPL, Upper/Lower, and Bro Split templates
  - Includes RP (Rest-Pause) and WM (Widowmaker) technique explanations
  - Added swimming and water polo templates
- **Updated teen profile** - Now includes dateOfBirth field for age-based recommendations

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router with file-based routing supporting typed routes
- **State Management**: TanStack React Query for server state with 5-minute stale time and single retry policy
- **Styling**: StyleSheet-based component styling with consistent design tokens (colors: primary green #10B981, blue #3B82F6, purple #8B5CF6)

### Route Structure
The app uses teen-focused navigation flows:
- `/(auth)` - Login and registration screens
- `/(teen-onboarding)` - 5-step teen onboarding flow (age, goals, sports, availability, health connection)
- `/(tabs)` - Main app tabs for general users
- `/(teen-app)` - Teen-specific features (home, scoliosis care, logging, insights, profile, planning)

### Component Architecture
- **UI Components** (`components/ui/`): Reusable primitives (Button, Card, Input, Select, Slider, ProgressBar)
- **Teen Components** (`components/teen/`): Domain-specific cards (MorningBrief, Recommendations, Readiness, Schedule, WeekFocus, EscalationAlert)
- **Utility Components**: LoadingState, EmptyState, SkeletonLoader, OfflineIndicator

### Data Layer
- **API Service** (`services/api.ts`): Centralized HTTP client with automatic token injection and error handling
- **Storage Service** (`services/storage.ts`): Hybrid storage using Expo SecureStore for sensitive data (tokens) and AsyncStorage for general data, with web fallback
- **Offline Manager** (`services/offlineManager.ts`): Queue-based sync system with 7-day cache expiry, network status monitoring, and retry logic
- **HealthKit Service** (`services/healthKit.ts`): iOS-only Apple HealthKit integration for sleep, workouts, activity, and nutrition data with strict privacy compliance

### Custom Hooks
- `useAuth`: Authentication state management with login/register/logout flows
- `useApi`: React Query wrappers for all API endpoints (profiles, recommendations, logs, etc.)
- `useHealthKitSync`: HealthKit connection status and data synchronization
- `useOffline`: Network status tracking and cached data management

### Type System
TypeScript with strict mode enabled. Core types defined in `types/index.ts`:
- User roles: 'teen' | 'admin'
- Profile types: TeenProfile with goals, sports, availability, dateOfBirth
- Health data: DailyCheckin, SleepLog, WorkoutLog, NutritionLog
- Recommendations: MorningBrief, WeekFocus, RecommendationAction, EscalationFlag

## External Dependencies

### Backend API
- Environment variable: `EXPO_PUBLIC_API_URL` 
- RESTful API with Bearer token authentication
- Endpoints for auth, profiles, logging, recommendations

### Apple HealthKit (iOS only)
- Read-only access to sleep analysis, workouts, activity, and nutrition
- Requires HealthKit entitlement and privacy usage descriptions in app.json
- Data stored only on device or encrypted backend, never iCloud (Apple compliance)

### Expo Services
- expo-secure-store: Encrypted credential storage
- expo-router: File-based navigation
- expo-clipboard: Invite code sharing
- expo-font: Custom typography

### State Management
- @tanstack/react-query: Server state caching and synchronization
- @react-native-async-storage/async-storage: Persistent local storage

### UI/Icons
- @expo/vector-icons (Ionicons): Icon library for consistent visual language
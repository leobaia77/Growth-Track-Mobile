# GrowthTrack Mobile App

## Overview

GrowthTrack is a React Native Expo mobile application designed for athlete health tracking. The app enables users to log health metrics (sleep, workouts, nutrition, mental health, daily check-ins), receive personalized recommendations, and includes scoliosis support with PT exercises and brace tracking. The app supports Apple HealthKit integration for automatic health data syncing on iOS devices. The user's date of birth is used to derive age-appropriate recommendations for growth and performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Phase 5: Social features (Feb 2026)** - Repurposed Plan tab as Social tab with:
  - Achievement badges (8 milestones: streaks, sleep master, iron will, nutrition pro, PT champion, mindful warrior, early bird)
  - Native share integration for achievements and weekly summaries via React Native Share API
  - Friend activity feed with avatar circles and action descriptions
  - Weekly summary card with stats (days logged, workouts, avg sleep)
- **Phase 4b: Enhanced PT exercises (Feb 2026)** - PT routine screen now includes:
  - Detailed exercise instructions with step-by-step guides for all 5 exercises
  - Target area badges (Spine Mobility, Back & Hips, Core & Pelvis, Lateral Spine, Core & Breathing)
  - Post-exercise difficulty feedback (1-5 scale) and pain level tracking (none/mild/significant)
  - Expandable info cards on exercise list with instruction preview
  - Curvature tracking section in PT log with Cobb angle input, last measured date, and back feeling selector (5 levels)
- **Phase 4a: Enhanced meal logging (Feb 2026)** - Meal log now includes:
  - 16 categorized meal templates (protein, carbs, full meals, snacks) with full macro data
  - Category tab selector for browsing templates
  - Carbs and fat input fields alongside existing calories and protein
  - Daily macro summary card with color-coded progress bars (Calories/2000, Protein/120g, Carbs/250g, Fat/65g)
- **Phase 3: Notifications (Feb 2026)** - expo-notifications integration with:
  - Scheduled daily reminders (morning brief, check-in, workout, meal, sleep)
  - Notification preferences screen with toggle controls and time pickers
  - AsyncStorage persistence for notification settings
  - Graceful web platform handling
- **Phase 2: Insights & Charts (Feb 2026)** - SVG-based charts with:
  - Sleep trend line, workout frequency bars, mood/energy dual-line charts
  - 7D/30D time range toggle with period-over-period comparison cards
  - Personal records section (best sleep, most active day, peak mood/energy)
  - Summary stat cards with visual indicators
- **Phase 1: UX Improvements (Feb 2026)** - Added across all logging screens:
  - ConfirmDialog component preventing accidental data loss on 6 logging screens
  - Structured sleep disturbance categories (10 toggle options)
  - Simulated HealthKit sleep import button for iOS
- **Complete workout logging with exercise tracking** - Workout log now supports individual exercise tracking with sets/reps/weight, rest timer with presets (30s/1m/90s/2m/3m), and template auto-population of exercises for strength training templates
- **All logging screens connected to API** - Check-in, meal, workout, and sleep logging screens now save data to the backend API via react-query mutations with proper error handling
- **Toast notification system** - App-wide toast notifications (success/error/info/warning) via ToastProvider in root layout, used across all logging screens for save feedback
- **Sleep logging screen** - New screen with bedtime/wake time sliders, sleep quality rating (5 levels), night wakeup counter, and automatic hours calculation with color-coded guidance
- **Removed parent/teen distinction** - App now uses general user terminology (user/athlete)
- **Simplified user roles** - Only 'user' and 'admin' roles exist
- **Renamed routes** - (teen-onboarding) → (onboarding), (teen-app) → (main)
- **Added mental health logging** - New screen with 3 tabs: Meditation, Mood/Feelings, Journal
  - 8 meditation templates (guided breathing, body scan, mindfulness, sleep, morning focus, stress relief, gratitude, visualization)
  - 10 mood options with intensity tracking (1-10 scale)
  - 6 journal templates (gratitude, daily reflection, goal setting, worry dump, affirmations, performance review)
- **Enhanced workout templates** - Added A/B/C split, PPL, Upper/Lower, and Bro Split templates
  - Includes RP (Rest-Pause) and WM (Widowmaker) technique explanations
  - Added swimming and water polo templates
- **Updated user profile** - Now includes dateOfBirth field for age-based recommendations
- **Added security word recovery** - Registration now includes a security word field for account recovery
  - Forgot password link on login page
  - Password reset using email + security word verification
- **Testing documentation** - Comprehensive app testing guide with screenshots added (TESTING_GUIDE.md)
- **Added admin dashboard** - Web-optimized admin panel with 5 sections:
  - Performance & Quality Dashboard (metrics, graphs, recent activity)
  - User Management (search, reset data, suspend users)
  - Error Monitoring (error logs, warnings, resolve status)
  - AI Agents Configuration (edit prompts, models, toggle agents)
  - Settings (maintenance mode, debug logging, danger zone)
- **Bug fixes (Feb 2026)**:
  - Fixed Sleep route in Track tab - was pointing to check-in screen instead of sleep-log
  - Connected mental health logging to API via useLogMentalHealth hook with toast feedback
  - Connected PT log to API via useLogPtAdherence hook with toast feedback
  - Fixed profile settings routes - Account, Privacy, Notifications, Health Connections now navigate to their respective settings screens

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router with file-based routing supporting typed routes
- **State Management**: TanStack React Query for server state with 5-minute stale time and single retry policy
- **Styling**: StyleSheet-based component styling with consistent design tokens (colors: primary green #10B981, blue #3B82F6, purple #8B5CF6)

### Route Structure
The app uses user-focused navigation flows:
- `/(auth)` - Login and registration screens
- `/(onboarding)` - 5-step onboarding flow (age-range, goals, sports, availability, connect-health)
- `/(tabs)` - Main app tabs for general users
- `/(main)` - Main app features (home, scoliosis care, logging, insights, social, settings)
- `/(admin)` - Admin dashboard (web-optimized, accessible from profile for admin users)

### Component Architecture
- **UI Components** (`components/ui/`): Reusable primitives (Button, Card, Input, Select, Slider, ProgressBar)
- **User Components** (`components/teen/`): Domain-specific cards (MorningBrief, Recommendations, Readiness, Schedule, WeekFocus, EscalationAlert)
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
- User roles: 'user' | 'admin'
- Profile types: UserProfile with goals, sports, availability, dateOfBirth
- Health data: DailyCheckin, SleepLog, WorkoutLog, NutritionLog
- Recommendations: MorningBrief, WeekFocus, RecommendationAction, EscalationFlag

## External Dependencies

### Backend API
- External API: https://node-post-connect.replit.app
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

# GrowthTrack Mobile App - Complete Testing Guide

This comprehensive guide walks you through testing all features of the GrowthTrack health tracking app, from account creation to daily usage.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Account Creation & Authentication](#2-account-creation--authentication)
3. [Onboarding Flow](#3-onboarding-flow)
4. [Daily Usage - Main Features](#4-daily-usage---main-features)
5. [Health Logging Features](#5-health-logging-features)
6. [Scoliosis Support Features](#6-scoliosis-support-features)
7. [Settings & Profile Management](#7-settings--profile-management)
8. [Password Recovery](#8-password-recovery)
9. [Day-by-Day Testing Scenarios](#9-day-by-day-testing-scenarios)

---

## 1. Getting Started

### Testing Methods

**Option A: TestFlight (iOS - Recommended)**
1. Download TestFlight from the App Store
2. Accept the TestFlight invitation sent to your email
3. Install GrowthTrack from TestFlight
4. Open the app to begin testing

**Option B: Expo Go (Development Testing)**
1. Download Expo Go from App Store (iOS) or Google Play (Android)
2. Scan the QR code from the development environment
3. The app will load in Expo Go

**Option C: Web Testing**
1. Navigate to the deployed app URL
2. Note: Some features may behave differently on web vs. native

---

## 2. Account Creation & Authentication

### 2.1 Registration Screen

**Path:** App Launch → "Create one" link

**Test Steps:**
1. Launch the app - you'll see the login screen
2. Tap "Create one" at the bottom to access registration

**Fields to Test:**
| Field | Description | Validation |
|-------|-------------|------------|
| Display Name | Your name shown in the app | Required |
| Email | Valid email address | Required, must be valid format |
| Password | Account password | Required, minimum 8 characters |
| Security Word | Secret word for account recovery | Required |

**Expected Behavior:**
- "Create Account" button should be disabled until all fields are filled
- Security word hint text should be visible below the field
- Tapping the eye icon toggles password visibility

**Screenshot Description:**
```
┌─────────────────────────────┐
│      [Heart Icon]           │
│    Create Account           │
│ Start your health journey   │
│                             │
│ ┌─────────────────────────┐ │
│ │ Display Name            │ │
│ │ [Your name           ]  │ │
│ │                         │ │
│ │ Email                   │ │
│ │ [you@example.com     ]  │ │
│ │                         │ │
│ │ Password                │ │
│ │ [Create a password   👁]│ │
│ │                         │ │
│ │ Security Word           │ │
│ │ [A secret word...    ]  │ │
│ │ Remember this word...   │ │
│ │                         │ │
│ │ [  Create Account    ]  │ │
│ └─────────────────────────┘ │
│                             │
│ Already have an account?    │
│         Sign in             │
└─────────────────────────────┘
```

### 2.2 Login Screen

**Path:** App Launch (default screen)

**Test Steps:**
1. Enter registered email
2. Enter password
3. Tap "Sign In"

**Features to Test:**
- [x] Email field accepts keyboard input
- [x] Password field is masked by default
- [x] Eye icon toggles password visibility
- [x] "Forgot password?" link is visible and tappable
- [x] "Sign in with Apple" button is present
- [x] "Create one" link navigates to registration

**Screenshot Description:**
```
┌─────────────────────────────┐
│      [Heart Icon]           │
│    Welcome Back             │
│ Sign in to continue         │
│                             │
│ ┌─────────────────────────┐ │
│ │ Email                   │ │
│ │ [you@example.com     ]  │ │
│ │                         │ │
│ │ Password                │ │
│ │ [Enter password      👁]│ │
│ │                         │ │
│ │ [     Sign In        ]  │ │
│ │                         │ │
│ │    Forgot password?     │ │
│ │                         │ │
│ │ ────── or ──────        │ │
│ │                         │ │
│ │ [ Sign in with Apple ]  │ │
│ └─────────────────────────┘ │
│                             │
│ Don't have an account?      │
│        Create one           │
└─────────────────────────────┘
```

---

## 3. Onboarding Flow

After successful registration, new users go through a 5-step onboarding process.

### 3.1 Age Range Selection

**Path:** After Registration → Step 1

**Test Steps:**
1. Select your age range from the options
2. Tap "Continue"

**Age Range Options:**
- 13-15 years
- 16-18 years
- 19-21 years
- 22+ years

**Screenshot Description:**
```
┌─────────────────────────────┐
│ Step 1 of 5                 │
│                             │
│ What's your age range?      │
│                             │
│ ┌─────────────────────────┐ │
│ │ ○ 13-15 years           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ● 16-18 years           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ○ 19-21 years           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ○ 22+ years             │ │
│ └─────────────────────────┘ │
│                             │
│ [       Continue         ]  │
└─────────────────────────────┘
```

### 3.2 Goals Selection

**Path:** Onboarding → Step 2

**Test Steps:**
1. Select one or more goals
2. Drag to reorder by priority (optional)
3. Tap "Continue"

**Available Goals:**
- Improve Performance
- Build Strength
- Increase Endurance
- Better Recovery
- Injury Prevention
- Mental Focus
- Weight Management
- Sleep Optimization

### 3.3 Sports Selection

**Path:** Onboarding → Step 3

**Test Steps:**
1. Select sports you participate in
2. Set skill level for each (Recreational, School, Club, Elite)
3. Tap "Continue"

### 3.4 Weekly Availability

**Path:** Onboarding → Step 4

**Test Steps:**
1. Set available time blocks for each day
2. Mark training times vs. rest times
3. Tap "Continue"

### 3.5 Health Data Connection

**Path:** Onboarding → Step 5

**Test Steps:**
1. Review Apple HealthKit connection options
2. Choose to connect or skip
3. If connecting, approve HealthKit permissions
4. Tap "Complete Setup"

---

## 4. Daily Usage - Main Features

### 4.1 Home Screen

**Path:** Main App → Home Tab

**Features to Verify:**
- [ ] Today's date displayed
- [ ] Morning brief summary
- [ ] Quick action buttons
- [ ] Recommendation cards
- [ ] Progress indicators

**Screenshot Description:**
```
┌─────────────────────────────┐
│ Good Morning, [Name]!       │
│ [Today's Date]              │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ Today's Readiness     │   │
│ │ Score: 85/100         │   │
│ │ [███████████░░]       │   │
│ └───────────────────────┘   │
│                             │
│ Morning Brief               │
│ ┌───────────────────────┐   │
│ │ Sleep: 7.5h avg       │   │
│ │ Training: 145min/week │   │
│ │ Recovery: Good        │   │
│ └───────────────────────┘   │
│                             │
│ Today's Actions             │
│ • Complete morning check-in │
│ • 30 min training session   │
│ • Track meals               │
│                             │
│ [Tab Bar: Home|Track|...]   │
└─────────────────────────────┘
```

### 4.2 Track Screen

**Path:** Main App → Track Tab

**Quick Actions Available:**
- Daily Check-in
- Log Sleep
- Log Workout
- Log Meal
- Log Mental Health
- PT Exercises (if scoliosis enabled)

### 4.3 Insights Screen

**Path:** Main App → Insights Tab

**Features to Verify:**
- [ ] Weekly trends displayed
- [ ] Sleep pattern graphs
- [ ] Training load visualization
- [ ] Nutrition overview
- [ ] Mental health trends

### 4.4 Profile Screen

**Path:** Main App → Profile Tab

**Features to Verify:**
- [ ] User name and avatar
- [ ] Current goals listed
- [ ] Active sports displayed
- [ ] Quick settings access

---

## 5. Health Logging Features

### 5.1 Daily Check-in

**Path:** Track → Daily Check-in

**Fields to Test:**
| Metric | Scale | Description |
|--------|-------|-------------|
| Energy Level | 1-10 | How energized you feel |
| Soreness Level | 1-10 | Muscle soreness |
| Mood Level | 1-10 | Overall mood |
| Stress Level | 1-10 | Stress/anxiety level |
| Pain Flag | Yes/No | Any concerning pain |

**Test Steps:**
1. Adjust each slider
2. Toggle pain flag if applicable
3. Add optional notes
4. Tap "Save Check-in"

### 5.2 Sleep Logging

**Path:** Track → Log Sleep

**Fields to Test:**
- Bedtime
- Wake time
- Sleep quality (1-10)
- Notes (optional)

### 5.3 Workout Logging

**Path:** Track → Log Workout

**Workout Templates Available:**
- **A/B/C Split** - 3-day rotation
- **PPL (Push/Pull/Legs)** - 6-day program
- **Upper/Lower** - 4-day split
- **Bro Split** - 5-day program
- **Swimming** - Water workouts
- **Water Polo** - Sport-specific

**Fields to Test:**
- Workout type/template
- Duration (minutes)
- RPE (Rate of Perceived Exertion) 1-10
- Exercises performed
- Notes

**Special Notations:**
- RP = Rest-Pause technique
- WM = Widowmaker set (20 rep challenge)

### 5.4 Meal Logging

**Path:** Track → Log Meal

**Meal Types:**
- Breakfast
- Lunch
- Dinner
- Snack
- Pre-workout
- Post-workout

**Fields to Test:**
- Meal type
- Description
- Estimated calories (optional)
- Protein content (optional)

### 5.5 Mental Health Logging

**Path:** Track → Log Mental Health

**Three Tabs Available:**

**Tab 1: Meditation**
Templates available:
1. Guided Breathing
2. Body Scan
3. Mindfulness
4. Sleep Meditation
5. Morning Focus
6. Stress Relief
7. Gratitude Practice
8. Visualization

**Tab 2: Mood/Feelings**
- Select from 10 mood options
- Rate intensity (1-10)
- Add context notes

**Tab 3: Journal**
Templates available:
1. Gratitude Journal
2. Daily Reflection
3. Goal Setting
4. Worry Dump
5. Affirmations
6. Performance Review

---

## 6. Scoliosis Support Features

### 6.1 Enabling Scoliosis Support

**Path:** Profile → Settings → Enable Scoliosis Care

**Test Steps:**
1. Navigate to Settings
2. Find "Scoliosis Support" section
3. Toggle to enable
4. Confirm activation

### 6.2 Brace Tracker

**Path:** Scoliosis → Brace Tracker

**Features to Test:**
- [ ] Start brace session
- [ ] End brace session
- [ ] View daily wear time
- [ ] Weekly wear time goals
- [ ] Session history

**Test Steps:**
1. Tap "Start Wearing"
2. Timer should begin
3. Optionally add notes
4. Tap "Stop Wearing" when done
5. Review logged session

### 6.3 PT Routine

**Path:** Scoliosis → PT Routine

**Features to Test:**
- [ ] View assigned exercises
- [ ] Start routine timer
- [ ] Mark exercises complete
- [ ] Log routine adherence

### 6.4 Symptom Logging

**Path:** Scoliosis → Symptoms

**Symptoms to Track:**
- Pain level (1-10)
- Pain location
- Stiffness
- Fatigue
- Notes

### 6.5 Resources

**Path:** Scoliosis → Resources

**Content Available:**
- Exercise videos
- Educational articles
- Tips and best practices
- FAQ section

---

## 7. Settings & Profile Management

### 7.1 Account Settings

**Path:** Profile → Settings → Account

**Features to Test:**
- [ ] Update display name
- [ ] Change email (requires verification)
- [ ] Update password
- [ ] Date of birth setting

### 7.2 Goals Management

**Path:** Profile → Settings → Goals

**Test Steps:**
1. View current goals
2. Add new goal
3. Reorder priorities
4. Remove a goal
5. Save changes

### 7.3 Notification Settings

**Path:** Profile → Settings → Notifications

**Notification Types:**
- Daily check-in reminders
- Workout reminders
- Meal logging reminders
- Brace reminders (if enabled)
- Weekly summary

### 7.4 Data Export

**Path:** Profile → Settings → Data Export

**Features to Test:**
- [ ] Export all data
- [ ] Select date range
- [ ] Choose format (CSV/JSON)
- [ ] Download/share file

### 7.5 Health Connections

**Path:** Profile → Settings → Connections

**Features to Test:**
- [ ] View connected services
- [ ] Connect Apple HealthKit
- [ ] Disconnect services
- [ ] Sync status

### 7.6 Privacy & Terms

**Path:** Profile → Settings → Privacy Policy / Terms of Service

**Verify:**
- Documents load correctly
- Scroll works properly
- Links are tappable

---

## 8. Password Recovery

### 8.1 Forgot Password Flow

**Path:** Login → "Forgot password?"

**Step 1: Verify Identity**
1. Tap "Forgot password?" on login screen
2. Enter email address
3. Enter security word (set during registration)
4. Tap "Verify"

**Step 2: Reset Password**
1. If verification successful, new password form appears
2. Enter new password (min 8 characters)
3. Confirm new password
4. Tap "Reset Password"

**Step 3: Confirmation**
1. Success message displayed
2. Tap "Go to Sign In"
3. Login with new password

**Screenshot Description:**
```
┌─────────────────────────────┐
│       [Key Icon]            │
│    Account Recovery         │
│ Enter your email and        │
│ security word to recover    │
│                             │
│ ┌─────────────────────────┐ │
│ │ Email                   │ │
│ │ [you@example.com     ]  │ │
│ │                         │ │
│ │ Security Word           │ │
│ │ [Enter your word     ]  │ │
│ │                         │ │
│ │ This is the secret word │ │
│ │ you created when you    │ │
│ │ registered...           │ │
│ │                         │ │
│ │ [      Verify        ]  │ │
│ └─────────────────────────┘ │
│                             │
│ Remember your password?     │
│          Sign in            │
└─────────────────────────────┘
```

---

## 9. Day-by-Day Testing Scenarios

### Day 1: Setup & First Use

**Morning:**
1. ✓ Download app via TestFlight
2. ✓ Create new account with all fields
3. ✓ Complete 5-step onboarding
4. ✓ Explore home screen
5. ✓ Complete first daily check-in

**Afternoon:**
6. ✓ Log lunch meal
7. ✓ Explore Track tab features
8. ✓ View Insights (limited data expected)

**Evening:**
9. ✓ Log dinner
10. ✓ Log evening mood in Mental Health
11. ✓ Set up notification preferences

---

### Day 2: Workout Day

**Morning:**
1. ✓ Complete daily check-in
2. ✓ Log breakfast
3. ✓ Check morning recommendations

**Workout Session:**
4. ✓ Navigate to Log Workout
5. ✓ Select workout template (e.g., PPL - Push)
6. ✓ Log duration and exercises
7. ✓ Rate RPE
8. ✓ Add notes about session

**Post-Workout:**
9. ✓ Log post-workout meal
10. ✓ Check updated recommendations
11. ✓ Log evening mood

---

### Day 3: Mental Health Focus

**Morning:**
1. ✓ Daily check-in
2. ✓ Navigate to Mental Health logging
3. ✓ Complete a meditation session (e.g., Morning Focus)
4. ✓ Log mood/feelings

**Midday:**
5. ✓ Write in Gratitude Journal
6. ✓ Log meals

**Evening:**
7. ✓ Complete Stress Relief meditation
8. ✓ Log evening mood
9. ✓ Review day in Insights

---

### Day 4: Scoliosis Features (if applicable)

**Morning:**
1. ✓ Enable scoliosis support in Settings
2. ✓ Review PT routine
3. ✓ Start brace session

**During Day:**
4. ✓ Complete PT exercises
5. ✓ Log PT adherence
6. ✓ Check brace wear time

**Evening:**
7. ✓ End brace session
8. ✓ Log any symptoms
9. ✓ Review scoliosis dashboard

---

### Day 5: Review & Insights

**Focus:** Reviewing accumulated data

1. ✓ View Insights tab
2. ✓ Check sleep trends graph
3. ✓ Review training load
4. ✓ Analyze mood patterns
5. ✓ Check nutrition overview
6. ✓ Review weekly summary

---

### Day 6: Settings Exploration

**Focus:** Profile and account management

1. ✓ Update profile information
2. ✓ Modify goals
3. ✓ Adjust notification settings
4. ✓ Review privacy policy
5. ✓ Test data export feature
6. ✓ Check health connections

---

### Day 7: Edge Cases & Recovery

**Focus:** Testing error handling and recovery

1. ✓ Test forgot password flow
2. ✓ Try logging in with wrong password
3. ✓ Test offline mode (if applicable)
4. ✓ Test with empty fields
5. ✓ Verify error messages are clear
6. ✓ Test logout and re-login

---

## Testing Checklist Summary

### Authentication
- [ ] New user registration with all fields
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error shown)
- [ ] Password recovery with security word
- [ ] Logout functionality

### Onboarding
- [ ] Age range selection
- [ ] Goals selection and ordering
- [ ] Sports selection with levels
- [ ] Availability configuration
- [ ] Health data connection

### Daily Logging
- [ ] Daily check-in with all sliders
- [ ] Sleep logging
- [ ] Workout logging with templates
- [ ] Meal logging for all meal types
- [ ] Mental health - meditation
- [ ] Mental health - mood tracking
- [ ] Mental health - journaling

### Scoliosis Features
- [ ] Enable/disable scoliosis support
- [ ] Brace session start/stop
- [ ] PT routine completion
- [ ] Symptom logging
- [ ] Resources access

### Insights & Data
- [ ] View weekly trends
- [ ] Sleep pattern visualization
- [ ] Training load graphs
- [ ] Data export functionality

### Settings
- [ ] Update account information
- [ ] Modify goals
- [ ] Notification preferences
- [ ] Privacy policy review
- [ ] Terms of service review

---

## Reporting Issues

When reporting issues, please include:

1. **Device Information**
   - iOS/Android version
   - Device model
   - App version (from TestFlight)

2. **Issue Description**
   - What you were trying to do
   - What happened instead
   - Steps to reproduce

3. **Screenshots/Videos**
   - Capture the issue if possible
   - Include any error messages

4. **Account Details**
   - Email used (for backend lookup)
   - Approximate time of issue

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | Current | Initial TestFlight release |

---

*Thank you for testing GrowthTrack! Your feedback helps us improve the app.*

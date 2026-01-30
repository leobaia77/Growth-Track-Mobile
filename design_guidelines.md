# GrowthTrack Mobile - Design Guidelines

## Brand Identity
**Purpose**: GrowthTrack helps users visualize and celebrate personal growth through habit tracking and progress metrics.

**Aesthetic Direction**: Editorial/organic hybrid - clean typographic hierarchy with warm, encouraging tones. The app feels like a personal journal meets data dashboard, balancing analytical precision with emotional warmth.

**Memorable Element**: Progress celebration animations and encouraging micro-interactions that make tracking feel rewarding, not robotic.

## Navigation Architecture
**Root Navigation**: Tab Bar (3 tabs)
- **Home** (Today) - Daily tracking and overview
- **Insights** (Chart icon) - Progress analytics
- **Profile** (Person icon) - Settings and account

**Additional Screens**:
- Add Habit (Modal)
- Habit Detail (Stack)
- Edit Habit (Modal)
- Onboarding (Stack-only, first launch)

## Screen Specifications

### Home Screen
**Purpose**: Track today's habits and see active goals
- **Header**: Transparent, title "Today", right button "+" (opens Add Habit modal)
- **Layout**: ScrollView, top inset: headerHeight + Spacing.xl, bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Date header with current streak count
  - Card list of active habits (checkboxes, progress rings)
  - Empty state illustration if no habits (empty-today.png)

### Insights Screen
**Purpose**: View growth analytics and history
- **Header**: Default, title "Insights"
- **Layout**: ScrollView, top inset: Spacing.xl, bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Weekly/monthly toggle
  - Line charts for completion rates
  - Habit performance cards
  - Empty state if insufficient data (empty-insights.png)

### Profile Screen
**Purpose**: Manage account and preferences
- **Header**: Transparent, title "Profile"
- **Layout**: ScrollView, top inset: headerHeight + Spacing.xl, bottom inset: tabBarHeight + Spacing.xl
- **Components**:
  - Avatar (generated preset) with display name
  - Settings list (Theme, Notifications)
  - About section
  - No auth required (local-only app)

### Add Habit Modal
**Purpose**: Create new habit to track
- **Header**: Left "Cancel", title "New Habit", right "Save"
- **Layout**: Scrollable form, buttons in header
- **Components**:
  - Habit name field
  - Color picker (6 preset colors)
  - Frequency selector (Daily/Weekdays/Custom)
  - Goal toggle (optional target count)

### Habit Detail Screen
**Purpose**: View single habit history and edit
- **Header**: Default, title = habit name, right "Edit"
- **Layout**: ScrollView
- **Components**:
  - Calendar heatmap
  - Current streak
  - All-time stats
  - History list (past completions)

## Color Palette
- **Primary**: #16A34A (vibrant green - growth/progress)
- **Primary Light**: #86EFAC
- **Background**: #FAFAFA
- **Surface**: #FFFFFF
- **Surface Alt**: #F5F5F5
- **Text Primary**: #1A1A1A
- **Text Secondary**: #737373
- **Border**: #E5E5E5
- **Success**: #16A34A
- **Warning**: #F59E0B
- **Error**: #EF4444

## Typography
**Font**: System (SF Pro/Roboto)
- **Title Large**: 32px, Bold
- **Title**: 24px, Bold
- **Headline**: 18px, Semibold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

## Visual Design
- Habit cards: rounded 16px, subtle border, no shadow
- Checkboxes: circular, 32px, animated fill
- Tab bar: minimal, icon-only, green active state
- Floating elements: shadowOffset {width:0, height:2}, shadowOpacity:0.10, shadowRadius:2
- All touchables: opacity 0.7 on press
- Use Feather icons throughout (@expo/vector-icons)

## Assets to Generate
1. **icon.png** - App icon featuring upward growth arrow in green circle
2. **splash-icon.png** - Simple green growth chart icon
3. **empty-today.png** - Illustration of blank checklist with encouraging plant sprout, used on Home screen when no habits exist
4. **empty-insights.png** - Illustration of empty chart with telescope/binoculars, used on Insights screen when insufficient data
5. **onboarding-1.png** - Illustration of person setting goals, used on first onboarding screen
6. **avatar-default.png** - Simple green circle with plant icon, used as default user avatar
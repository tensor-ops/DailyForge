# ⚒️ DailyForge — Complete Dialog → Backend Integration Matrix

This document provides a comprehensive audit of every dialog, modal, drawer, and creation form across the DailyForge application, detailing their frontend triggers, REST endpoints, backend validation, business services, database entities, and live execution status.

---

## 📊 Dialog & Lifecycle Inventory

| Module / Page | Dialog Component | Purpose / User Action | REST Endpoint | Backend Controller & Service | Mongoose Domain Entity | Full-Stack Status |
|---|---|---|---|---|---|:---:|
| **Dashboard / Global** | `QuickAddModal` | Fast create Habit, Task, or Event | `POST /api/v1/habits`<br>`POST /api/v1/tasks`<br>`POST /api/v1/planner/events` | `todayController.quickAdd*`<br>`todayService.quickAdd*` | `Habit`<br>`Task`<br>`CalendarEvent` | ✅ **Connected** |
| **Today** | `DailyReviewModal` | "End of Day Momentum Review" with ratings & reflection | `POST /api/v1/today/review` | `todayController.submitDailyReview`<br>`todayService.submitDailyReview` | `DailyReview`<br>`DailySnapshot` | ✅ **Connected** |
| **Today / Dashboard** | `EnergyLogModal` | Log cognitive & physical energy check-in (1–10) | `POST /api/v1/analytics/energy` | `analyticsController.logEnergy`<br>`analyticsService.logEnergy` | `EnergyLog`<br>`DailySnapshot` | ✅ **Connected** |
| **Today / Habits** | `MissReasonModal` | Record friction & reason for missed routine | `POST /api/v1/habits/:id/miss` | `habitController.logHabitMiss`<br>`habitService.logHabitMiss` | `HabitMiss`<br>`Habit` | ✅ **Connected** |
| **Habits** | `CreateHabitModal` | Full habit builder (schedule, circadian window, targets) | `POST /api/v1/habits` | `habitController.createHabit`<br>`habitService.createHabit` | `Habit` | ✅ **Connected** |
| **Habits** | `DeleteHabitModal` | Destructive permanent habit deletion with confirmation | `DELETE /api/v1/habits/:id` | `habitController.deleteHabit`<br>`habitService.deleteHabit` | `Habit`<br>`HabitCompletion`<br>`HabitMiss` | ✅ **Connected** |
| **Habits / Analytics** | `HabitDrilldownModal` | Diagnostic habit analysis, friction patterns & trends | `GET /api/v1/habits/:id` | `habitController.getHabitById`<br>`habitService.getHabitMetrics` | `Habit`<br>`HabitCompletion` | ✅ **Connected** |
| **Goals** | `GoalModal` (Create) | Create high-impact goal with milestones & targets | `POST /api/v1/goals` | `goalController.createGoal`<br>`goalService.createGoal` | `Goal`<br>`GoalMilestone` | ✅ **Connected** |
| **Goals** | `GoalModal` (Edit) | Edit goal title, target value, deadlines, and roadmap | `PATCH /api/v1/goals/:id` | `goalController.updateGoal`<br>`goalService.updateGoal` | `Goal` | ✅ **Connected** |
| **Goal Details** | Inline Add Milestone | Add target milestone to goal tree | `POST /api/v1/goals/:id/milestones` | `goalController.addMilestone`<br>`goalService.addMilestone` | `Goal` | ✅ **Connected** |
| **Goal Details** | Inline Link Habit | Connect existing habit to goal trajectory | `POST /api/v1/goals/:id/habits` | `goalController.linkHabit`<br>`goalService.linkHabit` | `Goal`<br>`Habit` | ✅ **Connected** |
| **Goal Details** | Inline Link Task | Connect existing task to goal plan | `POST /api/v1/goals/:id/tasks` | `goalController.linkTask`<br>`goalService.linkTask` | `Goal`<br>`Task` | ✅ **Connected** |
| **Planner** | `EventModal` (Create) | Schedule new time block on calendar | `POST /api/v1/planner/events` | `plannerController.createEvent`<br>`plannerService.createEvent` | `CalendarEvent` | ✅ **Connected** |
| **Planner** | `EventModal` (Edit) | Update time block timings, priority, or category | `PATCH /api/v1/planner/events/:id` | `plannerController.updateEvent`<br>`plannerService.updateEvent` | `CalendarEvent` | ✅ **Connected** |
| **Planner** | `EventDetailsModal` | Complete, reschedule, or delete time block | `POST /api/v1/planner/events/:id/complete`<br>`POST /api/v1/planner/events/reschedule`<br>`DELETE /api/v1/planner/events/:id` | `plannerController.*`<br>`plannerService.*` | `CalendarEvent` | ✅ **Connected** |
| **Planner** | `AutoScheduleModal` | AI Circadian Auto-Schedule generator and 1-click apply | `GET /api/v1/planner/auto-schedule/preview`<br>`POST /api/v1/planner/auto-schedule/apply` | `plannerController.getAutoSchedulePreview`<br>`plannerController.applyAutoSchedule` | `CalendarEvent`<br>`Habit` | ✅ **Connected** |
| **Planner** | `FocusModeModal` | Fullscreen Pomodoro countdown timer & session logger | `POST /api/v1/today/focus-session` | `todayController.logFocusSession`<br>`todayService.logFocusSession` | `FocusSession` | ✅ **Connected** |
| **Analytics** | `ForgeScoreModal` | 5-Pillar behavioral score breakdown & calculation | `GET /api/v1/analytics/forge-score` | `analyticsController.getForgeScore`<br>`analyticsService.computeScore` | `DailySnapshot`<br>`HabitCompletion` | ✅ **Connected** |
| **Forge Lab** | `ExperimentBuilderModal` | 4-Step N-of-1 habit trial wizard (7–30 days) | `POST /api/v1/experiments` | `experimentController.createExperiment`<br>`experimentService.create` | `Experiment` | ✅ **Connected** |
| **Forge Lab** | `ExperimentDetailModal` | Inspect trial chart data, observations & apply verdict | `GET /api/v1/experiments/:id`<br>`POST /api/v1/experiments/:id/apply` | `experimentController.getExperimentDetail`<br>`experimentController.applyResult` | `Experiment`<br>`Habit` | ✅ **Connected** |
| **Milestones** | `MomentDetailModal` | Inspect digital collectible tokens & pin to top | `GET /api/v1/milestones/moments`<br>`POST /api/v1/milestones/moments/:code/pin` | `milestoneController.getMoments`<br>`milestoneController.togglePin` | `UserAchievement`<br>`Achievement` | ✅ **Connected** |
| **Milestones** | `AchievementGalleryModal` | View all unlocked & locked milestones | `GET /api/v1/milestones/achievements` | `milestoneController.getAchievements`<br>`milestoneService.getAchievements` | `Achievement`<br>`UserAchievement` | ✅ **Connected** |
| **Forge Insights** | `EvidenceDrawerModal` | Inspect telemetry samples, baselines & observations | `GET /api/v1/ai/insights/feed`<br>`POST /api/v1/ai/recommendations/:id/apply` | `aiController.getInsightFeed`<br>`aiController.applyRecommendation` | `AIInsight`<br>`Recommendation` | ✅ **Connected** |
| **Profile** | `EditProfileModal` | Update user display name, timezone, bio, and handle | `PATCH /api/v1/profile` | `profileController.updateProfile`<br>`profileService.updateProfile` | `User` | ✅ **Connected** |
| **Global Shell** | `CommandPalette` | `Cmd+K` fast navigation & quick action dispatcher | Client-side reactive router & modal triggers | `AppLayout.tsx` | N/A | ✅ **Connected** |

---

## 🔒 Security & Data Integrity Principles

1. **Strict User Tenant Isolation**: All endpoints verify `req.user._id` from the verified JWT payload. No client-supplied `userId` is trusted.
2. **Idempotent Daily Reviews**: `DailyReview` enforce unique composite indexing `(userId, date)` via `findOneAndUpdate` upserts to prevent duplicate day review submissions.
3. **Optimistic & Live State Synchronization**: When a mutation occurs (e.g., habit completion, goal update, event reschedule), global window events (`habits-updated`, `goals-updated`, `planner-updated`) broadcast state invalidation, triggering smooth UI refreshes without whole-page reloads.
4. **Zod & Mongoose Validations**: Every inbound payload is sanitized and validated on both the frontend and backend layers before database persistence.

# ⚒️ DailyForge — Complete API & Endpoint Audit

This audit documents every active REST endpoint across the DailyForge Express API, verifying route existence, authentication guards, business services, database entity persistence, and frontend consumers.

---

## 📡 Master API Routing Table

| HTTP Method | Route Endpoint | Authentication Guard | Controller & Service | Domain Model | Frontend Consumer Hook / Service | Lifecycle Verification |
|---|---|:---:|---|---|---|:---:|
| **POST** | `/api/v1/auth/request-otp` | Public | `authController.requestOtp`<br>`authService.requestOtp` | `EmailVerificationCode` | `authService.requestOtp` | ✅ **Verified** |
| **POST** | `/api/v1/auth/verify-otp` | Public | `authController.verifyOtp`<br>`authService.verifyOtp` | `User`, `EmailVerificationCode` | `authService.verifyOtp` | ✅ **Verified** |
| **GET** | `/api/v1/auth/me` | JWT Required | `authController.getMe` | `User` | `useAuthContext` | ✅ **Verified** |
| **GET** | `/api/v1/today` | JWT Required | `todayController.getTodayOverview`<br>`todayService.getTodayOverview` | `Habit`, `Task`, `DailyReview` | `todayService.getTodayOverview` | ✅ **Verified** |
| **POST** | `/api/v1/today/review` | JWT Required | `todayController.submitDailyReview`<br>`todayService.submitDailyReview` | `DailyReview`, `DailySnapshot` | `todayService.submitDailyReview` | ✅ **Verified** |
| **POST** | `/api/v1/today/reschedule` | JWT Required | `todayController.rescheduleItem`<br>`todayService.rescheduleItem` | `Task`, `CalendarEvent` | `todayService.rescheduleItem` | ✅ **Verified** |
| **POST** | `/api/v1/today/focus-session` | JWT Required | `todayController.logFocusSession`<br>`todayService.logFocusSession` | `FocusSession` | `todayService.logFocusSession` | ✅ **Verified** |
| **GET** | `/api/v1/habits` | JWT Required | `habitController.getHabits`<br>`habitService.getHabitsOverview` | `Habit`, `HabitCompletion` | `habitService.getHabits` | ✅ **Verified** |
| **POST** | `/api/v1/habits` | JWT Required | `habitController.createHabit`<br>`habitService.createHabit` | `Habit` | `habitService.createHabit` | ✅ **Verified** |
| **PATCH** | `/api/v1/habits/:id` | JWT Required | `habitController.updateHabit`<br>`habitService.updateHabit` | `Habit` | `habitService.updateHabit` | ✅ **Verified** |
| **DELETE** | `/api/v1/habits/:id` | JWT Required | `habitController.deleteHabit`<br>`habitService.deleteHabit` | `Habit`, `HabitCompletion`, `HabitMiss` | `habitService.deleteHabit` | ✅ **Verified** |
| **POST** | `/api/v1/habits/:id/complete` | JWT Required | `habitController.completeHabit`<br>`habitService.completeHabit` | `HabitCompletion`, `Habit` | `habitService.completeHabit` | ✅ **Verified** |
| **POST** | `/api/v1/habits/:id/uncomplete` | JWT Required | `habitController.uncompleteHabit`<br>`habitService.uncompleteHabit` | `HabitCompletion`, `Habit` | `habitService.uncompleteHabit` | ✅ **Verified** |
| **POST** | `/api/v1/habits/:id/miss` | JWT Required | `habitController.logHabitMiss`<br>`habitService.logHabitMiss` | `HabitMiss` | `analyticsService.logHabitMiss` | ✅ **Verified** |
| **GET** | `/api/v1/planner` | JWT Required | `plannerController.getPlanner`<br>`plannerService.getPlannerOverview` | `CalendarEvent`, `Habit`, `Task` | `plannerService.getPlannerOverview` | ✅ **Verified** |
| **POST** | `/api/v1/planner/events` | JWT Required | `plannerController.createEvent`<br>`plannerService.createEvent` | `CalendarEvent` | `plannerService.createEvent` | ✅ **Verified** |
| **PATCH** | `/api/v1/planner/events/:id` | JWT Required | `plannerController.updateEvent`<br>`plannerService.updateEvent` | `CalendarEvent` | `plannerService.updateEvent` | ✅ **Verified** |
| **DELETE** | `/api/v1/planner/events/:id` | JWT Required | `plannerController.deleteEvent`<br>`plannerService.deleteEvent` | `CalendarEvent` | `plannerService.deleteEvent` | ✅ **Verified** |
| **POST** | `/api/v1/planner/events/:id/complete` | JWT Required | `plannerController.completeEvent`<br>`plannerService.completeEvent` | `CalendarEvent`, `FocusSession` | `plannerService.completeEvent` | ✅ **Verified** |
| **GET** | `/api/v1/planner/auto-schedule/preview` | JWT Required | `plannerController.getAutoSchedulePreview`<br>`autoScheduleService.generatePreview` | `CalendarEvent`, `Habit` | `plannerService.getAutoSchedulePreview` | ✅ **Verified** |
| **POST** | `/api/v1/planner/auto-schedule/apply` | JWT Required | `plannerController.applyAutoSchedule`<br>`autoScheduleService.applySchedule` | `CalendarEvent` | `plannerService.applyAutoSchedule` | ✅ **Verified** |
| **GET** | `/api/v1/goals` | JWT Required | `goalController.getGoals`<br>`goalService.getGoalsOverview` | `Goal` | `goalService.getGoals` | ✅ **Verified** |
| **POST** | `/api/v1/goals` | JWT Required | `goalController.createGoal`<br>`goalService.createGoal` | `Goal` | `goalService.createGoal` | ✅ **Verified** |
| **PATCH** | `/api/v1/goals/:id` | JWT Required | `goalController.updateGoal`<br>`goalService.updateGoal` | `Goal` | `goalService.updateGoal` | ✅ **Verified** |
| **DELETE** | `/api/v1/goals/:id` | JWT Required | `goalController.deleteGoal`<br>`goalService.deleteGoal` | `Goal` | `goalService.deleteGoal` | ✅ **Verified** |
| **POST** | `/api/v1/goals/:id/milestones` | JWT Required | `goalController.addMilestone`<br>`goalService.addMilestone` | `Goal` | `goalService.addMilestone` | ✅ **Verified** |
| **POST** | `/api/v1/goals/:id/habits` | JWT Required | `goalController.linkHabit`<br>`goalService.linkHabit` | `Goal`, `Habit` | `goalService.linkHabit` | ✅ **Verified** |
| **GET** | `/api/v1/milestones/overview` | JWT Required | `milestoneController.getOverview`<br>`milestoneService.getMilestonesOverview` | `Achievement`, `UserAchievement` | `milestoneService.getOverview` | ✅ **Verified** |
| **POST** | `/api/v1/milestones/moments/:code/pin` | JWT Required | `milestoneController.togglePin`<br>`milestoneService.togglePinMoment` | `UserAchievement` | `milestoneService.togglePinMoment` | ✅ **Verified** |
| **GET** | `/api/v1/analytics/overview` | JWT Required | `analyticsController.getOverview`<br>`habitIntelligenceService.getAnalyticsOverview` | `DailySnapshot`, `HabitCompletion` | `analyticsService.getOverview` | ✅ **Verified** |
| **POST** | `/api/v1/analytics/energy` | JWT Required | `analyticsController.createEnergyLog`<br>`analyticsService.logEnergy` | `EnergyLog` | `analyticsService.logEnergy` | ✅ **Verified** |
| **GET** | `/api/v1/experiments` | JWT Required | `experimentController.getExperiments`<br>`experimentService.getExperiments` | `Experiment` | `experimentService.getExperiments` | ✅ **Verified** |
| **POST** | `/api/v1/experiments` | JWT Required | `experimentController.createExperiment`<br>`experimentService.createExperiment` | `Experiment` | `experimentService.createExperiment` | ✅ **Verified** |
| **POST** | `/api/v1/experiments/:id/apply` | JWT Required | `experimentController.applyResult`<br>`experimentService.applyResult` | `Experiment`, `Habit` | `experimentService.applyResult` | ✅ **Verified** |
| **GET** | `/api/v1/ai/insights/feed` | JWT Required | `aiController.getInsightFeed`<br>`aiService.getInsightFeed` | `AIInsight`, `Recommendation` | `aiFoundationService.getInsightFeed` | ✅ **Verified** |
| **POST** | `/api/v1/ai/coach/chat` | JWT Required | `aiController.chatWithCoach`<br>`ForgeAIOrchestrator.runWorkflow` | `AIMemory`, `AIUsage` | `aiFoundationService.sendCoachMessage` | ✅ **Verified** |
| **PATCH** | `/api/v1/profile` | JWT Required | `profileController.updateProfile`<br>`profileService.updateProfile` | `User` | `profileService.updateProfile` | ✅ **Verified** |

# ⚒️ DailyForge — Complete Feature & Functionality Inventory

## Architecture Overview

DailyForge is an enterprise-grade personal habit and execution operating system engineered on a decoupled full-stack architecture:

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite.
- **Backend**: Node.js, Express, MongoDB, Mongoose ORM, JSON Web Tokens (JWT), Timing-Safe HMAC-SHA256 OTP.
- **AI Architecture**: Grounded Personal Context Engine, Multi-Agent Fleet (Habit Coach, Planner Optimizer, Goal Strategist, Momentum Analyst, Recovery Coach, Progress Narrator, Experiment Scientist), Autonomous Safety Guardrails.

---

## 📊 Master Feature Inventory

| Module | Feature / User Capability | UI Layer | REST Endpoint | Backend Service | Domain Model | Auth Required | E2E Verified | Status |
|---|---|---|---|---|---|:---:|:---:|:---:|
| **Auth** | 6-Digit Email OTP Request | `LoginPage`, `OtpVerifyPage` | `POST /api/v1/auth/request-otp` | `auth.service.js` | `EmailVerificationCode` | ❌ No | ✅ Yes | **PASS** |
| **Auth** | OTP Verification & JWT Issuance | `OtpVerifyPage` | `POST /api/v1/auth/verify-otp` | `auth.service.js` | `User`, `EmailVerificationCode` | ❌ No | ✅ Yes | **PASS** |
| **Auth** | Current User Profile Session | `AppLayout`, `Header` | `GET /api/v1/auth/me` | `auth.service.js` | `User` | ✅ Yes | ✅ Yes | **PASS** |
| **Dashboard** | Real-Time Execution Cockpit | `DashboardOverview` | `GET /api/v1/dashboard/overview` | `today.service.js` | `Habit`, `Task`, `DailySnapshot` | ✅ Yes | ✅ Yes | **PASS** |
| **Today** | Daily Spark Context Greeting | `TodayDashboard` | `GET /api/v1/today` | `today.service.js`, `dailySpark.service.js` | `User`, `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Today** | Habit Routine Completion Toggle | `TodayDashboard`, Habit Card | `POST /api/v1/habits/:id/complete` | `habit.service.js` | `HabitCompletion`, `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Today** | Reschedule Item | `TodayDashboard` | `POST /api/v1/today/reschedule` | `today.service.js` | `Task`, `CalendarEvent` | ✅ Yes | ✅ Yes | **PASS** |
| **Today** | "End of Day Momentum Review" | `DailyReviewModal` | `POST /api/v1/today/review` | `today.service.js` | `DailyReview`, `DailySnapshot` | ✅ Yes | ✅ Yes | **PASS** |
| **Habits** | Create Habit Builder | `CreateHabitModal` | `POST /api/v1/habits` | `habit.service.js` | `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Habits** | Update Habit Schedule & Target | `HabitsPage` | `PATCH /api/v1/habits/:id` | `habit.service.js` | `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Habits** | Delete Habit with Confirmation | `DeleteHabitModal` | `DELETE /api/v1/habits/:id` | `habit.service.js` | `Habit`, `HabitCompletion` | ✅ Yes | ✅ Yes | **PASS** |
| **Habits** | Habit Diagnostic Friction Log | `MissReasonModal` | `POST /api/v1/habits/:id/miss` | `habit.service.js` | `HabitMiss` | ✅ Yes | ✅ Yes | **PASS** |
| **Planner** | Time Blocking Calendar Overview | `PlannerDashboard` | `GET /api/v1/planner` | `planner.service.js` | `CalendarEvent`, `Habit`, `Task` | ✅ Yes | ✅ Yes | **PASS** |
| **Planner** | Create Calendar Event | `EventModal` | `POST /api/v1/planner/events` | `planner.service.js` | `CalendarEvent` | ✅ Yes | ✅ Yes | **PASS** |
| **Planner** | Complete Scheduled Block | `EventDetailsModal` | `POST /api/v1/planner/events/:id/complete` | `planner.service.js` | `CalendarEvent`, `FocusSession` | ✅ Yes | ✅ Yes | **PASS** |
| **Planner** | AI Auto-Schedule Circadian Engine | `AutoScheduleModal` | `GET /api/v1/planner/auto-schedule/preview`<br>`POST /api/v1/planner/auto-schedule/apply` | `autoSchedule.service.js` | `CalendarEvent` | ✅ Yes | ✅ Yes | **PASS** |
| **Goals** | Create High-Impact Goal | `GoalModal` | `POST /api/v1/goals` | `goal.service.js` | `Goal` | ✅ Yes | ✅ Yes | **PASS** |
| **Goals** | Goal Milestone Tree & Weights | `GoalDetailPage` | `POST /api/v1/goals/:id/milestones` | `goal.service.js` | `Goal` | ✅ Yes | ✅ Yes | **PASS** |
| **Goals** | Link Habit to Goal Roadmap | `GoalDetailPage` | `POST /api/v1/goals/:id/habits` | `goal.service.js` | `Goal`, `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Milestones** | Achievement & Moment Showcase | `MilestonesDashboard` | `GET /api/v1/milestones/overview` | `milestone.service.js` | `Achievement`, `UserAchievement` | ✅ Yes | ✅ Yes | **PASS** |
| **Milestones** | Moment Detail & Showcase Pinning | `MomentDetailModal` | `POST /api/v1/milestones/moments/:code/pin` | `milestone.service.js` | `UserAchievement` | ✅ Yes | ✅ Yes | **PASS** |
| **Analytics** | 5-Pillar Forge Score Engine | `AnalyticsPage`, `ForgeScoreModal` | `GET /api/v1/analytics/overview` | `habitIntelligence.service.js` | `DailySnapshot`, `HabitCompletion` | ✅ Yes | ✅ Yes | **PASS** |
| **Analytics** | Daily Energy Check-in | `EnergyLogModal` | `POST /api/v1/analytics/energy` | `analytics.service.js` | `EnergyLog` | ✅ Yes | ✅ Yes | **PASS** |
| **Forge Lab** | Hypothesis Experiment Wizard | `ExperimentBuilderModal` | `POST /api/v1/experiments` | `experiment.service.js` | `Experiment` | ✅ Yes | ✅ Yes | **PASS** |
| **Forge Lab** | Experiment Verdict & 1-Click Apply | `ExperimentDetailModal` | `POST /api/v1/experiments/:id/apply` | `experiment.service.js` | `Experiment`, `Habit` | ✅ Yes | ✅ Yes | **PASS** |
| **Forge Insights** | Grounded Signal Feed & Telemetry | `EvidenceDrawerModal` | `GET /api/v1/ai/insights/feed` | `ai.service.js` | `AIInsight`, `Recommendation` | ✅ Yes | ✅ Yes | **PASS** |
| **AI Coach** | Multi-Agent Orchestrated Chat | `AICoachPage` | `POST /api/v1/ai/coach/chat` | `ForgeAIOrchestrator.js` | `AIMemory`, `AIUsage` | ✅ Yes | ✅ Yes | **PASS** |
| **Theme Studio** | Modular Token Customizer | `ThemeStudio` | Dynamic Token Injection | `ThemeContext.tsx`, `tokens.css` | LocalStorage + User Preferences | ✅ Yes | ✅ Yes | **PASS** |
| **Profile** | User Identity & Timezone Settings | `EditProfileModal` | `PATCH /api/v1/profile` | `profile.service.js` | `User` | ✅ Yes | ✅ Yes | **PASS** |

# 📋 DailyForge Master Test Cases & Specification

| ID | Domain | Test Title | Priority | Preconditions | Execution Steps | Expected Result | Automation Status |
|---|---|---|:---:|---|---|---|:---:|
| **TC-AUTH-001** | Auth | Request 6-digit OTP | P0 | Valid email format | Send `POST /api/v1/auth/request-otp` | 200 OK, OTP record created with hashed code & salt | ✅ Automated (`tests/otpAuth.test.js`) |
| **TC-AUTH-002** | Auth | Timing-Safe OTP Verification | P0 | Active OTP generated | Send `POST /api/v1/auth/verify-otp` with valid code | 200 OK, JWT token issued, user verified | ✅ Automated (`tests/otpAuth.test.js`) |
| **TC-AUTH-003** | Auth | Reject Expired / Invalid OTP | P0 | Expired or incorrect OTP | Send `POST /api/v1/auth/verify-otp` with invalid code | 400 Bad Request / 401 Unauthorized | ✅ Automated (`tests/otpAuth.test.js`) |
| **TC-HABIT-001** | Habits | Create Habit with Targets | P0 | Authenticated user | Send `POST /api/v1/habits` with frequency & target | 201 Created, habit stored with initial streaks | ✅ Automated (`tests/habits.test.js`) |
| **TC-HABIT-002** | Habits | Complete Habit Routine | P0 | Active habit exists | Send `POST /api/v1/habits/:id/complete` | 200 OK, streak incremented to 1, completion indexed | ✅ Automated (`run_e2e_verification.js`) |
| **TC-HABIT-003** | Habits | Log Miss Friction Diagnostic | P1 | Active habit exists | Send `POST /api/v1/habits/:id/miss` | 200 OK, friction categorized for AI analysis | ✅ Automated (`run_e2e_verification.js`) |
| **TC-GOAL-001** | Goals | Create High-Impact Goal | P0 | Authenticated user | Send `POST /api/v1/goals` | 201 Created, progress curve initialized | ✅ Automated (`tests/goals.test.js`) |
| **TC-GOAL-002** | Goals | Add Milestone & Weight | P1 | Goal exists | Send `POST /api/v1/goals/:id/milestones` | 201 Created, milestone tree updated | ✅ Automated (`run_e2e_verification.js`) |
| **TC-PLAN-001** | Planner | Schedule Time Block | P0 | Authenticated user | Send `POST /api/v1/planner/events` | 201 Created, calendar event indexed | ✅ Automated (`tests/planner.test.js`) |
| **TC-PLAN-002** | Planner | Complete Focus Session Block | P1 | Scheduled event exists | Send `POST /api/v1/planner/events/:id/complete` | 200 OK, FocusSession synced with quality score | ✅ Automated (`tests/planner.test.js`) |
| **TC-REV-001** | Today | Idempotent Daily Review | P0 | Authenticated user | Send `POST /api/v1/today/review` twice for same date | 201 Created, record updated with zero duplicates | ✅ Automated (`tests/dailyReview.test.js`) |
| **TC-SCORE-001**| Analytics | 5-Pillar Forge Score Calc | P0 | Execution records | Call `habitIntelligenceService.getAnalyticsOverview` | Deterministic score (0-1000) computed | ✅ Automated (`tests/behaviorMetrics.test.js`) |
| **TC-SEC-001** | Security | IDOR Goal Access Guard | P0 | User A & User B | User B attempts `DELETE /api/v1/goals/GOAL_A` | 404 Not Found / 403 Forbidden | ✅ Automated (`tests/security.test.js`) |
| **TC-AI-001** | AI | Intent Routing Dispatch | P1 | User prompt submitted | Pass query to `IntentRouter.route(prompt)` | Routed to specialized agent (e.g. HabitCoach) | ✅ Automated (`tests/aiOrchestrator.test.js`) |
| **TC-THEME-001**| Theme | Theme Studio Preference Sync | P2 | Authenticated user | Call `profileService.updateProfile` with theme | Preferences stored and reflected across workspace | ✅ Automated (`run_e2e_verification.js`) |

# 🌐 End-to-End Workflow Verification

DailyForge executes live multi-domain end-to-end testing against real database entities using [`backend/scripts/run_e2e_verification.js`](file:///Users/paru/paru/projects/DailyForge/backend/scripts/run_e2e_verification.js).

---

## 🔁 12-Domain Lifecycle Pipeline

1. **Cryptographic OTP Verification**: Generates 6-digit numeric OTP, computes random salt & HMAC-SHA256 hash, and verifies timing-safe comparison.
2. **Multi-Tenant User Isolation**: Creates User A and User B to test tenant boundaries.
3. **Habit Lifecycle**: Creates habit, completes routine for today, asserts streak recalculation to 1, logs friction miss reason, and verifies User B cannot mutate User A's habit.
4. **Task Lifecycle**: Creates task and completes it with timestamp tracking.
5. **Planner Events & Focus Sessions**: Creates calendar block, completes event, and verifies synchronization with FocusSession log.
6. **Goals & Milestone Roadmap**: Creates goal, appends milestone checkpoint, and links habit to goal roadmap.
7. **Today Cockpit & Idempotency**: Fetches Today overview, submits End of Day Review, and submits again to verify idempotency without creating duplicate records.
8. **Analytics Engine & 5-Pillar Score**: Submits energy check-in and calculates deterministic Forge Score (0–1000).
9. **Forge Lab Experiments**: Creates 14-day N-of-1 trial and verifies schedule intervention.
10. **Digital Collectibles & Moments**: Unlocks achievement medallion and pins to user profile showcase.
11. **Grounded AI Multi-Agent Engine**: Passes natural language query to `ForgeAIOrchestrator` and validates grounded response with telemetry context.
12. **Profile & Theme Persistence**: Updates profile bio, timezone, and custom theme preferences in MongoDB.

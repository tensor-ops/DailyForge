# 🗄️ Database Schemas & Domain Models

DailyForge contains 31 structured Mongoose models supporting the complete behavioral OS lifecycle.

---

## 📋 Primary Model Catalog

### 1. `User`
- **Fields**: `_id`, `email`, `passwordHash`, `name`, `username`, `bio`, `avatarUrl`, `timezone`, `language`, `membershipTier`, `isVerified`, `preferences` (Theme, Density, Sound, AI coaching style), `timestamps`.
- **Purpose**: Core user identity, authentication status, and personal workspace preferences.

### 2. `Habit`
- **Fields**: `userId`, `name`, `description`, `category`, `icon`, `color`, `trackingType` (`binary`, `numeric`, `duration`, `checklist`), `frequency` (`daily`, `specific_days`, `interval`, `custom`), `targetValue`, `unit`, `preferredTime`, `timeWindowStart`, `timeWindowEnd`, `reminderEnabled`, `reminderTime`, `difficulty`, `expectedFriction`, `currentStreak`, `longestStreak`, `totalCompletions`, `completionRate`, `isArchived`.
- **Purpose**: Atomic routine specifications, triggers, and execution targets.

### 3. `HabitCompletion`
- **Fields**: `userId`, `habitId`, `date` (`YYYY-MM-DD`), `completed` (Boolean), `completedAt`, `value`, `durationMinutes`, `notes`.
- **Compound Index**: `{ userId: 1, habitId: 1, date: 1 }` (Unique).
- **Purpose**: Immutable daily log of routine execution.

### 4. `DailyReview`
- **Fields**: `userId`, `date` (`YYYY-MM-DD`), `rating` (`great`, `good`, `okay`, `difficult`), `notes`, `completionPercentage`, `completedItems`, `totalItems`, `focusMinutes`, `forgeNote`.
- **Compound Index**: `{ userId: 1, date: 1 }` (Unique).
- **Purpose**: Idempotent End of Day Momentum reflection and AI summary storage.

### 5. `Goal`
- **Fields**: `userId`, `name`, `description`, `category`, `priority`, `targetType`, `currentValue`, `targetValue`, `unit`, `startDate`, `targetDate`, `status`, `progress`, `velocity`, `milestones` (Array of sub-milestones), `habits` (Linked habit IDs), `tasks` (Linked task IDs), `progressHistory`.
- **Purpose**: Long-term directional goals with hierarchical milestones and progress trajectories.

### 6. `CalendarEvent`
- **Fields**: `userId`, `title`, `description`, `type` (`DEEP_WORK`, `HABIT`, `TASK`, `MEETING`, `RECOVERY`, `FOCUS`), `date`, `startTime`, `endTime`, `startMinutes`, `endMinutes`, `durationMinutes`, `priority`, `category`, `status`, `goalId`, `habitId`, `taskId`.
- **Purpose**: Time-blocking calendar items and circadian auto-schedule proposals.

### 7. `Experiment`
- **Fields**: `userId`, `name`, `question`, `hypothesis`, `habitId`, `habitName`, `category`, `interventionType` (`SCHEDULE_TIME`, `REDUCE_FRICTION`, `MINIMUM_VIABLE`, `HABIT_STACK`, `ENVIRONMENT`, `FOCUS_BLOCK`), `durationDays`, `startDate`, `endDate`, `status` (`PLANNING`, `ACTIVE`, `COMPLETED`, `ABANDONED`), `observations`, `outcomeVerdict`.
- **Purpose**: N-of-1 behavioral hypothesis testing and schedule intervention trials.

### 8. `UserAchievement` / `Achievement`
- **Fields**: `code`, `title`, `description`, `category`, `tier`, `rarity`, `icon`, `threshold`, `metric`, `isMoment`, `userId`, `isUnlocked`, `unlockedAt`, `isPinned`.
- **Purpose**: Digital Collectibles, streak badges, and showcase pinnable tokens.

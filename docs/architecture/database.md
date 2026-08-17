# 🗄️ Database Architecture & Schemas

DailyForge persists state in **MongoDB** using structured **Mongoose ORM** schemas with strict validation, compound unique indexing, and automated cascading cleanup.

---

## 🏛️ Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ HABIT : owns
    USER ||--o{ GOAL : owns
    USER ||--o{ TASK : owns
    USER ||--o{ CALENDAR_EVENT : owns
    USER ||--o{ DAILY_REVIEW : records
    USER ||--o{ DAILY_SNAPSHOT : aggregates
    USER ||--o{ ENERGY_LOG : logs
    USER ||--o{ EXPERIMENT : launches
    USER ||--o{ USER_ACHIEVEMENT : earns
    USER ||--o{ AI_MEMORY : stores

    HABIT ||--o{ HABIT_COMPLETION : tracks
    HABIT ||--o{ HABIT_MISS : records
    GOAL ||--o{ MILESTONE : contains
    GOAL ||--o{ HABIT : connects
    GOAL ||--o{ TASK : connects
    ACHIEVEMENT ||--o{ USER_ACHIEVEMENT : awards
    EXPERIMENT ||--o{ HABIT : targets

    USER {
        ObjectId _id PK
        string email UK
        string name
        string username UK
        string timezone
        boolean isVerified
        object preferences
        timestamp createdAt
    }

    HABIT {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string category
        string trackingType
        string frequency
        number currentStreak
        number longestStreak
        number completionRate
    }

    HABIT_COMPLETION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId habitId FK
        string date
        boolean completed
        timestamp completedAt
    }

    DAILY_REVIEW {
        ObjectId _id PK
        ObjectId userId FK
        string date UK_compound
        string rating
        string notes
        number completionPercentage
        number focusMinutes
        string forgeNote
    }

    GOAL {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string category
        string priority
        number progress
        number velocity
        string status
        array milestones
    }
```

---

## 🔑 Critical Indexes

1. `DailyReview`: `{ userId: 1, date: 1 }` (Unique) — Enforces single idempotent daily review per user/day.
2. `HabitCompletion`: `{ userId: 1, habitId: 1, date: 1 }` (Unique) — Prevents duplicate day completions for a habit.
3. `EmailVerificationCode`: `{ email: 1, isUsed: 1, expiresAt: 1 }` — High-speed OTP lookup and expiration sweeps.
4. `DailySnapshot`: `{ userId: 1, date: 1 }` (Unique) — Fast historical analytics trend aggregation.

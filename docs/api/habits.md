# 🔄 Habits & Routines API

Comprehensive REST APIs for managing atomic daily routines, execution logs, streak calculation, and friction diagnostics.

---

## 1. List User Habits

- **Method**: `GET`
- **Path**: `/api/v1/habits`
- **Auth**: Bearer JWT Required

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "6a831e1681dcb4a142426f32",
        "name": "Deep System Architecture Study",
        "category": "Study",
        "trackingType": "duration",
        "targetValue": 45,
        "unit": "minutes",
        "preferredTime": "08:00 AM",
        "currentStreak": 18,
        "longestStreak": 24,
        "completionRate": 92,
        "completedToday": true
      }
    ],
    "summary": {
      "totalHabits": 8,
      "completedToday": 6,
      "overallConsistency": 87
    }
  }
}
```

---

## 2. Create Habit

- **Method**: `POST`
- **Path**: `/api/v1/habits`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "name": "Morning 5km Run",
  "category": "Fitness",
  "frequency": "daily",
  "trackingType": "duration",
  "targetValue": 30,
  "unit": "minutes",
  "preferredTime": "06:30 AM",
  "difficulty": "moderate"
}
```

---

## 3. Complete Habit for Today

- **Method**: `POST`
- **Path**: `/api/v1/habits/:id/complete`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "date": "2026-08-17",
  "notes": "Fast-paced morning run completed"
}
```

---

## 4. Log Habit Friction / Miss Reason

- **Method**: `POST`
- **Path**: `/api/v1/habits/:id/miss`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "date": "2026-08-17",
  "reason": "Low energy",
  "notes": "Late flight arrival night before"
}
```

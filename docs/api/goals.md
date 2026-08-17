# 🎯 Goals & Milestones API

APIs for building multi-tier ambition roadmaps, milestone checkpoint weights, habit links, and trajectory curves.

---

## 1. List Goals Overview

- **Method**: `GET`
- **Path**: `/api/v1/goals`
- **Auth**: Bearer JWT Required

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "6a831e1981dcb4a142426f81",
        "name": "Master Distributed Systems & DSA",
        "category": "Career",
        "priority": "critical",
        "progress": 68,
        "velocity": 8,
        "status": "ON_TRACK",
        "targetDate": "2026-11-30",
        "milestones": [
          { "id": "m1", "title": "Complete Raft consensus engine", "weight": 5, "status": "completed" },
          { "id": "m2", "title": "Solve 100 DP problems", "weight": 5, "status": "in_progress" }
        ]
      }
    ],
    "summary": {
      "activeGoals": 3,
      "averageProgress": 72,
      "onTrackCount": 3
    }
  }
}
```

---

## 2. Create Goal

- **Method**: `POST`
- **Path**: `/api/v1/goals`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "name": "Launch Production Habit OS",
  "description": "Deploy DailyForge to open-source community",
  "category": "Projects",
  "priority": "critical",
  "targetValue": 100,
  "unit": "%",
  "targetDate": "2026-09-30"
}
```

---

## 3. Add Milestone to Goal

- **Method**: `POST`
- **Path**: `/api/v1/goals/:id/milestones`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "title": "Pass 100% E2E automated test suite",
  "weight": 4,
  "dueDate": "2026-08-25"
}
```

---

## 4. Link Habit to Goal

- **Method**: `POST`
- **Path**: `/api/v1/goals/:id/habits`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "habitId": "6a831e1681dcb4a142426f32"
}
```

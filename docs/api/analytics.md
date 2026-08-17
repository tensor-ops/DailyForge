# 📊 Analytics & Forge Score API

APIs for calculating transparent behavioral scores, historical trend heatmaps, and subjective cognitive check-ins.

---

## 1. Get Analytics & 5-Pillar Score Overview

- **Method**: `GET`
- **Path**: `/api/v1/analytics/overview?range=30d`
- **Auth**: Bearer JWT Required

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "timeRange": "30d",
    "metrics": {
      "consistency": { "rate": 84, "changePts": 8.4 },
      "execution": { "rate": 88, "changePts": 6.2 },
      "reliability": { "rate": 81, "changePts": 4.5 },
      "forgeScore": { "value": 782, "changePts": 18 }
    },
    "forgeScoreBreakdown": {
      "consistencyPts": 210,
      "executionPts": 220,
      "reliabilityPts": 162,
      "momentumPts": 168,
      "recoveryPts": 82
    },
    "categoryPerformance": [
      { "category": "Study", "rate": 92, "count": 28 },
      { "category": "Fitness", "rate": 84, "count": 24 }
    ],
    "actionableInsight": {
      "title": "Evening Focus Advantage Detected",
      "description": "Evening routines achieve 91% completion (+23% higher than afternoon blocks)."
    }
  }
}
```

---

## 2. Daily Cognitive & Energy Check-in

- **Method**: `POST`
- **Path**: `/api/v1/analytics/energy`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "energy": 9,
  "focus": 8,
  "mood": "Optimal flow state after 8h sleep"
}
```

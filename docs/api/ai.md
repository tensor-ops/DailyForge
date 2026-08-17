# 🤖 AI Multi-Agent & Insights API

APIs for retrieving grounded telemetry observations and executing multi-agent coach workflows.

---

## 1. Get Forge Insights Telemetry Feed

- **Method**: `GET`
- **Path**: `/api/v1/ai/insights/feed`
- **Auth**: Bearer JWT Required

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "id": "ins-1",
        "title": "Evening Study Flow Window",
        "description": "Your 07:30 PM study sessions have a 92% completion rate over the last 30 days.",
        "category": "Study",
        "confidence": "STRONG_SIGNAL",
        "evidence": {
          "sampleSize": 28,
          "baseline": "69% (Afternoon)",
          "observed": "92% (Evening)"
        }
      }
    ]
  }
}
```

---

## 2. Multi-Agent Coach Chat

- **Method**: `POST`
- **Path**: `/api/v1/ai/coach/chat`
- **Auth**: Bearer JWT Required

### Request Body
```json
{
  "message": "How is my habit consistency and momentum looking today?"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "agent": "MOMENTUM_ANALYST",
    "reply": "Your current momentum is high (Score: 782/1000). You maintained an 18-day streak on Deep Architecture Study and completed 100% of today's commitments.",
    "proposedAction": null,
    "confidence": 0.95
  }
}
```

# 🔌 DailyForge API Documentation

DailyForge provides a comprehensive RESTful API for habit tracking, goal planning, calendar time-blocking, behavioral analytics, and AI multi-agent orchestration.

---

## 📑 Interactive Specifications & Endpoints

- 🔵 **Interactive Swagger UI**: [`http://localhost:5001/api-docs`](http://localhost:5001/api-docs)
- 🧾 **OpenAPI Specification**: [`/api-docs.json`](http://localhost:5001/api-docs.json)
- 🌐 **Default Local Base URL**: `http://localhost:5001/api/v1`

---

## 🔐 Standard Headers & Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 📡 API Domain References

1. [Authentication & Email OTP APIs](./authentication.md) — Request 6-digit OTP, verify HMAC code, get active profile.
2. [Habits & Routines APIs](./habits.md) — Routine management, daily toggle, miss friction logging.
3. [Goals & Milestones APIs](./goals.md) — Goal trees, milestone weight scoring, habit & task linking.
4. [Analytics & Forge Score APIs](./analytics.md) — 5-pillar behavioral scoring, cognitive energy logs.
5. [AI Multi-Agent APIs](./ai.md) — Telemetry insight feed, recommendation apply, multi-agent chat.

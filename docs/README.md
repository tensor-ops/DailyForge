# 📚 DailyForge Documentation Hub

Welcome to the central technical documentation and developer architecture guide for **DailyForge** — the personal habit, consistency, goal-setting, execution, analytics, and AI self-improvement operating system.

---

## 🧭 Navigation Index

### 🏗️ [Architecture Guides](./architecture/system.md)
- [System Architecture Overview](./architecture/system.md) — High-level architecture, end-to-end data flow, and runtime stack.
- [Frontend Architecture](./architecture/frontend.md) — React 18, TypeScript, design tokens, and modular state management.
- [Backend Architecture](./architecture/backend.md) — Express middleware, authentication lifecycle, business services, and security.
- [Database Architecture](./architecture/database.md) — MongoDB schemas, Mongoose models, indexes, and user-tenant isolation.

---

### 🔌 [API Documentation](./api/README.md)
- [API Overview & Swagger Specification](./api/README.md) — Interactive Swagger UI (`/api-docs`), headers, and error contracts.
- [Authentication & OTP APIs](./api/authentication.md) — 6-digit email OTP request, cryptographic HMAC verification, and JWT session handling.
- [Habit & Routine APIs](./api/habits.md) — Habit CRUD, daily toggles, friction miss logging, and streak recalculation.
- [Goal & Milestone APIs](./api/goals.md) — Multi-tier goal trees, milestone weighting, habit linking, and progress calculations.
- [Analytics & Forge Score APIs](./api/analytics.md) — 5-pillar behavioral score engine, daily capacity, and energy logs.
- [AI & Intelligence APIs](./api/ai.md) — Telemetry insight feed, contextual recommendation apply, and multi-agent coach chat.

---

### 🤖 [AI & Behavioral Intelligence](./ai/README.md)
- [AI Architecture Overview](./ai/README.md) — Grounded Personal Context Engine, safety guardrails, and telemetry observability.
- [Forge Insights Feed](./ai/insights.md) — Automated pattern detector, baseline comparison, and confidence scoring.
- [Multi-Agent AI Coach](./ai/coach.md) — Intent router, specialized agents (Habit Coach, Planner Optimizer, Momentum Analyst, Recovery Coach).
- [Recommendation Engine](./ai/recommendations.md) — Actionable schedule adjustments, circadian alignment, and 1-click execution.

---

### 🗄️ [Database Architecture](./database/schema.md)
- [Schema & Entity Relationships](./database/schema.md) — Complete 31 Mongoose domain models, relationships, and unique compound indexes.

---

### 🎨 Product & Design System
- [Design System & Theme Studio](../README.md#-design-system) — 10 curated presets, semantic token variables, and live preview cockpit.
- [Dialog Integration Matrix](./dialog-backend-matrix.md) — Audit of all 22 interaction dialogs and their full-stack lifecycles.
- [QA Full-Functionality Matrix](./full-functionality-matrix.md) — Master QA testing results across all domains.
- [Production Readiness Report](./production-readiness-report.md) — Lead QA verification sign-off.

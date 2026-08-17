# 🏗️ System Architecture Overview

DailyForge is engineered as a modern, decoupled full-stack personal operating system designed to convert long-term ambitions into sustainable daily execution.

---

## 🏛️ End-to-End Topology

```mermaid
flowchart TD
    subgraph Client["🖥️ Frontend (React 18 + Vite + TypeScript)"]
        UI[Modular Component System]
        ThemeEngine[Design Token & Theme Studio]
        StateSync[Event-Driven State Invalidation]
        APIClient[Axios REST Client with Interceptors]
    end

    subgraph Server["⚡ Backend (Node.js + Express API)"]
        Router[Express Routing Layer]
        AuthGuard[JWT & Timing-Safe Auth Middleware]
        ServiceLayer[Business Services Layer]
        AIOrchestrator[Multi-Agent AI Orchestrator]
    end

    subgraph Data["🗄️ Persistence Layer (MongoDB)"]
        DB[(MongoDB Database)]
        Models[31 Mongoose Domain Models]
    end

    subgraph External["🌐 External Integrations"]
        SMTP[Gmail SMTP / Resend Outgoing Mailer]
        LLM[Local / Cloud LLM Provider]
    end

    UI --> ThemeEngine
    UI --> StateSync
    UI --> APIClient
    APIClient -- "REST HTTPS (JSON)" --> Router
    Router --> AuthGuard
    AuthGuard --> ServiceLayer
    ServiceLayer --> AIOrchestrator
    ServiceLayer --> Models
    AIOrchestrator --> LLM
    ServiceLayer --> SMTP
    Models --> DB
```

---

## 🔄 Core Behavioral Feedback Loop

```mermaid
flowchart LR
    A[🎯 Goals] --> B[🔄 Habits]
    B --> C[⚡ Daily Execution]
    C --> D[📊 Behavior Data]
    D --> E[📈 Analytics]
    E --> F[🔥 Momentum]
    F --> G[🤖 AI Insights]
    G --> H[🎯 Better Routines]
    H --> B
```

---

## 🛡️ Key Architectural Invariants

1. **Strict User Tenant Isolation**: All database queries strictly filter by authenticated `req.user._id` decoded from verified JWT tokens. Client-provided user identifiers are never trusted.
2. **Deterministic Fallbacks**: All analytics, momentum calculations, and Forge Scores evaluate deterministic baseline mathematical models when AI services are unavailable or rate-limited.
3. **Idempotent Day Reviews**: `(userId, date)` composite unique indexing ensures daily reviews and snapshots can be updated without creating duplicate entries.
4. **Token-Driven UI Consistency**: 100% of UI elements derive visual properties from centralized CSS Custom Properties injected by `ThemeContext`.

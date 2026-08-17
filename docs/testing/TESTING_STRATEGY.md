# 🧪 DailyForge Automated Testing Strategy

## 🏛️ The Testing Pyramid

DailyForge implements a comprehensive, multi-tiered testing strategy ensuring high test velocity, deterministic execution, and real user verification.

```text
                       [ E2E Workflows ]
                     12 Core Domain Tests
                  ───────────────────────────
                  [ API & Service Integration ]
                   CRUD, Lifecycle & Business
               ───────────────────────────────────
               [ Security, IDOR & Multi-Tenant ]
                 Timing-Safe HMAC & Tenant Isolation
            ─────────────────────────────────────────
            [ Pure Unit & Deterministic Metrics ]
              Streaks, 5-Pillar Score, Pure Computations
         ─────────────────────────────────────────────────
         [ Static Analysis, Type Safety & Production Build ]
           TypeScript Strict Mode, Vite Bundle Validation
```

---

## 🔬 Testing Layers

### 1. Static Analysis & Type Checking
- **Engine**: TypeScript 5 (`npx tsc --noEmit`)
- **Scope**: Entire frontend React codebase, API types, DTO contracts, React component props.
- **Guarantee**: Zero type regressions or invalid interface property accesses.

### 2. Pure Unit & Business Logic Tests
- **Engine**: Jest
- **Scope**: Streak calculations, streak resets, Forge Score 5-pillar weights, personal identity badge formulas, date manipulation utilities.
- **Guarantee**: 100% deterministic arithmetic behavior across normal, boundary, and zero-state inputs.

### 3. Domain Service & API Integration Tests
- **Engine**: Jest + Supertest
- **Scope**: Habits, Goals, Planner Calendar Events, Tasks, Today Cockpit, Idempotent Daily Reviews.
- **Guarantee**: Correct HTTP status codes, payload validation, database mutation effects, and error reporting.

### 4. Authentication & Cryptographic OTP Tests
- **Engine**: Jest + Node.js Native Crypto
- **Scope**: 6-digit numeric OTP generation, random 16-byte salt creation, timing-safe HMAC-SHA256 comparison, brute-force rate limiting.
- **Guarantee**: Resilient to timing side-channel attacks and unauthorized access.

### 5. Security & Multi-Tenant IDOR Tests
- **Engine**: Jest + Supertest
- **Scope**: Cross-tenant isolation verification across Goals, Habits, Events, and Tasks.
- **Guarantee**: User A cannot view, modify, or delete User B's resources (enforces 401/403/404).

### 6. Grounded AI Multi-Agent Orchestrator Tests
- **Engine**: Jest
- **Scope**: IntentRouter routing accuracy, Grounded Context retrieval, and agent safety guardrails.
- **Guarantee**: AI responses strictly reflect computed user data without hallucinations or unhandled timeouts.

### 7. Comprehensive 12-Domain End-to-End Verification
- **Engine**: Dedicated Node.js E2E Verification Engine (`run_e2e_verification.js`)
- **Scope**: Live MongoDB persistence across all 12 core domains.
- **Guarantee**: Real mutations persist in database and sync across dependent domain metrics.

### 8. Production Bundle & Packaging Validation
- **Engine**: Vite 5
- **Scope**: Production code splitting, minification, CSS variable injection, and packaging.
- **Guarantee**: Verified clean production artifact ready for deployment.

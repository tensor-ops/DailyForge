# ⚡ Backend Architecture

The DailyForge backend is a modular **Node.js + Express** REST API service designed for high throughput, strict multi-tenant isolation, and resilient behavioral intelligence.

---

## 🏛️ Layered Service Architecture

```text
HTTP Request
     ↓
Express Middleware (CORS, Helmet, Rate Limiter, Request Logger)
     ↓
Authentication Middleware (Timing-Safe HMAC-SHA256 & JWT Verification)
     ↓
Domain Controllers (Request Parsing, Input Sanitization, Response Formatting)
     ↓
Business Service Layer (HabitEngine, GoalTree, AnalyticsService, AIOrchestrator)
     ↓
Mongoose Data Layer (31 Domain Models, Compound Unique Indexes, Schema Validation)
     ↓
MongoDB Database
```

---

## 🔐 Cryptographic Authentication & Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant AuthAPI as /api/v1/auth
    participant OTPService as Cryptographic OTP Engine
    participant DB as MongoDB
    participant Mailer as Outgoing SMTP Mailer

    User->>Frontend: Enter Email Address
    Frontend->>AuthAPI: POST /request-otp { email }
    AuthAPI->>OTPService: Generate 6-digit numeric OTP (100000..999999)
    OTPService->>OTPService: Generate 16-byte Salt & Compute HMAC-SHA256(OTP, Salt, Pepper)
    AuthAPI->>DB: Upsert EmailVerificationCode { email, hashedCode, salt, expiresAt: +10m }
    AuthAPI->>Mailer: Send Branded HTML OTP Verification Email
    AuthAPI-->>Frontend: 200 OK { message: "OTP sent successfully" }

    User->>Frontend: Enter 6-digit OTP received in Gmail
    Frontend->>AuthAPI: POST /verify-otp { email, code }
    AuthAPI->>DB: Query active EmailVerificationCode
    AuthAPI->>OTPService: verifyOtpHash(code, storedHash, salt) via crypto.timingSafeEqual()
    AuthAPI->>DB: Find or Create User & mark isVerified: true
    AuthAPI->>DB: Mark EmailVerificationCode as consumed
    AuthAPI-->>Frontend: 200 OK { token: JWT, user: UserProfile }
    Frontend->>Frontend: Save JWT in localStorage & AuthContext
```

---

## 🛡️ Tenant Security Principles

- Every protected route is shielded by `authenticate` middleware.
- Handlers extract `req.user._id` from the decoded JWT payload.
- All MongoDB queries apply `{ userId: req.user._id }` constraints.
- Unauthenticated or cross-tenant modification requests fail immediately with `401 Unauthorized` or `403 Forbidden`.

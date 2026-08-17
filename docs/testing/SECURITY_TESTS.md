# 🔐 Security, IDOR & Authorization Testing

DailyForge tests security at the cryptographic, authentication, and database isolation levels.

---

## 🛡️ Key Security Tests Executed

### 1. Cryptographic OTP Verification
- **Test File**: `backend/tests/otpAuth.test.js`
- **Method**: Timing-safe HMAC-SHA256 comparison via `crypto.timingSafeEqual()`.
- **Protection**: Mitigates timing side-channel attacks by ensuring verification executes in constant time regardless of where character mismatches occur.

### 2. Insecure Direct Object Reference (IDOR) Hardening
- **Test File**: `backend/tests/security.test.js` & `backend/tests/userIsolation.test.js`
- **Scenario**: User B attempts `DELETE /api/v1/goals/:id` or `PATCH /api/v1/habits/:id` for resources created by User A.
- **Result**: Query filter strictly requires `{ _id: resourceId, userId: req.user._id }`, returning `404 Not Found` or `403 Forbidden`.

### 3. NoSQL Injection Prevention
- **Test File**: `backend/tests/security.test.js`
- **Scenario**: Malformed object payloads (e.g. `email: { $gt: '' }`) injected into authentication endpoints.
- **Result**: Validated and sanitized via Zod/Mongoose schema typing, returning `400 Bad Request`.

### 4. Unauthenticated Access Barrier
- **Test File**: `backend/tests/security.test.js`
- **Scenario**: Calls to protected endpoints (`/api/v1/habits`, `/api/v1/goals`, `/api/v1/planner`) without Bearer tokens.
- **Result**: Immediately rejected with `401 Unauthorized`.

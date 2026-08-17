# 🔐 Security Policy

## 🛡️ Supported Versions

| Version | Supported |
|---|:---:|
| `v1.0.x` | ✅ Supported |

---

## 🔒 Security Architecture Highlights

1. **Timing-Safe Cryptographic OTPs**: OTP verification uses `crypto.timingSafeEqual` over HMAC-SHA256 hashes with random salts and server-side secret peppers to prevent timing side-channel attacks.
2. **Strict Multi-Tenant Isolation**: All mutations and queries require JWT authentication and strictly filter on verified `userId = req.user._id`.
3. **No Secret Leakage**: API tokens, OTP codes, and SMTP credentials are never logged to console or returned in user-facing JSON payloads.
4. **Input Sanitization & Validation**: Inputs are validated against strict Mongoose and Zod schema constraints to eliminate injection vulnerabilities.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within DailyForge, please send an email to `security@dailyforge.test` rather than opening a public issue. We will review and patch vulnerabilities within 48 hours.

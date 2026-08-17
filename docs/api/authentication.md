# 🔐 Authentication & OTP APIs

DailyForge implements passwordless 6-digit Email OTP authentication powered by timing-safe HMAC-SHA256 hashing.

---

## 1. Request Verification OTP

Generates a secure 6-digit numeric OTP and sends a branded verification email.

- **Method**: `POST`
- **Path**: `/api/v1/auth/request-otp`
- **Auth**: None (Public)

### Request Body
```json
{
  "email": "developer@dailyforge.test"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "data": {
    "email": "developer@dailyforge.test",
    "expiresInSeconds": 600
  }
}
```

---

## 2. Verify OTP & Authenticate

Validates the user-entered 6-digit OTP using timing-safe comparisons and issues a JWT token.

- **Method**: `POST`
- **Path**: `/api/v1/auth/verify-otp`
- **Auth**: None (Public)

### Request Body
```json
{
  "email": "developer@dailyforge.test",
  "code": "847291"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Authenticated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6a831e1481dcb4a142426f0e",
      "email": "developer@dailyforge.test",
      "name": "Developer",
      "username": "developer",
      "timezone": "Asia/Kolkata",
      "isVerified": true
    }
  }
}
```

---

## 3. Get Current User Session

Retrieves the authenticated user's profile and active preferences.

- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth**: Bearer JWT Required

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6a831e1481dcb4a142426f0e",
      "email": "developer@dailyforge.test",
      "name": "Developer",
      "username": "developer",
      "timezone": "Asia/Kolkata",
      "membershipTier": "pro"
    }
  }
}
```

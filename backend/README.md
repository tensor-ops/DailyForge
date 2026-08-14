# AI Habit Tracker — Backend Engine

Enterprise Node.js, Express, MongoDB (Mongoose), JWT, Zod, and AI abstraction layer backend service for the AI Habit Tracker platform.

## 🚀 Key Architectural Pillars

- **Modular Clean Architecture**: Separated into Config, Models, Middleware, Validators, Services, Controllers, and Routes.
- **Robust Security**: Helmet security headers, CORS protection, JWT Bearer authentication, bcryptjs password hashing, and Zod request validation.
- **Streak & Analytics Engine**: Timezone-aware streak tracking (`currentStreak`, `longestStreak`, `totalCompletions`, `completionRate`) and deterministic consistency scoring.
- **AI Service Abstraction**: Flexible AI provider adapter supporting OpenAI, Gemini, or smart fallback mock analysis.
- **API Documentation**: Interactive Swagger OpenAPI 3.0 documentation served at `/api/docs`.

---

## 🛠️ Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your MongoDB database URI:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-habit-tracker
```

---

## 🏃 Running the Backend

```bash
# Install dependencies
npm install

# Start local development server (with nodemon)
npm run dev

# Run automated tests
npm test

# Seed database with realistic demo data
npm run seed
```

---

## 📚 API Endpoints Summary

- **Health Check**: `GET /health`
- **Swagger Documentation**: `GET /api/docs`
- **Authentication**:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`
- **Profile**:
  - `GET /api/v1/users/me`
  - `PATCH /api/v1/users/me`
- **Habits**:
  - `GET /api/v1/habits`
  - `POST /api/v1/habits`
  - `GET /api/v1/habits/:id`
  - `PATCH /api/v1/habits/:id`
  - `DELETE /api/v1/habits/:id`
  - `POST /api/v1/habits/:habitId/complete`
  - `DELETE /api/v1/habits/:habitId/complete/:date`
- **Analytics**:
  - `GET /api/v1/analytics/overview`
  - `GET /api/v1/analytics/completion-trend`
  - `GET /api/v1/analytics/category-performance`
  - `GET /api/v1/analytics/consistency`
- **AI Service**:
  - `GET /api/v1/ai/insights`
  - `POST /api/v1/ai/insights/generate`
  - `GET /api/v1/ai/recommendations`
  - `POST /api/v1/ai/chat`
  - `GET /api/v1/ai/conversations`

# 🤝 Contributing to DailyForge

Thank you for your interest in contributing to **DailyForge**! We welcome contributions from engineers, designers, and open-source enthusiasts.

---

## 🛠️ Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dailyforge/dailyforge.git
   cd DailyForge
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Verify Tests & Static Types**:
   ```bash
   # Backend Jest test suite
   cd backend && npm test

   # Frontend TypeScript checks
   cd ../frontend && npx tsc --noEmit
   ```

---

## 🌿 Git & Branching Guidelines

- **Branch Naming**:
  - `feat/feature-name` for new capabilities.
  - `fix/bug-description` for bug fixes.
  - `docs/documentation-update` for documentation changes.
- **Commit Messages**: Follow Conventional Commits format (`feat: add energy check-in modal`, `fix: enforce unique daily review index`).

---

## 📜 Pull Request Standards

- Ensure all automated unit and E2E integration test suites pass (`npm test`).
- Ensure frontend TypeScript builds without warnings (`npx tsc --noEmit`).
- Document new endpoints in both code and [`docs/api/`](./docs/api/).

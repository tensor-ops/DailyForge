# 📖 DailyForge Testing Guide

This guide provides step-by-step instructions for running, writing, and debugging automated tests in DailyForge.

---

## 🚀 One-Command Master Execution

To run the complete automated test suite across all 8 tiers of the testing pyramid:

```bash
npm run test:all
```

---

## 🎯 Targeted Test Commands

| Scope | Command | Description |
|---|---|---|
| **Everything** | `npm run test:all` | Executes full 8-phase test orchestrator. |
| **All Backend Jest** | `npm test` | Runs all 13 backend Jest test suites. |
| **Unit Tests Only** | `npm run test:unit` | Tests pure business logic, streak arithmetic & metrics. |
| **API Integration** | `npm run test:api` | Tests Habits, Goals, Planner & Review REST endpoints. |
| **Security & IDOR** | `npm run test:security` | Tests tenant isolation, timing safety & auth guards. |
| **Live Database E2E**| `npm run test:e2e` | Runs comprehensive 12-domain live DB workflow tests. |
| **TypeScript Checks**| `npm run typecheck` | Validates strict TypeScript compilation in frontend. |
| **Production Build** | `npm run build` | Compiles and verifies production bundle output. |

---

## 🛠️ Adding New Tests

1. **Unit / Integration Tests**: Place new `.test.js` files inside `backend/tests/`.
2. **E2E Lifecycle Tests**: Add assertions to `backend/scripts/run_e2e_verification.js`.
3. **Mocking Standards**: Use `jest.mock()` for database models during unit/integration tests to ensure test isolation and high execution speed.

# HABITI — AI Habit Tracker (Frontend Architecture)

A personal habit intelligence and behavioral consistency platform built with React, Vite, TypeScript, and Tailwind CSS.

## 🚀 Key Architectural Pillars

- **Design System & Semantic Tokens**: Tailored light & dark themes, custom CSS variables (`--color-primary`, `--color-ai`, `--color-card`, etc.), sleek glassmorphism, and responsive typography.
- **Application Shell (`AppLayout`)**: Collapsible desktop sidebar, top header bar with quick search (`⌘K`), theme switcher, and mobile drawer/bottom bar navigation.
- **UI Primitives Suite**: Reusable components (`Button`, `Card`, `Input`, `Badge`, `Modal`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `Dropdown`, `Avatar`, `Switch`).
- **Feature-Oriented Modular Structure**:
  - `src/features/landing`: SaaS hero with interactive live preview
  - `src/features/dashboard`: Today's momentum, KPI stats, today's checklist, AI pattern banner
  - `src/features/habits`: Categorized habit manager with search, filter pills, deletion modal
  - `src/features/analytics`: Performance breakdowns, consistency scores, 7d/30d/90d ranges
  - `src/features/ai`: AI Habit Coach assistant and interactive conversational interface
  - `src/features/profile`: Identity, streaks, and milestone achievements
  - `src/features/settings`: Theme customization, notification toggles, demo reset
- **API & Mock Layer Abstraction**: Centralized Axios instance with JWT interceptor support and localStorage-backed mock services.

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle & TypeScript check
npm run build
```
# DailyForge
# DailyForge
# DailyForge

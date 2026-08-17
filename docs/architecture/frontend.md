# 🖥️ Frontend Architecture

The DailyForge frontend is a high-performance Single Page Application (SPA) built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 📂 Feature-Driven Module Structure

```text
frontend/src/
├── components/
│   ├── brand/          # Reusable brand marks and themed SVGs
│   ├── dialogs/        # Master Dialog design system (Dialog, Header, Tabs, Footer)
│   ├── layout/         # AppLayout, Sidebar, Header, Navigation
│   └── ui/             # Atomic primitives (Button, Card, Input, Avatar, Badges)
├── context/
│   ├── AuthContext.tsx # JWT session lifecycle and profile caching
│   └── ThemeContext.tsx# Design tokens, live preview sync, and JSON export/import
├── features/
│   ├── ai/             # AI Coach and Forge Insights feed
│   ├── analytics/      # 5-Pillar Forge Score and habit analytics charts
│   ├── dashboard/      # Overview cockpit and Today execution views
│   ├── forge-lab/      # N-of-1 Behavioral Experiment builder & detail modals
│   ├── goals/          # High-Impact Goal roadmaps & milestone trees
│   ├── habits/         # Routine builder, frequency editor, and friction logs
│   ├── milestones/     # Achievement badges and Digital Collectible Moments
│   ├── planner/        # 24h Time-blocking calendar & auto-schedule optimizer
│   ├── profile/        # Identity badge, bio, and timezone configuration
│   └── settings/       # Theme Studio tabs, density, radii, and custom presets
├── services/           # Typed Axios REST API abstraction layer
├── styles/
│   ├── index.css       # Core Tailwind imports and base layers
│   └── tokens.css      # CSS Custom Properties for theme tokens
└── types/              # Domain TypeScript interfaces and request/response models
```

---

## 🎨 Token-Based Theme Engine

All colors, radii, shadows, and spacing are controlled via semantic CSS Custom Properties configured at the `:root` level.

When a user switches presets or changes accent colors:
1. `ThemeContext` updates the runtime `ThemeConfig` state.
2. Injects semantic utility classes (`.dark`, `.theme-focus-blue`, `.radius-rounded`, `.density-comfortable`) directly onto `document.documentElement`.
3. Injects custom hex variables (`--color-primary`, `--color-accent`, `--color-ring`) dynamically.
4. Updates are broadcast across the live preview area and the entire application instantly without page reloads.

---

## ⚡ React Portal Dialog Architecture

To prevent CSS stacking context trapping (where parent `transform` or `filter` properties constrain `position: fixed` modals to off-screen positions), all application modals and dialogs are mounted via `createPortal(dialogContent, document.body)` with `z-[999]` isolation.

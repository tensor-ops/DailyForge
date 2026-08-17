# 💡 Forge Insights Engine

The Forge Insights engine operates as an autonomous background telemetry analyzer that detects actionable patterns in user habits, timings, energy levels, and goal velocity.

---

## 🔍 Signal Detection Classifications

1. **Circadian Time Windows**: Detects time-of-day execution discrepancies (e.g. 91% consistency in the evening vs 68% in the afternoon).
2. **Friction Hotspots**: Identifies routines frequently skipped due to specific recorded reasons (`Low Energy`, `Wrong Time`).
3. **Streak Risk Predictor**: Flags routines with degrading completion cadence before streaks break.
4. **Goal Velocity Drift**: Computes deviation between actual pacing and expected completion deadline trajectories.

---

## 🔬 Evidence Confidence Levels

Every insight generated provides transparent telemetry evidence:

| Confidence Level | Sample Size Threshold | Description |
|---|:---:|---|
| `EMERGING_SIGNAL` | 3–7 logs | Early pattern detected across recent days. |
| `MODERATE_SIGNAL` | 8–14 logs | Statistically relevant pattern across multiple weeks. |
| `STRONG_SIGNAL` | 15+ logs | High-confidence behavioral habit pattern. |
| `EXPERIMENT_SUPPORTED` | N-of-1 trial data | Verified through a Forge Lab scientific trial. |

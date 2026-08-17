# 🤖 DailyForge AI Architecture

DailyForge implements a **Grounded Personal Context Architecture** paired with a specialized **Multi-Agent Fleet** to provide deterministic, actionable behavioral guidance without hallucination.

---

## 🏛️ AI Context Pipeline

```mermaid
flowchart TD
    User([User Query / Event]) --> Router[Intent Router]
    Router --> ContextEngine[Personal Context Engine]
    
    subgraph DataContext["Grounded Telemetry"]
        Habits[(Active Habits & Streaks)]
        Logs[(Execution & Miss Logs)]
        Goals[(Active Goals & Deadlines)]
        Energy[(Cognitive Energy Logs)]
        Memories[(Long-Term AI Memory)]
    end
    
    Habits --> ContextEngine
    Logs --> ContextEngine
    Goals --> ContextEngine
    Energy --> ContextEngine
    Memories --> ContextEngine
    
    ContextEngine --> AgentFleet{Specialized Agent Dispatcher}
    AgentFleet -->|Habit Stacking| HC[Habit Coach]
    AgentFleet -->|Circadian Scheduling| PO[Planner Optimizer]
    AgentFleet -->|Milestone Planning| GS[Goal Strategist]
    AgentFleet -->|Burnout & Recovery| RC[Recovery Coach]
    AgentFleet -->|N-of-1 Trials| ES[Experiment Scientist]
    AgentFleet -->|Trajectory Analysis| MA[Momentum Analyst]
    
    HC --> Guardrails[Safety & Action Guardrails]
    PO --> Guardrails
    GS --> Guardrails
    RC --> Guardrails
    ES --> Guardrails
    MA --> Guardrails
    
    Guardrails --> Output([Validated Insight / Action Proposal])
```

---

## 🛡️ Key Safety Invariants

1. **Zero Hallucination Grounding**: Prompts are populated with computed metrics (Forge Score, Completion %, Sample Sizes) rather than asking LLMs to guess progress.
2. **Action Proposal Validation**: Any tool proposal (e.g. rescheduling a time block) must be validated against `AISafetyService` before presentation.
3. **Deterministic Fallbacks**: If the external AI service is unreachable, the rule-based heuristics engine handles all insights gracefully.

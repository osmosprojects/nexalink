# Frontend Card: KPI Stat Cards

## 1. Overview
The KPI Stat Cards are the primary executive metrics displayed prominently at the top of the **Dashboard Page** (`frontend/src/pages/DashboardPage.tsx`). They summarize the user's networking velocity, active relationship health, urgent follow-up tasks, and overall progress towards configured networking goals.

---

## 2. Visual & Structural Specifications

```text
+-------------------+ +-------------------+ +-------------------+ +-------------------+
| Connections       | | Active Rel.       | | Follow-ups Due    | | Networking Goals  |
| 128               | | 42                | | 5                 | | 68%               |
| [Users Icon]      | | [HeartHandshake]  | | [Clock Icon]      | | [Target Icon]     |
| In your network   | | Recent touchpoints| | Timely responses  | | [Progress Bar]    |
+-------------------+ +-------------------+ +-------------------+ +-------------------+
```

- **Grid Breakpoints:**
  - Mobile (`<640px`): `grid-cols-2` with `gap-3.5`
  - Desktop (`>=1024px`): `grid-cols-4` with `gap-5`
- **Border & Surfaces:** `bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card`
- **Hover Transitions:** `hover:shadow-soft transition-all cursor-pointer group`
- **Click Routing:**
  - Connections card $\rightarrow$ `/connections`
  - Active Relationships card $\rightarrow$ `/connections`
  - Follow-ups Due card $\rightarrow$ `/tasks`
  - Networking Goals card $\rightarrow$ `/goals`

---

## 3. Data Schema & Types

```typescript
export interface DashboardStats {
  total_contacts: number;
  active_relationships: number;
  follow_ups_due: number;
  total_goals: number;
  completed_goals: number;
  goal_completion_rate: number;
  total_interactions: number;
  upcoming_meetings: number;
}
```

---

## 4. Component Code Implementation

```tsx
{/* 4 KPI Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
  {/* 1. Connections */}
  <div 
    onClick={() => navigate('/connections')}
    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-brand-300 transition-all cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500">Connections</span>
      <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
        <Users className="w-4 h-4" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
      {stats.total_contacts}
    </div>
    <p className="text-[11px] text-slate-400 mt-1 font-medium">In your network</p>
  </div>

  {/* 2. Active Relationships */}
  <div 
    onClick={() => navigate('/connections')}
    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-purple-300 transition-all cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500">Active Relationships</span>
      <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
        <HeartHandshake className="w-4 h-4" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
      {stats.active_relationships}
    </div>
    <p className="text-[11px] text-slate-400 mt-1 font-medium">Recent touchpoints</p>
  </div>

  {/* 3. Follow-ups Due */}
  <div 
    onClick={() => navigate('/tasks')}
    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-amber-300 transition-all cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500">Follow-ups Due</span>
      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
        <Clock className="w-4 h-4" />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {stats.follow_ups_due}
      </div>
      {stats.follow_ups_due > 0 && (
        <span className="text-xs font-semibold text-amber-600 flex items-center">
          Urgent
        </span>
      )}
    </div>
    <p className="text-[11px] text-slate-400 mt-1 font-medium">Timely responses</p>
  </div>

  {/* 4. Networking Goals */}
  <div 
    onClick={() => navigate('/goals')}
    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-500">Networking Goals</span>
      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
        <Target className="w-4 h-4" />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {stats.goal_completion_rate}%
      </div>
      <span className="text-xs text-slate-400 font-medium">done</span>
    </div>
    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
      <div 
        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, stats.goal_completion_rate)}%` }}
      />
    </div>
  </div>
</div>
```

---

## 5. Logic & State Flow

1. **Server-Side Computation:**
   - Populated via `GET /api/dashboard`, which calls `AnalyticsRepository.getDashboardStats(userId)`.
   - `total_contacts`: Total row count in `contacts` table scoped to `user_id`.
   - `active_relationships`: Count of contacts with `last_interaction_at >= NOW() - 30 DAYS`.
   - `follow_ups_due`: Count of contacts with `next_follow_up_at <= NOW()`.
   - `goal_completion_rate`: Mathematical average of `(current_value / target_value) * 100` across all active goals.
2. **TanStack Query Invalidation:**
   - Query Key: `['dashboard']`.
   - Invalidated upon: Contact creation/update, interaction logging, task completion, and goal milestone logging.

# Frontend Card: Goal Progress Cards

## 1. Overview
The **Goal Progress Card** is displayed on the **Networking Goals Page** (`frontend/src/pages/GoalsPage.tsx`) and the Dashboard widget. It allows users to set, track, and accomplish quantitative networking milestones (e.g., "Connect with 10 Enterprise SaaS CTOs", "Conduct 5 Coffee Chats/Month").

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Target Icon] Connect with 10 SaaS Founders    [Active]     |
| Category: Partnerships | Due: Dec 31, 2026                  |
|-------------------------------------------------------------|
| Progress: 7 / 10 contacts                                   |
| [======================================............] 70%    |
|-------------------------------------------------------------|
| Recent Milestone: "Met with Sarah from CloudScale"          |
|-------------------------------------------------------------|
| [+ Log Progress (+1)]   [View Milestones]   [Edit Goal]     |
+-------------------------------------------------------------+
```

- **Visual Elements:**
  - Progress gauge bar with active percentage fill.
  - Category pill (`Partnerships`, `Fundraising`, `Hiring`, `Mentorship`, `Sales`).
  - 1-Click quick increment button (`+1 Progress`).

---

## 3. Data Schema & Types

```typescript
export interface GoalMilestone {
  progress_id: number;
  goal_id: number;
  progress_date: string;
  progress_value: number;
  notes: string | null;
  created_at: string;
}

export interface Goal {
  goal_id: number;
  user_id: number;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string; // e.g. "people", "meetings", "calls"
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  recent_progress?: GoalMilestone[];
}
```

---

## 4. Component Code Implementation

```tsx
{/* Goal Progress Card */}
<div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card hover:shadow-soft transition-all space-y-4">
  {/* Header */}
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
          {goal.goal_type}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          goal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'
        }`}>
          {goal.status}
        </span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mt-2">{goal.title}</h3>
      {goal.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{goal.description}</p>
      )}
    </div>

    {/* Circular or Pill Percentage */}
    <div className="text-right">
      <div className="text-lg font-black text-slate-900">
        {goal.progress_percentage || 0}%
      </div>
      <div className="text-[10px] text-slate-400 font-medium">completed</div>
    </div>
  </div>

  {/* Progress Bar & Numerical Target */}
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-semibold text-slate-600">
      <span>{goal.current_value} {goal.unit} logged</span>
      <span>Target: {goal.target_value} {goal.unit}</span>
    </div>
    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          goal.current_value >= goal.target_value ? 'bg-emerald-500' : 'bg-brand-500'
        }`}
        style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
      />
    </div>
  </div>

  {/* Target Deadline */}
  {goal.end_date && (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
      <Calendar className="w-3.5 h-3.5" />
      <span>Target Date: {formatDate(goal.end_date)}</span>
    </div>
  )}

  {/* Quick Action Footer */}
  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
    <button
      onClick={() => handleQuickIncrement(goal.goal_id)}
      disabled={goal.status === 'completed'}
      className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 py-1.5 px-3 rounded-xl transition-all flex items-center gap-1"
    >
      <Plus className="w-3.5 h-3.5" />
      Log +1 Progress
    </button>
    <button
      onClick={() => openGoalDetailModal(goal)}
      className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 px-2.5 rounded-xl transition-colors"
    >
      View Milestones
    </button>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Progress Increment (`POST /api/goals/:id/progress`):**
   - Updates `goals.current_value = LEAST(target_value, current_value + 1)`.
   - Inserts record into `goal_progress` table recording date and notes.
   - When `current_value >= target_value`, updates `status = 'completed'` and fires confetti.
2. **Automatic Increments via Interactions:**
   - When an interaction is logged with a selected `goal_id`, the backend automatically increments goal progress within the same SQL transaction!

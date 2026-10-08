# Frontend Card: Kanban Task Cards

## 1. Overview
The **Kanban Task Card** powers the interactive visual pipeline on the **Kanban Board** (`frontend/src/pages/KanbanPage.tsx`) and the **Tasks Page** (`frontend/src/pages/TasksPage.tsx`). It organizes follow-ups, outreach actions, and relationship milestones across 3 stages: **To Do**, **In Progress**, and **Done**.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [High Priority Chip]                             [... Menu] |
| Send quarterly roadmap update to Rohan Mehta                |
| Contact: Rohan Mehta (SaaSify Global)                       |
|-------------------------------------------------------------|
| [Clock] Due: Tomorrow, 2:00 PM                              |
|-------------------------------------------------------------|
| [<- Move Back]                           [Advance to Done ->|
+-------------------------------------------------------------+
```

- **Priority Badge Indicators:**
  - `urgent`: Deep Red (`bg-red-50 text-red-700 border-red-200`)
  - `high`: Amber/Orange (`bg-amber-50 text-amber-700 border-amber-200`)
  - `medium`: Brand Blue (`bg-blue-50 text-blue-700 border-blue-200`)
  - `low`: Slate Gray (`bg-slate-50 text-slate-600 border-slate-200`)
- **Stage Workflow:**
  - `todo` $\leftrightarrow$ `in_progress` $\leftrightarrow$ `done`

---

## 3. Data Schema & Types

```typescript
export interface Task {
  task_id: number;
  user_id: number;
  contact_id: number | null;
  goal_id: number | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  goal_title?: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Kanban Task Card */}
<div
  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-card hover:border-brand-200 transition-all space-y-3 cursor-grab active:cursor-grabbing group"
>
  {/* Priority & Contact Badge Header */}
  <div className="flex items-center justify-between gap-2">
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
      task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-100' :
      task.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' :
      task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
      'bg-slate-50 text-slate-600 border-slate-100'
    }`}>
      {task.priority}
    </span>

    {task.contact_name && (
      <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px] bg-slate-50 px-2 py-0.5 rounded">
        @{task.contact_name}
      </span>
    )}
  </div>

  {/* Task Title & Description */}
  <div>
    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
      {task.title}
    </h4>
    {task.description && (
      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{task.description}</p>
    )}
  </div>

  {/* Due Date & Associated Goal */}
  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
    {task.due_date ? (
      <div className={`flex items-center gap-1 font-medium ${
        new Date(task.due_date) < new Date() && task.status !== 'done'
          ? 'text-red-600 font-semibold'
          : 'text-slate-400'
      }`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{formatDate(task.due_date)}</span>
      </div>
    ) : (
      <span className="text-[11px] text-slate-300">No deadline</span>
    )}

    {task.goal_title && (
      <span className="text-[10px] text-brand-600 font-semibold truncate max-w-[100px]">
        🎯 {task.goal_title}
      </span>
    )}
  </div>

  {/* Quick Stage Mover Controls */}
  <div className="flex items-center justify-between pt-2 border-t border-slate-100 opacity-90 group-hover:opacity-100">
    {task.status !== 'todo' && (
      <button
        onClick={() => onMoveStatus(task.task_id, task.status === 'done' ? 'in_progress' : 'todo')}
        className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-50 flex items-center gap-0.5"
      >
        <ChevronLeft className="w-3 h-3" /> Back
      </button>
    )}
    
    {task.status !== 'done' ? (
      <button
        onClick={() => onMoveStatus(task.task_id, task.status === 'todo' ? 'in_progress' : 'done')}
        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 ml-auto p-1 rounded hover:bg-brand-50 flex items-center gap-0.5"
      >
        {task.status === 'todo' ? 'Start' : 'Complete'} <ChevronRight className="w-3 h-3" />
      </button>
    ) : (
      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 ml-auto">
        <CheckCircle2 className="w-3 h-3" /> Finished
      </span>
    )}
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Optimistic Status Mutation:**
   - On click or drag drop: Executes `PATCH /api/tasks/:id` with payload `{ status: nextStatus }`.
   - TanStack Query updates local cache immediately before receiving response.
2. **Auto-Completion Date:**
   - Backend automatically sets `completed_at = NOW()` when status transitions to `done`.
   - Clears `completed_at` if moved back to `todo` or `in_progress`.

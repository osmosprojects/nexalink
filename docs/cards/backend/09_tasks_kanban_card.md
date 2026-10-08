# Backend Card: Tasks & Kanban Card

## 1. Overview
The **Tasks & Kanban Module** (`backend/src/controllers/TaskController.ts`, `backend/src/repositories/TaskRepository.ts`) supports actionable relationship follow-ups and pipeline workflow tracking across the 3 Kanban columns (`todo`, `in_progress`, `done`).

- **Primary Source Files:**
  - Controller: `backend/src/controllers/TaskController.ts`
  - Repository: `backend/src/repositories/TaskRepository.ts`
  - Table: `tasks`

---

## 2. API Endpoints

| Method | Endpoint | Query / Body Params | Purpose |
|---|---|---|---|
| `GET` | `/api/tasks` | `status`, `priority`, `contact_id`, `goal_id` | List tasks with contact and goal joins |
| `POST` | `/api/tasks` | Task JSON payload | Create a manual task |
| `GET` | `/api/tasks/:id` | `id` (Param) | Get single task detail |
| `PUT` / `PATCH` | `/api/tasks/:id` | `{ status, priority, due_date }` | Update task or advance Kanban stage |
| `DELETE` | `/api/tasks/:id` | `id` (Param) | Remove task |

---

## 3. SQL Query Implementation & Status Lifecycle

```typescript
// backend/src/repositories/TaskRepository.ts
const sql = `
  SELECT 
    t.*,
    CONCAT(c.first_name, ' ', c.last_name) as contact_name,
    g.title as goal_title
  FROM tasks t
  LEFT JOIN contacts c ON t.contact_id = c.contact_id
  LEFT JOIN goals g ON t.goal_id = g.goal_id
  WHERE t.user_id = ?
  ORDER BY 
    CASE t.priority 
      WHEN 'urgent' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      ELSE 4 
    END,
    t.due_date ASC
`;
```

```typescript
// Status Transition Logic (TaskRepository.ts)
static async update(userId: number, taskId: number, data: Partial<TaskData>) {
  if (data.status === 'done' && !data.completed_at) {
    data.completed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  } else if (data.status && data.status !== 'done') {
    data.completed_at = null;
  }
  // Prepared update query executes here...
}
```

---

## 4. Priority Weighting & Indexing
- Tasks use an index on `(user_id, status, due_date)` to ensure dashboard action item queries execute in $< 2\text{ ms}$.
- Priority levels: `urgent` $\rightarrow$ `high` $\rightarrow$ `medium` $\rightarrow$ `low`.

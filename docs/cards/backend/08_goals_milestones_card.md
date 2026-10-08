# Backend Card: Goals & Milestones Card

## 1. Overview
The **Goals & Milestones Module** (`backend/src/controllers/GoalController.ts`, `backend/src/repositories/GoalRepository.ts`) facilitates objective-based networking. Users set quantitative targets, log progressive increments, and record milestone history in MySQL.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/GoalController.ts`
  - Repository: `backend/src/repositories/GoalRepository.ts`
  - Tables: `goals`, `goal_progress`

---

## 2. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/goals` | List all goals with calculated completion percentages |
| `POST` | `/api/goals` | Create a new target goal |
| `GET` | `/api/goals/:id` | Get goal details and historic milestone logs |
| `PUT` | `/api/goals/:id` | Update goal parameters |
| `POST` | `/api/goals/:id/progress` | Log an incremental milestone (+1 or custom value) |
| `DELETE` | `/api/goals/:id` | Delete goal and cascade milestone logs |

---

## 3. Progress Calculation & SQL Logic

```typescript
// backend/src/repositories/GoalRepository.ts (List Query)
const rows = await query<GoalRow[]>(
  `SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC`,
  [userId, status]
);

return rows.map((g) => ({
  ...g,
  progress_percentage: g.target_value > 0 
    ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) 
    : 0,
}));
```

```typescript
// Progress Logging Transaction (GoalRepository.ts)
await withTransaction(async (conn) => {
  // 1. Insert Milestone Log
  await conn.execute(
    `INSERT INTO goal_progress (goal_id, progress_date, progress_value, notes)
     VALUES (?, CURDATE(), ?, ?)`,
    [goalId, incrementValue, notes || null]
  );

  // 2. Increment Current Value
  await conn.execute(
    `UPDATE goals 
     SET current_value = LEAST(target_value, current_value + ?),
         status = CASE WHEN current_value + ? >= target_value THEN 'completed' ELSE status END
     WHERE goal_id = ? AND user_id = ?`,
    [incrementValue, incrementValue, goalId, userId]
  );
});
```

---

## 4. Business Rules
- Automatic completion: When `current_value >= target_value`, goal status is automatically upgraded to `'completed'`.
- Inter-module hooks: Logging an interaction with an associated `goal_id` automatically fires this progress transaction.

# Backend Card: Interactions Engine Card

## 1. Overview
The **Interactions Engine** (`backend/src/repositories/InteractionRepository.ts`) executes multi-table transactional workflows whenever a touchpoint is logged. It maintains relationship timeliness, automatically schedules follow-up tasks, updates contact relationship health, and increments linked goal progress.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/InteractionController.ts`
  - Repository: `backend/src/repositories/InteractionRepository.ts`
  - Tables: `interactions`, `contacts`, `tasks`, `goals`, `goal_progress`

---

## 2. ACID Transaction Sequence

When an interaction is created via `POST /api/interactions`:

```text
               [ POST /api/interactions ]
                           |
        +------------------v-------------------+
        |       BEGIN MySQL TRANSACTION        |
        +--------------------------------------+
                           |
    1. INSERT INTO interactions
       (contact_id, type, date, duration, summary, outcome...)
                           |
    2. UPDATE contacts
       SET last_interaction_at = interaction_date,
           next_follow_up_at = follow_up_date,
           relationship_strength = LEAST(100, relationship_strength + 5)
                           |
    3. (If follow_up_required = true & follow_up_date given)
       INSERT INTO tasks (title, priority: 'high', due_date, status: 'todo')
                           |
    4. (If goal_id provided)
       UPDATE goals SET current_value = LEAST(target_value, current_value + 1)
       INSERT INTO goal_progress (progress_date, progress_value: 1)
                           |
        +------------------v-------------------+
        |       COMMIT MySQL TRANSACTION       |
        +--------------------------------------+
```

---

## 3. Transaction Code Implementation

```typescript
// backend/src/repositories/InteractionRepository.ts
const interactionId = await withTransaction(async (conn) => {
  // Step 1: Insert Interaction Record
  const [iRes]: any = await conn.execute(
    `INSERT INTO interactions (
      user_id, contact_id, goal_id, interaction_type, title, interaction_date, 
      duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, data.contact_id, data.goal_id || null, data.interaction_type, data.title,
     interactionDate, data.duration_minutes || 30, data.summary, data.outcome, 
     followUpReq, data.follow_up_date || null, data.sentiment || 'positive']
  );
  const insertId = iRes.insertId;

  // Step 2: Update Contact Health & Follow-up
  await conn.execute(
    `UPDATE contacts 
     SET last_interaction_at = ?, 
         next_follow_up_at = COALESCE(?, next_follow_up_at),
         relationship_strength = LEAST(100, relationship_strength + 5)
     WHERE user_id = ? AND contact_id = ?`,
    [interactionDate, data.follow_up_date || null, userId, data.contact_id]
  );

  // Step 3: Automate Follow-up Task Creation
  if (followUpReq && data.follow_up_date) {
    await conn.execute(
      `INSERT INTO tasks (user_id, contact_id, goal_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, 'todo', 'high', ?)`,
      [userId, data.contact_id, data.goal_id || null, `Follow up regarding: ${data.title}`,
       `Scheduled follow-up from interaction on ${interactionDate}. Outcome: ${data.outcome || 'N/A'}`,
       data.follow_up_date]
    );
  }

  // Step 4: Advance Linked Goal
  if (data.goal_id) {
    await conn.execute(
      `UPDATE goals 
       SET current_value = LEAST(target_value, current_value + 1)
       WHERE user_id = ? AND goal_id = ?`,
      [userId, data.goal_id]
    );
  }

  return insertId;
});
```

---

## 4. Error Handling & Rollback Guarantees
If any single step fails (e.g. invalid date syntax or foreign key mismatch), `withTransaction` immediately issues a `ROLLBACK`, guaranteeing zero orphan tasks or inconsistent contact health states.

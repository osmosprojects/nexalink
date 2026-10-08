# Backend Card: Meetings Management Card

## 1. Overview
The **Meetings Module** (`backend/src/controllers/MeetingController.ts`, `backend/src/repositories/MeetingRepository.ts`) handles scheduling, agenda formulation, contact linking, and date-range queries for calendar views and upcoming meeting cards.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/MeetingController.ts`
  - Repository: `backend/src/repositories/MeetingRepository.ts`
  - Table: `meetings`

---

## 2. API Endpoints

| Method | Endpoint | Query / Body Params | Purpose |
|---|---|---|---|
| `GET` | `/api/meetings` | `upcoming_only`, `start_date`, `end_date`, `contact_id`, `limit` | List filtered meetings with contact joins |
| `POST` | `/api/meetings` | Meeting JSON payload | Schedule a new meeting |
| `GET` | `/api/meetings/:id` | `id` (Param) | Get single meeting detail |
| `PUT` | `/api/meetings/:id` | Partial fields (`status`, `agenda`, `outcome`) | Update meeting or log outcome |
| `DELETE` | `/api/meetings/:id` | `id` (Param) | Delete meeting |

---

## 3. SQL Query Implementation

```typescript
// backend/src/repositories/MeetingRepository.ts
const whereClauses: string[] = ['m.user_id = ?'];
const params: any[] = [userId];

if (filters.upcoming_only) {
  whereClauses.push('m.start_at >= NOW()');
  whereClauses.push("m.status != 'cancelled'");
}

if (filters.start_date && filters.end_date) {
  whereClauses.push('m.start_at BETWEEN ? AND ?');
  params.push(filters.start_date, filters.end_date);
}

const sql = `
  SELECT 
    m.*,
    CONCAT(c.first_name, ' ', c.last_name) as contact_name,
    c.avatar_url as contact_avatar
  FROM meetings m
  LEFT JOIN contacts c ON m.contact_id = c.contact_id
  WHERE ${whereClauses.join(' AND ')}
  ORDER BY m.start_at ASC
  LIMIT ?
`;
```

---

## 4. Business Rules
1. **Meeting Status Transitions:** `scheduled` $\rightarrow$ `completed` / `rescheduled` / `cancelled`.
2. **Contact Link Integrity:** `contact_id` is an optional foreign key (`ON DELETE SET NULL`). Deleting a contact preserves meeting historical records.

# Backend Card: Global Search & Notifications Card

## 1. Overview
This module combines **Global Multi-Entity Search** (`backend/src/controllers/SearchController.ts`, `backend/src/repositories/SearchRepository.ts`) and the **Notifications Dispatcher** (`backend/src/controllers/NotificationController.ts`, `backend/src/repositories/NotificationRepository.ts`).

- **Primary Source Files:**
  - Controllers: `SearchController.ts`, `NotificationController.ts`
  - Repositories: `SearchRepository.ts`, `NotificationRepository.ts`
  - Tables: `notifications`, `contacts`, `interactions`, `meetings`, `tasks`, `goals`, `notes`

---

## 2. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/search?q=:query` | Global search across contacts, meetings, notes, tasks, goals |
| `GET` | `/api/notifications` | List user notifications (ordered by unread first) |
| `POST` | `/api/notifications/:id/read` | Mark single notification as read |
| `POST` | `/api/notifications/read-all` | Mark all notifications as read for current user |

---

## 3. Global Multi-Entity Search Architecture

Instead of fragmented queries, `SearchRepository.globalSearch` runs parallel queries across 6 core tables scoped to the user:

```typescript
// backend/src/repositories/SearchRepository.ts
const term = `%${searchTerm.trim()}%`;

const [contacts, interactions, meetings, tasks, goals, notes] = await Promise.all([
  // Contacts search
  query(
    `SELECT contact_id, first_name, last_name, company, job_title, avatar_url, relationship_type
     FROM contacts 
     WHERE user_id = ? AND (first_name LIKE ? OR last_name LIKE ? OR company LIKE ? OR job_title LIKE ?)
     LIMIT 5`,
    [userId, term, term, term, term]
  ),
  // Interactions search
  query(
    `SELECT i.interaction_id, i.title, i.interaction_type, i.interaction_date, 
            CONCAT(c.first_name, ' ', c.last_name) as contact_name
     FROM interactions i
     JOIN contacts c ON i.contact_id = c.contact_id
     WHERE i.user_id = ? AND (i.title LIKE ? OR i.summary LIKE ?)
     LIMIT 5`,
    [userId, term, term]
  ),
  // Meetings search
  query(
    `SELECT m.meeting_id, m.title, m.meeting_type, m.start_at, 
            CONCAT(c.first_name, ' ', c.last_name) as contact_name
     FROM meetings m
     LEFT JOIN contacts c ON m.contact_id = c.contact_id
     WHERE m.user_id = ? AND (m.title LIKE ? OR m.agenda LIKE ?)
     LIMIT 5`,
    [userId, term, term]
  ),
  // Tasks, Goals, and Notes queries execute concurrently...
]);
```

---

## 4. Notifications Rules
- Indexed by `(user_id, is_read, created_at)`.
- Instant response with sub-millisecond execution.

# Backend Card: Notes Repository Card

## 1. Overview
The **Notes Module** (`backend/src/controllers/NoteController.ts`, `backend/src/repositories/NoteRepository.ts`) manages unstructured meeting notes, private context, and relationship memos.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/NoteController.ts`
  - Repository: `backend/src/repositories/NoteRepository.ts`
  - Table: `notes`

---

## 2. API Endpoints

| Method | Endpoint | Query / Body Params | Purpose |
|---|---|---|---|
| `GET` | `/api/notes` | `contact_id`, `search` | List notes (pinned first, then date) |
| `POST` | `/api/notes` | `{ contact_id, title, content, is_pinned }` | Create a new note |
| `GET` | `/api/notes/:id` | `id` (Param) | Get note detail |
| `PUT` | `/api/notes/:id` | Note JSON payload | Update content or toggle `is_pinned` |
| `DELETE` | `/api/notes/:id` | `id` (Param) | Delete note |

---

## 3. SQL Query Architecture

```typescript
// backend/src/repositories/NoteRepository.ts
const whereClauses: string[] = ['n.user_id = ?'];
const params: any[] = [userId];

if (filters.contact_id) {
  whereClauses.push('n.contact_id = ?');
  params.push(filters.contact_id);
}

const sql = `
  SELECT 
    n.*,
    CONCAT(c.first_name, ' ', c.last_name) as contact_name,
    c.avatar_url as contact_avatar
  FROM notes n
  LEFT JOIN contacts c ON n.contact_id = c.contact_id
  WHERE ${whereClauses.join(' AND ')}
  ORDER BY n.is_pinned DESC, n.updated_at DESC
`;
```

---

## 4. Key Rules
- Pinned sorting guarantee: `ORDER BY n.is_pinned DESC, n.updated_at DESC` guarantees that pinned memos are rendered at the top of both the full notes screen and contact dossier sub-tabs.
- Contact cascading: `contact_id` foreign key is optional (`ON DELETE CASCADE`), ensuring notes linked to removed contacts are cleanly purged or isolated.

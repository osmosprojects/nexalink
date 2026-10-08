# Backend Card: Contacts CRM Module Card

## 1. Overview
The **Contacts CRM Module** forms the relational core of NexaLink. It manages individual contact dossiers, relationship categorization (`mentor`, `client`, `founder`, etc.), relationship health scores (0–100%), and tag associations using prepared statements and SQL transactions.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/ContactController.ts`
  - Repository: `backend/src/repositories/ContactRepository.ts`
  - Tables: `contacts`, `tags`, `contact_tags`

---

## 2. API Endpoints

| Method | Endpoint | Query / Body Params | Purpose |
|---|---|---|---|
| `GET` | `/api/contacts` | `search`, `relationship_type`, `tag`, `page`, `limit` | Paginated directory list with tag joins |
| `POST` | `/api/contacts` | Contact JSON payload + `tags[]` | Create new contact record |
| `GET` | `/api/contacts/:id` | `id` (Param) | Full contact dossier with tags & stats |
| `PUT` | `/api/contacts/:id` | Partial contact updates | Update contact details |
| `DELETE` | `/api/contacts/:id` | `id` (Param) | Delete contact (Cascades interactions/tasks) |
| `GET` | `/api/contacts/tags` | None | Get all unique user tags |

---

## 3. SQL Query Architecture & Repository Pattern

```typescript
// backend/src/repositories/ContactRepository.ts (List Query)
const whereClauses: string[] = ['c.user_id = ?'];
const params: any[] = [userId];

if (filters.search) {
  whereClauses.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.company LIKE ? OR c.job_title LIKE ?)');
  const term = `%${filters.search}%`;
  params.push(term, term, term, term);
}

if (filters.relationship_type && filters.relationship_type !== 'all') {
  whereClauses.push('c.relationship_type = ?');
  params.push(filters.relationship_type);
}

const sql = `
  SELECT c.*, 
    COALESCE(
      JSON_ARRAYAGG(
        CASE WHEN t.tag_id IS NOT NULL 
        THEN JSON_OBJECT('tag_id', t.tag_id, 'name', t.name, 'color', t.color) 
        ELSE NULL END
      ), JSON_ARRAY()
    ) as tags
  FROM contacts c
  LEFT JOIN contact_tags ct ON c.contact_id = ct.contact_id
  LEFT JOIN tags t ON ct.tag_id = t.tag_id
  WHERE ${whereClauses.join(' AND ')}
  GROUP BY c.contact_id
  ORDER BY c.relationship_strength DESC, c.first_name ASC
  LIMIT ? OFFSET ?
`;
```

---

## 4. Key Business Logic

1. **Strict User Scoping:** Every SQL statement has an obligatory `WHERE user_id = ?` clause. Under no circumstances can a user read, modify, or delete another user's contact records.
2. **Tag Many-to-Many Handling:** Handled via transaction:
   - Inserts new tags into `tags` with `ON DUPLICATE KEY UPDATE tag_id=LAST_INSERT_ID(tag_id)`.
   - Links in `contact_tags` pivot table.

# Frontend Card: Notes Cards

## 1. Overview
The **Notes Card** is utilized on the **Notes Workspace** (`frontend/src/pages/NotesPage.tsx`) and within the **Contact Dossier** tabs. It accommodates qualitative relationship intelligence, meeting scratchpads, contact context, and pinned quick-reference items.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Pin Icon Active]  Series-A Term Sheet Notes     [... Menu] |
| Contact: Rohan Mehta | Updated: 2 hours ago                 |
|-------------------------------------------------------------|
| Pre-money valuation agreed around $14M. Discussion on       |
| liquidation preference remains 1x non-participating.        |
| Check size from lead syndicate: $1.8M.                      |
|-------------------------------------------------------------|
| [Unpin Note]                           [Edit]      [Delete] |
+-------------------------------------------------------------+
```

- **Pinned Visual Priority:**
  - Pinned notes feature an amber/gold border accent (`border-amber-300`) and a distinct pin icon.
  - Sorted above unpinned notes via SQL `ORDER BY is_pinned DESC, updated_at DESC`.

---

## 3. Data Schema & Types

```typescript
export interface Note {
  note_id: number;
  user_id: number;
  contact_id: number | null;
  title: string | null;
  content: string;
  is_pinned: boolean | number;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Note Card */}
<div className={`rounded-3xl p-5 border transition-all space-y-3 flex flex-col justify-between ${
  note.is_pinned
    ? 'bg-amber-50/30 border-amber-200/80 shadow-soft'
    : 'bg-white border-slate-200/80 shadow-card hover:shadow-soft'
}`}>
  <div>
    {/* Card Header */}
    <div className="flex items-start justify-between gap-3">
      <h4 className="text-base font-bold text-slate-900 line-clamp-1">
        {note.title || 'Untitled Note'}
      </h4>
      <button
        onClick={() => onTogglePin(note.note_id, !note.is_pinned)}
        className={`p-1 rounded-lg transition-colors ${
          note.is_pinned ? 'text-amber-600 bg-amber-100/60' : 'text-slate-300 hover:text-slate-600'
        }`}
        title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
      >
        <Pin className="w-4 h-4 fill-current" />
      </button>
    </div>

    {/* Contact Relationship Association */}
    {note.contact_name && (
      <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold mt-1">
        <Users className="w-3.5 h-3.5" />
        <span>Linked to {note.contact_name}</span>
      </div>
    )}

    {/* Note Body */}
    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-3 line-clamp-5">
      {note.content}
    </p>
  </div>

  {/* Footer */}
  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
    <span>Updated {formatDate(note.updated_at)}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(note)}
        className="font-semibold text-slate-600 hover:text-brand-600 py-1 px-2 rounded-lg hover:bg-slate-50"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(note.note_id)}
        className="font-semibold text-rose-500 hover:text-rose-700 py-1 px-2 rounded-lg hover:bg-rose-50"
      >
        Delete
      </button>
    </div>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Pinning Toggle (`PUT /api/notes/:id`):**
   - Sends payload `{ is_pinned: !current }`.
   - TanStack Query automatically refetches notes ordered by pin priority.
2. **Search Integration:**
   - Notes are indexed and searchable via the Global Search Modal (`/api/search?q=term`).

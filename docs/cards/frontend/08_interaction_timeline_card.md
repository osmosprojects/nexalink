# Frontend Card: Interaction Timeline Cards

## 1. Overview
The **Interaction Timeline Card** is used on the **Interactions Page** (`frontend/src/pages/InteractionsPage.tsx`), the **Contact Detail Dossier** (`frontend/src/pages/ContactDetailPage.tsx`), and the Dashboard's "Recent Activity" feed. It logs granular touchpoints across 9 interaction channels (calls, meetings, emails, coffee chats, etc.), captures sentiment, and surfaces automated follow-up reminders.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Coffee Icon] Coffee Chat with Rohan Mehta      [Positive]  |
| Oct 4, 2026 • 45 mins • Linked Goal: "10 SaaS Founders"     |
|-------------------------------------------------------------|
| Summary:                                                    |
| Discussed engineering team expansion and current cloud      |
| infrastructure challenges.                                  |
| Outcome:                                                    |
| Rohan offered to review our new API architecture specs.     |
|-------------------------------------------------------------|
| [Alert] Follow-up Due: Oct 11, 2026                         |
| [+ Task Scheduled: Send architecture overview doc]          |
+-------------------------------------------------------------+
```

- **Channel Type Icons:**
  - `coffee`: Amber coffee cup
  - `meeting` / `video`: Indigo calendar/video
  - `call`: Emerald phone
  - `email`: Blue mail envelope
  - `introduction`: Purple handshake
- **Sentiment Chips:**
  - `positive`: Emerald pill (`text-emerald-700 bg-emerald-50`)
  - `neutral`: Slate pill (`text-slate-600 bg-slate-50`)
  - `negative`: Rose pill (`text-rose-700 bg-rose-50`)

---

## 3. Data Schema & Types

```typescript
export interface Interaction {
  interaction_id: number;
  user_id: number;
  contact_id: number;
  goal_id: number | null;
  interaction_type: 'meeting' | 'call' | 'email' | 'message' | 'coffee' | 'event' | 'introduction' | 'note' | 'other';
  title: string;
  interaction_date: string;
  duration_minutes: number;
  summary: string | null;
  outcome: string | null;
  follow_up_required: number | boolean;
  follow_up_date: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Interaction Timeline Card */}
<div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card hover:shadow-soft transition-all space-y-3 relative group">
  {/* Header: Channel, Contact & Sentiment */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
        item.interaction_type === 'coffee' ? 'bg-amber-50 text-amber-700' :
        item.interaction_type === 'meeting' ? 'bg-brand-50 text-brand-700' :
        item.interaction_type === 'call' ? 'bg-emerald-50 text-emerald-700' :
        item.interaction_type === 'email' ? 'bg-blue-50 text-blue-700' :
        'bg-purple-50 text-purple-700'
      }`}>
        <InteractionIcon type={item.interaction_type} className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
        <p className="text-xs text-slate-500 font-medium">
          With <span className="text-slate-800 font-semibold">{item.contact_name}</span> • {formatDate(item.interaction_date)}
        </p>
      </div>
    </div>

    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
      item.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
      item.sentiment === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
      'bg-slate-50 text-slate-600 border border-slate-100'
    }`}>
      {item.sentiment}
    </span>
  </div>

  {/* Summary Body */}
  {item.summary && (
    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
      {item.summary}
    </p>
  )}

  {/* Outcome Highlight */}
  {item.outcome && (
    <div className="text-xs text-slate-700 bg-brand-50/40 p-2.5 rounded-xl border border-brand-100/60 flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-brand-900">Outcome: </span>
        <span>{item.outcome}</span>
      </div>
    </div>
  )}

  {/* Follow-up Required Banner */}
  {item.follow_up_required && item.follow_up_date && (
    <div className="flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/70">
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Follow-up Due: {formatDate(item.follow_up_date)}
      </span>
      <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-md text-amber-900">
        Task Scheduled
      </span>
    </div>
  )}

  {/* Linked Goal Pill */}
  {item.goal_title && (
    <div className="pt-2 flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
      <Target className="w-3 h-3" />
      <span>Advanced Goal: {item.goal_title}</span>
    </div>
  )}
</div>
```

---

## 5. Logic & State Handlers

1. **Transactional Multi-Record Creation:**
   - Submitting an interaction sends `POST /api/interactions`.
   - In a single SQL transaction:
     - Record is stored in `interactions`.
     - Contact's `last_interaction_at` and `next_follow_up_at` are updated.
     - Relationship strength increments by +5 pts (max 100).
     - If `follow_up_required` is true, an automated task is inserted into `tasks` table with `status = 'todo'` and `priority = 'high'`.
     - If `goal_id` is supplied, `goals.current_value` is incremented.

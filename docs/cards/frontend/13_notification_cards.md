# Frontend Card: Notification Alert Cards

## 1. Overview
The **Notification Alert Card** renders actionable alerts within the **Notifications Center** (`frontend/src/pages/NotificationsPage.tsx`) and the top navigation dropdown (`frontend/src/components/layout/Navbar.tsx`). It alerts users to overdue follow-ups, upcoming meetings, newly discovered network matches, and completed goal milestones.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Clock Icon] Follow-up Due with Rohan Mehta       [Unread •]|
| Scheduled for today regarding: "API spec discussion"       |
| 15 minutes ago                                              |
|-------------------------------------------------------------|
| [Mark as Read]                         [Take Action Now ->] |
+-------------------------------------------------------------+
```

- **Visual Indicators:**
  - Unread items display a glowing blue dot (`w-2 h-2 rounded-full bg-brand-600`) and subtle slate border.
  - Action buttons deep-link directly to the contact dossier, task editor, or meeting room.

---

## 3. Data Schema & Types

```typescript
export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'follow_up' | 'meeting' | 'goal' | 'recommendation' | 'system';
  reference_id: number | null;
  reference_type: string | null;
  is_read: boolean | number;
  created_at: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Notification Alert Card */}
<div
  className={`rounded-2xl p-4 border transition-all space-y-2 flex items-start justify-between gap-3 ${
    notification.is_read
      ? 'bg-white border-slate-200/70 text-slate-500'
      : 'bg-brand-50/20 border-brand-200/80 text-slate-800 shadow-sm'
  }`}
>
  <div className="flex items-start gap-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
      notification.notification_type === 'follow_up' ? 'bg-amber-100 text-amber-700' :
      notification.notification_type === 'meeting' ? 'bg-brand-100 text-brand-700' :
      notification.notification_type === 'recommendation' ? 'bg-purple-100 text-purple-700' :
      'bg-emerald-100 text-emerald-700'
    }`}>
      <NotificationIcon type={notification.notification_type} className="w-4 h-4" />
    </div>

    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
        {!notification.is_read && (
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
        )}
      </div>
      <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
      <span className="text-[10px] text-slate-400 font-medium block mt-1">
        {formatRelativeTime(notification.created_at)}
      </span>
    </div>
  </div>

  <div className="flex items-center gap-2 shrink-0">
    {!notification.is_read && (
      <button
        onClick={() => onMarkAsRead(notification.notification_id)}
        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 p-1 rounded hover:bg-brand-50"
      >
        Mark Read
      </button>
    )}
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Mark as Read:**
   - Single item: `POST /api/notifications/:id/read`.
   - Read all: `POST /api/notifications/read-all`.
   - Automatically decrements the unread badge in Navbar.

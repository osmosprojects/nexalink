# Frontend Card: Meeting Agenda Cards

## 1. Overview
The **Meeting Agenda Card** is rendered in the **Meetings Management View** (`frontend/src/pages/MeetingsPage.tsx`), the **Calendar View** (`frontend/src/pages/CalendarPage.tsx`), and the Dashboard's "Upcoming Meetings" panel. It provides time, location/video links, attendee contacts, and quick actions to log outcomes.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Calendar] Oct 12, 2026 • 10:30 AM (45 min)     [Scheduled] |
| Q4 Strategic Partnership Discussion                         |
| Attendee: Rohan Mehta (VP Engineering @ SaaSify Global)     |
| Location: Google Meet (meet.google.com/xyz-abc)             |
|-------------------------------------------------------------|
| Agenda:                                                     |
| • Review cross-platform API integration roadmap             |
| • Align on mutual introduction candidates                   |
|-------------------------------------------------------------|
| [Join Video Call]       [Log Outcome & Notes]       [Edit]  |
+-------------------------------------------------------------+
```

- **Status Accents:**
  - `scheduled`: Brand Blue (`bg-blue-50 text-blue-700`)
  - `completed`: Emerald Green (`bg-emerald-50 text-emerald-700`)
  - `cancelled`: Red/Rose (`bg-red-50 text-red-700`)
- **Direct Video Launcher:** Detects URL protocols (`https://meet.google.com`, `zoom.us`) and provides a 1-click external open button.

---

## 3. Data Schema & Types

```typescript
export interface Meeting {
  meeting_id: number;
  user_id: number;
  contact_id: number | null;
  title: string;
  meeting_type: 'coffee' | 'video' | 'phone' | 'lunch' | 'event' | 'interview' | 'other';
  start_at: string;
  end_at: string | null;
  location: string | null;
  agenda: string | null;
  outcome: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Meeting Agenda Card */}
<div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card hover:shadow-soft transition-all space-y-4">
  {/* Header: Date, Time & Status */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center text-brand-700 font-bold">
        <span className="text-[10px] uppercase font-semibold leading-none">{formatMonth(meeting.start_at)}</span>
        <span className="text-base leading-none mt-0.5">{formatDay(meeting.start_at)}</span>
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{meeting.title}</h3>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatTime(meeting.start_at)} ({meeting.meeting_type})
        </p>
      </div>
    </div>

    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
      meeting.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
      meeting.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
      'bg-brand-50 text-brand-700 border border-brand-100'
    }`}>
      {meeting.status}
    </span>
  </div>

  {/* Attendee Contact Pill */}
  {meeting.contact_name && (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
      <Avatar src={meeting.contact_avatar} name={meeting.contact_name} size="xs" />
      <span className="text-xs font-semibold text-slate-700">With {meeting.contact_name}</span>
    </div>
  )}

  {/* Agenda Preview */}
  {meeting.agenda && (
    <div className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/80">
      <div className="font-semibold text-slate-700 mb-1">Agenda:</div>
      <p className="line-clamp-2 leading-relaxed">{meeting.agenda}</p>
    </div>
  )}

  {/* Location / Video Call Link */}
  {meeting.location && (
    <div className="flex items-center justify-between text-xs pt-1">
      <span className="text-slate-400 font-medium truncate max-w-[200px]">📍 {meeting.location}</span>
      {meeting.location.includes('http') && (
        <a
          href={meeting.location}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1"
        >
          Join Video <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  )}

  {/* Quick Actions Footer */}
  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
    <button
      onClick={() => onLogOutcome(meeting)}
      className="text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      Log Outcome
    </button>
    <button
      onClick={() => onSummarizeMeeting(meeting.meeting_id)}
      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-purple-50 transition-colors"
    >
      <Sparkles className="w-3.5 h-3.5" />
      AI Summarize
    </button>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Outcome Logging Flow:**
   - Converts meeting notes into a logged interaction (`POST /api/interactions`).
   - Automatically marks meeting status as `'completed'`.
2. **AI Meeting Summarizer Integration:**
   - Passes meeting agenda and discussion notes to `/api/ai/meeting/summarize`.
   - Generates bullet-point takeaways, decision lists, and automated follow-up tasks.

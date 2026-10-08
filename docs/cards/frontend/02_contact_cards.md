# Frontend Card: Contact Cards & Dossier

## 1. Overview
The Contact Card components represent people in the user's personal CRM network across the **Connections Directory** (`frontend/src/pages/ContactsPage.tsx`) and the **Contact Detail Dossier** (`frontend/src/pages/ContactDetailPage.tsx`). They highlight identity, relationship type, relationship health (0–100%), follow-up urgency, tags, and quick-action shortcuts.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Avatar]  Rohan Mehta                           [... Menu]  |
|           VP Engineering @ SaaSify Global                   |
|           [Founder Badge] [AI Software Tag]                 |
|-------------------------------------------------------------|
| Relationship Strength: [====================......] 75%     |
| Last Touchpoint: 3 days ago    Next Follow-up: Tomorrow     |
|-------------------------------------------------------------|
| [Log Interaction]   [Draft Intro]   [Schedule Meeting]      |
+-------------------------------------------------------------+
```

- **Surfaces:** `bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-md`
- **Dynamic Relationship Color Coding:**
  - High Strength (`>=75%`): Emerald green (`bg-emerald-500`, `text-emerald-700`)
  - Moderate Strength (`40–74%`): Brand blue/indigo (`bg-brand-500`, `text-brand-700`)
  - Low Strength (`<40%`): Amber/Rose warning (`bg-amber-500`, `text-amber-700`)

---

## 3. Data Schema & Types

```typescript
export interface Contact {
  contact_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  relationship_type: 'friend' | 'mentor' | 'mentee' | 'colleague' | 'client' | 'prospect' | 'founder' | 'investor' | 'recruiter' | 'partner' | 'other';
  relationship_strength: number; // 0 - 100
  last_interaction_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tags?: { tag_id: number; name: string; color: string }[];
}
```

---

## 4. Component Code Implementation

```tsx
{/* Contact Card in Directory Grid */}
<div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between group">
  <div>
    {/* Card Header: Avatar & Identity */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar 
          src={contact.avatar_url} 
          name={`${contact.first_name} ${contact.last_name}`} 
          size="lg" 
        />
        <div>
          <h3 
            onClick={() => navigate(`/contacts/${contact.contact_id}`)}
            className="text-base font-bold text-slate-900 group-hover:text-brand-600 cursor-pointer transition-colors"
          >
            {contact.first_name} {contact.last_name}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {contact.job_title || 'Professional'} {contact.company ? `at ${contact.company}` : ''}
          </p>
        </div>
      </div>
      
      {/* Relationship Type Badge */}
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
        {contact.relationship_type}
      </span>
    </div>

    {/* Relationship Strength Gauge */}
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium">Relationship Health</span>
        <span className="font-bold text-slate-700">{contact.relationship_strength}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            contact.relationship_strength >= 75 ? 'bg-emerald-500' :
            contact.relationship_strength >= 45 ? 'bg-brand-500' : 'bg-amber-500'
          }`}
          style={{ width: `${contact.relationship_strength}%` }}
        />
      </div>
    </div>

    {/* Timelines & Follow-ups */}
    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>
        Last: {contact.last_interaction_at ? formatDate(contact.last_interaction_at) : 'Never'}
      </span>
      {contact.next_follow_up_at && (
        <span className={`flex items-center gap-1 font-semibold ${
          new Date(contact.next_follow_up_at) <= new Date() ? 'text-amber-600' : 'text-slate-500'
        }`}>
          <Clock className="w-3 h-3" />
          {formatDate(contact.next_follow_up_at)}
        </span>
      )}
    </div>

    {/* Tag Pills */}
    {contact.tags && contact.tags.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {contact.tags.map(tag => (
          <span 
            key={tag.tag_id}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
          >
            #{tag.name}
          </span>
        ))}
      </div>
    )}
  </div>

  {/* Quick Actions Footer */}
  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
    <button 
      onClick={() => onLogInteraction(contact.contact_id)}
      className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-50"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      Log Touchpoint
    </button>
    <button 
      onClick={() => onDraftMessage(contact.contact_id)}
      className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-purple-50"
    >
      <Sparkles className="w-3.5 h-3.5" />
      AI Draft
    </button>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Calculated Touchpoint Decay:**
   - As days pass without interaction, the server/client adjusts relationship health.
   - Any logged interaction (`POST /api/interactions`) executes `UPDATE contacts SET relationship_strength = LEAST(100, relationship_strength + 5)`.
2. **Follow-up Due Detection:**
   - Evaluated as `new Date(contact.next_follow_up_at) <= new Date()`.
   - Triggers warning icon and high-priority badge.
3. **Optimistic Updates:**
   - Tag addition/removal uses TanStack Query `queryClient.setQueryData(['contacts'])` to instantly reflect UI changes before server confirmation.

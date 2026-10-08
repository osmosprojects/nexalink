# Frontend Card: AI Recommendation & Discovery Cards

## 1. Overview
The **AI Recommendation & Discovery Cards** populate the **Discover Network** interface (`frontend/src/pages/DiscoverPage.tsx`) and the dashboard's "Recommended for You" panel. They present algorithmic matches, explainable reasoning tags ("Why Recommended"), status controls (`pending`, `contacted`, `skipped`, `connected`), and 1-click conversion to CRM contacts.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Avatar]  Dr. Ananya Roy                       [88% Match]  |
|           Chief Medical Officer @ Apollo Digital            |
|           Bengaluru, India | Healthcare & AI                |
|-------------------------------------------------------------|
| Why Recommended:                                            |
| • Complementary focus on Healthcare AI & telemedicine        |
| • Common target market in Tier-1 metros                     |
|-------------------------------------------------------------|
| [Skip Profile]         [Save for Later]         [+ Connect] |
+-------------------------------------------------------------+
```

- **Interactive Status Flow:**
  - `Connect` triggers optimistic UI update $\rightarrow$ creates row in `contacts` table $\rightarrow$ fires celebratory confetti animation (`canvas-confetti`).
  - `Skip` fades out the card and removes it from active recommendations.

---

## 3. Data Schema & Types

```typescript
export interface Recommendation {
  recommendation_id: number;
  user_id: number;
  recommended_user_id: number;
  score: number;
  reason: string;
  reasons_list?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'contacted' | 'skipped' | 'connected';
  created_at: string;
  name: string;
  job_title?: string;
  company?: string;
  avatar_url?: string | null;
  industry?: string;
  skills?: string[];
}
```

---

## 4. Component Code Implementation

```tsx
{/* Discovery & Recommendation Card */}
<div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-card hover:shadow-soft transition-all space-y-4 flex flex-col justify-between">
  <div>
    {/* Identity Header */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar src={rec.avatar_url} name={rec.name} size="lg" />
        <div>
          <h4 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors cursor-pointer">
            {rec.name}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {rec.job_title || 'Leader'} {rec.company ? `at ${rec.company}` : ''}
          </p>
          {rec.industry && (
            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {rec.industry}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl">
          {rec.score}%
        </span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Synergy</span>
      </div>
    </div>

    {/* Explainability Block: Why Recommended */}
    <div className="mt-4 bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5">
      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-500" />
        Why Recommended:
      </div>
      <p className="text-slate-600 leading-snug">{rec.reason}</p>
      {rec.reasons_list && rec.reasons_list.length > 0 && (
        <ul className="list-disc list-inside text-[11px] text-slate-500 pt-1 space-y-0.5">
          {rec.reasons_list.slice(0, 2).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>

    {/* Skill Tags */}
    {rec.skills && rec.skills.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1">
        {rec.skills.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {skill}
          </span>
        ))}
      </div>
    )}
  </div>

  {/* Card Actions */}
  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
    <button
      onClick={() => handleSkip(rec.recommendation_id, rec.recommended_user_id)}
      className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
    >
      Skip
    </button>
    <button
      onClick={() => handleConnect(rec)}
      className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
    >
      <UserPlus className="w-3.5 h-3.5" />
      Connect
    </button>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Convert to Contact:**
   - POST to `/api/recommendations/:id/convert`.
   - Creates new contact record initialized with `relationship_strength: 50`.
   - Triggers celebratory UI fireworks with `confetti()`.
   - Invalidates `['recommendations']`, `['contacts']`, and `['dashboard']` caches.
2. **Skip Logic:**
   - POST to `/api/recommendations/skip/:skippedUserId`.
   - Persists status as `'skipped'` in MySQL to prevent the candidate from reappearing during subsequent cron or batch runs.

# Frontend Card: Profile & Persona Cards

## 1. Overview
The **Profile & Persona Cards** appear on the **Profile & Persona Page** (`frontend/src/pages/ProfilePage.tsx`) and the modal configurators (`UserProfileModal.tsx`, `ProfilePreviewModal.tsx`). They define the user's networking identity, target business domains sought, warm connection bridges offered, communication style, and privacy discoverability toggles.

---

## 2. Visual & Structural Specifications

```text
+-------------------------------------------------------------+
| [Avatar]  Sanjeev Sarma — Tech Advisor @ NexaLink           |
|           Bengaluru, India | Strategy & Scaling             |
|-------------------------------------------------------------|
| Target Businesses Sought:                                   |
| [Enterprise SaaS] [FinTech] [AI Software]                   |
|-------------------------------------------------------------|
| Connections Offered (Your Bridges):                         |
| • Rohan Mehta (VP Eng @ SaaSify Global) — Former Colleague  |
| • Dr. Ananya Roy (CMO @ Apollo Digital) — Advisor           |
|-------------------------------------------------------------|
| Persona & Communication Style:                              |
| "Concise & Strategic" • Networking Goal: "Series-A Angels"  |
|-------------------------------------------------------------|
| [Edit Profile]          [Manage Bridges]         [Preview]  |
+-------------------------------------------------------------+
```

---

## 3. Data Schema & Types

```typescript
export interface UserProfile {
  profile_id: number;
  user_id: number;
  headline: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  industry: string | null;
  avatar_url: string | null;
  skills: any; // JSON containing skills, targetBusinesses, connectionsOffered
  interests: any;
  networking_goals: any;
}

export interface UserPersona {
  persona_id: number;
  user_id: number;
  persona_name: string;
  communication_style: string;
  preferred_people: string | null;
  networking_goal: string | null;
  interests: string | null;
  confidence: number;
  is_active: number | boolean;
}
```

---

## 4. Component Code Implementation

```tsx
{/* Persona Configuration Card */}
<div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card space-y-5">
  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
    <div>
      <h3 className="text-base font-bold text-slate-900">Networking Persona & Tone</h3>
      <p className="text-xs text-slate-500 font-medium">Controls how the AI assistant shapes messages and recommendations</p>
    </div>
    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
      {persona.communication_style}
    </span>
  </div>

  <div className="space-y-4">
    <div>
      <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Objective</label>
      <div className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        {persona.networking_goal || 'Build meaningful professional relationships'}
      </div>
    </div>

    <div>
      <label className="text-xs font-semibold text-slate-700 block mb-1">Ideal Connections Sought</label>
      <div className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        {persona.preferred_people || 'Founders, CTOs, Angel Investors'}
      </div>
    </div>
  </div>
</div>
```

---

## 5. Logic & State Handlers

1. **Gated Access Middleware:**
   - NexaLink enforces profile completeness. If `user_profiles` or `user_personas` is incomplete, the backend middleware `requireProfileCompleteMiddleware` redirects/blocks access to downstream CRM modules.
2. **Taxonomy Ingestion:**
   - Bridges entered in `connectionsOffered` are indexed by the `AutoConnectEngine` to power reciprocal discovery across the network.

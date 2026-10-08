# Frontend Card: AutoConnect Matchmaking Card

## 1. Overview
The **AutoConnect Matchmaking Card** is the centerpiece networking engine rendered on the Dashboard (`frontend/src/pages/DashboardPage.tsx`) and the Discover Page (`frontend/src/pages/DiscoverPage.tsx`). It solves the "cold outreach" problem by identifying warm 2nd-degree introductions through mutual bridges and complementary skills.

---

## 2. Visual & Structural Specifications

```text
+---------------------------------------------------------------------------------+
| [Zap] AI AutoConnect Matchmaker               [95% Match] [Reverse Match Badge] |
| Connect with target founders and executives via trusted mutual network bridges  |
|---------------------------------------------------------------------------------|
| Candidate Profile:                                                              |
| [Avatar] Sanjeev Sarma — Strategic Director & Tech Advisor @ NexaLink           |
| Offers Warm Intro to:                                                           |
| +-----------------------------------------------------------------------------+ |
| | [Bridge Icon] Rohan Mehta (VP Engineering @ SaaSify Global)                 | |
| | Relationship: Former Colleague  | Domain: Enterprise SaaS  | City: Mumbai   | |
| +-----------------------------------------------------------------------------+ |
| Strategic Reason:                                                               |
| "Sanjeev offers direct access to enterprise SaaS leaders aligning with your     |
|  current target business expansion goals."                                     |
|---------------------------------------------------------------------------------|
| [Copy Warm Intro Draft]    [Send Intro Request]    [Direct Connect]             |
+---------------------------------------------------------------------------------+
```

- **Gradient Accents:** Subtle purple/indigo border with high-contrast badge indicators.
- **Match Score Gauges:**
  - 95%: Substring / Domain Direct Hit (Green/Purple badge)
  - 50–90%: Weighted Token Overlap Ratio
- **Reverse Match Pill:** Indicates when a network member is actively searching for the user's specific skill sets or offerings.

---

## 3. Data Schema & Types

```typescript
export interface ConnectionBridge {
  id?: string;
  businessDomain: string;
  personName: string;
  orgName: string;
  role: string;
  city?: string;
  relationshipContext?: string;
  relationship?: string;
}

export interface AutoConnectRecommendation {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  userCompany: string;
  userAvatar?: string | null;
  matchScore: number;
  isReverseMatch: boolean;
  targetQuery: string;
  bridgePerson: ConnectionBridge;
  reason: string;
  introEmailDraft: string;
}
```

---

## 4. Component Code Implementation

```tsx
{/* AutoConnect Recommendation Card */}
<div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border border-purple-200/70 p-6 shadow-card hover:shadow-soft transition-all space-y-4">
  {/* Card Header */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <Avatar src={rec.userAvatar} name={rec.userName} size="md" />
      <div>
        <h4 className="text-base font-bold text-slate-900">{rec.userName}</h4>
        <p className="text-xs text-slate-500 font-medium">
          {rec.userRole} {rec.userCompany ? `at ${rec.userCompany}` : ''}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      {rec.isReverseMatch && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
          Reverse Match
        </span>
      )}
      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-purple-600" />
        {rec.matchScore}% Match
      </span>
    </div>
  </div>

  {/* Connection Bridge Sub-Card */}
  <div className="bg-white/80 rounded-2xl border border-purple-100 p-4 space-y-2">
    <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
      <span className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-purple-600" />
        Offers Warm Intro to:
      </span>
      <span className="text-slate-400 font-normal">{rec.bridgePerson.businessDomain}</span>
    </div>
    <div className="text-sm font-bold text-slate-900">
      {rec.bridgePerson.personName}
      <span className="text-xs font-normal text-slate-500 ml-1.5">
        ({rec.bridgePerson.role} at {rec.bridgePerson.orgName})
      </span>
    </div>
    {rec.bridgePerson.relationship && (
      <p className="text-xs text-slate-500">
        Relationship context: <span className="font-medium text-slate-700">{rec.bridgePerson.relationship}</span>
      </p>
    )}
  </div>

  {/* Explainable AI Reasoning */}
  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
    <span className="font-semibold text-slate-800">Why recommended: </span>
    {rec.reason}
  </p>

  {/* Card Actions */}
  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
    <button
      onClick={() => openWarmIntroModal(rec)}
      className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-200/80 rounded-xl transition-colors flex items-center gap-1.5"
    >
      <Mail className="w-3.5 h-3.5" />
      View Intro Draft
    </button>
    <button
      onClick={() => handleDirectConnect(rec.userId)}
      className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
    >
      <Users className="w-3.5 h-3.5" />
      Connect
    </button>
  </div>
</div>
```

---

## 5. Logic & State Flow

1. **Algorithm Invocation:**
   - Client executes `generateAutoConnectRecommendations(userProfile, networkMembers)`.
   - Normalizes search target queries (`targetBusinesses`) against candidate bridges (`connectionsOffered`).
2. **Reverse Match Detection:**
   - Tests if candidate's `targetBusinesses` match user's industry, domain, or skills.
   - Sets `isReverseMatch = true` when bidirectional synergy occurs.
3. **Draft Generation:**
   - Synthesizes personalized intro templates referencing mutual connection name and domain.
4. **Interactive Action:**
   - Clicking "Connect" converts recommendation into CRM Contact (`POST /api/recommendations/:id/convert`).

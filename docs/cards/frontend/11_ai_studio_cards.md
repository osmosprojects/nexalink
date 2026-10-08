# Frontend Card: AI Assistant Studio Cards

## 1. Overview
The **AI Assistant Studio Cards** are the intelligence modules on the **AI Assistant Page** (`frontend/src/pages/AIAssistantPage.tsx`) and the Dashboard's Insight Card. They provide 4 dedicated networking capabilities:
1. **Conversation Preparation Studio Card**
2. **Smart Message Drafter Card**
3. **Meeting Summarizer Card**
4. **Proactive Relationship Insight Card**

---

## 2. Visual & Structural Specifications

```text
+---------------------------------------------------------------------------------+
| [Sparkles] AI Message Drafter Studio                                            |
| Select Contact: [Rohan Mehta]  | Purpose: [Follow-up]  | Tone: [Warm & Concise] |
|---------------------------------------------------------------------------------|
| Generated Subject: "Great chatting yesterday — follow up on API spec"          |
|                                                                                 |
| "Hi Rohan,                                                                      |
|  It was great speaking yesterday. Following up on our discussion around the     |
|  API specifications, I've linked the draft overview here. Looking forward to   |
|  your thoughts!"                                                                |
|---------------------------------------------------------------------------------|
| [Copy to Clipboard]      [Regenerate Draft]      [Save as Interaction Note]     |
+---------------------------------------------------------------------------------+
```

- **Styling Accents:** Rich gradient purple/slate card surfaces (`from-purple-900 via-indigo-950 to-slate-900` for primary insight card, crisp white cards with purple accents in studio).

---

## 3. Data Schema & Types

```typescript
export interface ConversationSuggestion {
  contact_name: string;
  opener: string;
  discussion_questions: string[];
  suggested_follow_up: string;
  topics_to_avoid: string[];
  strategic_value: string;
}

export interface DraftMessage {
  purpose: string;
  tone: string;
  subject?: string;
  draft: string;
  key_points: string[];
}

export interface MeetingSummary {
  summary: string;
  key_takeaways: string[];
  decisions: string[];
  action_items: { task: string; due_days: number; priority: string }[];
  suggested_follow_up_date: string;
}

export interface RelationshipInsight {
  insight_type: string;
  title: string;
  description: string;
  suggested_action: string;
  urgency: 'high' | 'medium' | 'low';
}
```

---

## 4. Component Code Implementation

```tsx
{/* AI Executive Insight Card (Dashboard) */}
<div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl shadow-purple-900/10 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
      <Sparkles className="w-5 h-5" />
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
          AI Networking Intelligence
        </span>
        {insight.urgency === 'high' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Action Recommended
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-white mt-1">{insight.title}</h3>
      <p className="text-xs text-purple-200/80 mt-1 leading-relaxed max-w-2xl">
        {insight.description}
      </p>
    </div>
  </div>

  <button
    onClick={() => handleExecuteInsight(insight)}
    className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap self-end sm:self-center"
  >
    {insight.suggested_action || 'Review Strategy'}
  </button>
</div>
```

---

## 5. Logic & State Handlers

1. **Safety Controls:**
   - AI outputs are never dispatched automatically. The user reviews, copies, or edits generated drafts before sending.
2. **Context Enrichment:**
   - When drafting, the service ingests the user's Persona (`user_personas`), the contact's dossier (`contacts`), and recent interaction outcomes (`interactions`).

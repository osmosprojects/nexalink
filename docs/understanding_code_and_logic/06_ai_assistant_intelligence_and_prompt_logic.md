# AI Assistant Intelligence & Prompt Logic Deep Dive

## 1. Overview & Service Boundary

In NexaLink CRM, AI features are isolated within a dedicated service layer (`backend/src/services/AIService.ts`). The core CRM entities are never tightly coupled to third-party LLM APIs. 

### Core Product Principles:
1. **AI Assists, User Controls:** The AI assistant never automatically dispatches an email, sends a message, or mutates sensitive records. All outputs are presented to the user for review.
2. **Deterministic Fallbacks:** The platform maintains rule-based procedural fallbacks ensuring uninterrupted user experience even when LLM endpoints are unreachable or in test environments.
3. **Strict JSON Schema Contracts:** AI responses conform to structured TypeScript interfaces, preventing unstructured text hallucinations.

---

## 2. Ingestion Context Architecture

When an AI endpoint is invoked, `AIService` assembles a holistic context payload:

```text
+-------------------------------------------------------------+
| Context Component              Source Table / Field         |
+-------------------------------------------------------------+
| 1. User Communication Persona  user_personas                |
|    - Tone & Style              communication_style          |
|    - Primary Networking Goal   networking_goal              |
|    - Preferred Counterparties  preferred_people             |
|                                                             |
| 2. Contact Dossier             contacts                     |
|    - Identity & Company        first_name, job_title, company|
|    - Relationship Type         relationship_type            |
|    - Relationship Strength     relationship_strength        |
|                                                             |
| 3. Historical Touchpoints      interactions                 |
|    - Recent topics discussed   summary, outcome, date       |
|                                                             |
| 4. Qualitative Memos           notes                        |
|    - Pinned context            title, content               |
+-------------------------------------------------------------+
```

---

## 3. Capabilities & Prompt Engineering Logic

### A. Conversation Preparation (`getConversationSuggestions`)
- **Objective:** Give the user talking points, openers, and strategic questions before entering a meeting or call.
- **Output Schema:**
  ```typescript
  interface ConversationSuggestionResult {
    contact_name: string;
    opener: string;
    discussion_questions: string[];
    suggested_follow_up: string;
    topics_to_avoid: string[];
    strategic_value: string;
  }
  ```
- **Context Injection:**
  ```text
  Contact: Rohan Mehta (VP Engineering @ SaaSify Global)
  Relationship: Founder to Colleague (Strength: 75%)
  Last Touchpoint: Discussed scaling bottlenecks on AWS
  User Goal: "Raise Series A from enterprise SaaS angels"
  ```
- **Generated Behavioral Advice:**
  - *Opener:* Connects directly to the previous touchpoint.
  - *Discussion Questions:* Probes bottlenecks relevant to their role.
  - *Topics to Avoid:* Recommends avoiding premature commercial pitches.

### B. Smart Message Drafter (`draftMessage`)
- **Supported Purposes:** `follow_up`, `intro`, `thank_you`, `meeting_request`, `reconnect`.
- **Supported Tones:** `professional`, `warm`, `concise`.
- **Logic:**
  ```typescript
  // Dynamically selects tone modifier based on Persona
  const toneInstruction = persona.communication_style === 'Concise & Strategic'
    ? 'Keep under 80 words. Direct call to action.'
    : 'Warm, collegiate tone with personal sign-off.';
  ```

### C. Meeting Summarizer (`summarizeMeeting`)
- **Objective:** Ingest unstructured notes and agendas, and distill them into actionable outcomes.
- **Output Schema:**
  ```typescript
  interface MeetingSummaryResult {
    summary: string;
    key_takeaways: string[];
    decisions: string[];
    action_items: { task: string; due_days: number; priority: string }[];
    suggested_follow_up_date: string;
  }
  ```
- **Inter-Module Integration:** Clicking "Apply Action Items" in the UI instantly dispatches each extracted action item into the `tasks` Kanban board.

### D. Proactive Relationship Insights (`getRelationshipInsights`)
- Scans `contacts` for dormant high-value relationships:
  $$\text{Dormancy Trigger} = (\text{relationship\_strength} \ge 60) \land (\text{last\_interaction\_at} \le \text{NOW}() - 45\text{ days})$$
- Generates high-priority cards on the Dashboard: *"Rekindle touchpoint with Sarah Chen (Dormant for 48 days)"*.

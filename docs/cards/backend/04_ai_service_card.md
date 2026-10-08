# Backend Card: AI Intelligence Service Card

## 1. Overview
The **AI Intelligence Service** (`backend/src/services/AIService.ts`) serves as an isolated intelligence boundary. It aggregates raw relational data (user profile, communication persona, recent interactions, notes, and goals), compiles context payloads, and generates structured advice, drafts, and summaries.

- **Primary Source Files:**
  - Controller: `backend/src/controllers/AIController.ts`
  - Service: `backend/src/services/AIService.ts`
  - Routes: `/api/ai/*`

---

## 2. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/ai/conversation/suggestions` | Generates conversation openers, discussion topics, and traps to avoid |
| `POST` | `/api/ai/message/draft` | Drafts personalized emails/messages (follow-up, intro, thank-you) |
| `POST` | `/api/ai/meeting/summarize` | Summarizes meeting discussion into takeaways and action items |
| `GET` | `/api/ai/insights` | Generates proactive relationship alerts (e.g. cold contact rekindle) |
| `GET` | `/api/ai/goals/suggestions` | Generates goal recommendations based on user's current network composition |

---

## 3. Context Ingestion Architecture

```text
[ user_personas ]  ---> Communication Style, Tone, Goals
[ contacts ]       ---> Target Role, Company, Relationship Health
[ interactions ]   ---> Last 3 touchpoints, outcomes, dates
[ notes ]          ---> Pinned notes, private context
           \             /
            \           /
      [ AIService Context Aggregator ]
                    |
      [ Structured AI Generator / Engine ]
                    |
      [ Strictly Typed JSON Output Schema ]
```

---

## 4. Sample Code Implementation

```typescript
// backend/src/services/AIService.ts
export class AIService {
  static async draftMessage(
    userId: number,
    params: {
      contact_id: number;
      purpose: 'follow_up' | 'intro' | 'thank_you' | 'meeting_request' | 'reconnect';
      tone?: 'professional' | 'warm' | 'concise';
      context?: string;
    }
  ): Promise<DraftMessageResult> {
    const contact = await ContactRepository.getById(userId, params.contact_id);
    if (!contact) throw new Error('Contact not found');

    const persona = await ProfileRepository.getPersonaByUserId(userId);
    const tone = params.tone || persona?.communication_style || 'professional';
    const purpose = params.purpose || 'follow_up';
    const name = contact.first_name;
    const company = contact.company || 'your team';

    // Generates tailored draft conforming to DraftMessageResult
    // Structured JSON response guarantees safety and formatting consistency
    return {
      purpose,
      tone,
      subject: `Following up — ${contact.first_name} & ${persona?.persona_name || 'NexaLink'}`,
      draft: `Hi ${name},\n\nHope your week is going well at ${company}...`,
      key_points: ['Acknowledged recent milestone', 'Proposed actionable follow-up'],
    };
  }
}
```

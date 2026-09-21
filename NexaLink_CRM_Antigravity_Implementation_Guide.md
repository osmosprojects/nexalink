# NexaLink CRM — Product & Engineering Implementation Guide

**Project Name:** NexaLink CRM  
**Product Tagline:** Build Meaningful Connections. Track Relationships. Achieve Your Goals.  
**Version:** 1.0  
**Implementation Target:** React + Node.js tooling + PHP REST API + MySQL  
**Development Assistant:** Antigravity  
**UI Strategy:** Mobile-first, responsive, modern SaaS interface  
**Database Strategy:** MySQL with SQL only — no ORM/query builder required  
**Authentication:** OAuth 2.0 / OpenID Connect (Google and Microsoft-ready)

---

## 1. Product Vision

NexaLink CRM is an AI-powered networking and relationship-management platform designed to help users:

- Build and organize professional relationships.
- Discover relevant people and networking opportunities.
- Track meetings, calls, emails and other interactions.
- Set measurable networking goals.
- Manage follow-ups.
- Use Kanban, Calendar, Tasks and Notes as productivity tools.
- Receive AI-assisted suggestions for conversations and follow-ups.
- Understand relationship strength and engagement over time.
- Measure network growth and goal progress.

The application should feel like a combination of:

- Personal CRM
- Networking assistant
- Relationship intelligence platform
- Lightweight productivity workspace
- AI networking coach

The first release should focus on a clean, reliable core CRM and productivity experience. AI functionality should be designed as a separate service boundary so it can evolve without restructuring the core application.

---

# 2. Product Principles

1. **Mobile first**
   - Design for 360px+ widths first.
   - Desktop should be an expansion of the mobile experience.
   - No horizontal scrolling for primary workflows.
   - Touch targets should generally be at least 44px.

2. **Relationship first**
   - A person and the relationship with that person are more important than generic CRM records.
   - Every contact should have a clear timeline.

3. **Action oriented**
   - The UI should always make the next action obvious:
     - Follow up
     - Schedule meeting
     - Add interaction
     - Add task
     - Set goal
     - Send message
     - Add note

4. **AI assists, user controls**
   - AI suggestions must never silently send messages or change important records.
   - Users must review AI-generated content before external communication.

5. **Simple data ownership**
   - Every user-owned record must be scoped by `user_id`.
   - API queries must never expose another user's private records.

6. **SQL-first backend**
   - Use MySQL.
   - Use PDO prepared statements.
   - No ORM.
   - No Prisma.
   - No Sequelize.
   - No Laravel/Eloquent dependency is required for the initial implementation.

---

# 3. Recommended Technology Stack

## Frontend

- React
- Vite
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React
- Recharts
- dnd-kit for Kanban drag/drop
- FullCalendar or a lightweight calendar component
- date-fns

## Backend

- PHP 8.2+
- REST API
- PDO
- MySQL 8+
- PHP sessions or secure access-token architecture
- OAuth 2.0 / OpenID Connect
- PHPMailer or an existing transactional email provider if required

## Development tooling

- Node.js / npm
- Vite development server
- ESLint
- Prettier
- Git
- Antigravity for implementation assistance

### Important architecture decision

Node.js is used for the React development/build ecosystem.

The production business API should be PHP.

Do **not** introduce a second Node.js API server unless there is a specific future requirement.

---

# 4. High-Level Architecture

```text
                    ┌───────────────────────────────┐
                    │          React Web App         │
                    │      Mobile-first UI          │
                    └───────────────┬───────────────┘
                                    │ HTTPS REST/JSON
                                    ▼
                    ┌───────────────────────────────┐
                    │          PHP API Layer         │
                    │                               │
                    │ Auth / Users / CRM / Goals    │
                    │ Interactions / Tasks / AI     │
                    └───────────────┬───────────────┘
                                    │ PDO + SQL
                                    ▼
                    ┌───────────────────────────────┐
                    │          MySQL Database        │
                    │                               │
                    │ Users / Profiles / CRM        │
                    │ Goals / Tasks / Meetings      │
                    │ Posts / Recommendations       │
                    └───────────────┬───────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
          OAuth Providers      Email Service       AI Provider
        Google / Microsoft     Notifications       LLM API
```

---

# 5. Application Modules

The initial application should contain these modules.

| Module | Purpose |
|---|---|
| Authentication | Signup, login, OAuth, logout, session management |
| User Profile | Personal details and preferences |
| AI Profile / Persona | Interests, skills, goals, networking preferences |
| Network Discovery | Search, recommendations and filters |
| Connections | Manage people and relationship state |
| Relationship CRM | Notes, tags, relationship history |
| Interaction Tracking | Meetings, calls, emails, messages and outcomes |
| Meeting Tracking | Meeting-specific details and linked goals |
| Goal Engine | Networking goals and progress |
| Productivity | Kanban, Calendar, Tasks, Notes |
| Feed | Networking activity and useful content |
| AI Assistant | Suggestions, drafts, insights and summaries |
| Analytics | Network growth and engagement metrics |
| Notifications | Reminders and follow-up alerts |
| Settings | Account, privacy, integrations and preferences |

---

# 6. Primary Navigation

## Desktop

Use a left sidebar:

```text
NexaLink
────────────────────
Dashboard
Discover
Connections
Interactions
Goals
Productivity
    Kanban
    Calendar
    Tasks
    Notes
AI Assistant
Feed
Analytics
────────────────────
Settings
Profile
Logout
```

## Mobile

Use:

- Top app bar
- Back button when applicable
- Search/action button
- Bottom navigation for the most important sections

Recommended bottom navigation:

```text
Home | Discover | Connections | Tasks | More
```

The `More` screen contains:

- Interactions
- Goals
- Calendar
- Kanban
- Notes
- AI Assistant
- Feed
- Analytics
- Settings

---

# 7. UI / Visual Design System

## Design direction

The uploaded PRD visual uses a blue/purple SaaS style. Keep that overall direction but make the actual application cleaner and less dense than the PRD infographic.

### Suggested colors

```text
Primary:        #2563EB
Primary Dark:   #1D4ED8
Secondary:      #7C3AED
Accent Cyan:    #06B6D4

Success:        #16A34A
Warning:        #F59E0B
Danger:         #DC2626

Background:     #F8FAFC
Surface:        #FFFFFF
Surface Muted:  #F1F5F9

Text Primary:   #0F172A
Text Secondary: #64748B
Border:         #E2E8F0
```

Do not hard-code colors throughout components. Create design tokens.

## Typography

Recommended:

- Inter
- Geist
- System UI fallback

Use clear hierarchy:

```text
Display: 32–40px
Page title: 24–30px
Section title: 18–22px
Body: 14–16px
Caption: 12–13px
```

## Border radius

```text
Small: 8px
Medium: 12px
Large: 16px
Cards: 16–20px
```

## Shadows

Use subtle shadows only.

Avoid excessive gradients, glassmorphism and heavy visual effects.

---

# 8. Mobile-First Responsive Rules

All components must be developed mobile-first.

## Breakpoints

```text
xs: 360px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Mobile rules

At 360–639px:

- Single-column layouts.
- Cards become full width.
- Tables become cards or horizontally scrollable only when unavoidable.
- Sidebar becomes drawer.
- Bottom navigation is visible.
- Filters become a bottom sheet.
- Modals become full-screen sheets.
- Kanban becomes horizontally scrollable columns.
- Calendar uses agenda/day views by default.
- Forms use one column.
- Action buttons should be sticky where useful.

## Tablet rules

At 768–1023px:

- Two-column cards where useful.
- Sidebar can become collapsible.
- Calendar can use week view.
- Dashboard widgets use responsive grid.

## Desktop rules

At 1024px+:

- Persistent sidebar.
- Multi-column dashboard.
- Full calendar.
- Full Kanban board.
- Relationship timeline and profile panels can sit side-by-side.

---

# 9. Dashboard

The dashboard is the user's command center.

## Header

```text
Good morning, Rahul 👋

What would you like to accomplish today?

[ Search people, companies, notes... ] [+ Add]
```

## KPI cards

```text
Connections
128

Active Relationships
46

Follow-ups Due
7

Goals
68% complete
```

## Today's actions

Show:

- Follow-ups due today
- Upcoming meetings
- Tasks
- Suggested connections
- Recent interactions

## AI insight card

Example:

```text
AI Networking Insight

You haven't interacted with 4 high-value connections
in the last 30 days.

[Review Connections]
```

AI content must be presented as a suggestion, not as an authoritative judgment.

---

# 10. Authentication

## Supported methods

### Email/password

Optional if required.

### OAuth

Initial providers:

- Google
- Microsoft

Architecture should allow future:

- Apple
- LinkedIn
- GitHub

## OAuth flow

```text
React
  │
  │ GET /api/auth/google
  ▼
PHP API
  │
  │ Redirect
  ▼
Google
  │
  │ Callback
  ▼
PHP OAuth Callback
  │
  ├── Validate authorization code
  ├── Retrieve provider profile
  ├── Find/create user
  ├── Create secure session
  └── Redirect React
```

## Security requirements

- HTTPS required in production.
- OAuth `state` validation.
- PKCE where supported/recommended.
- Validate `id_token` / user identity from the provider.
- Never trust email/name values sent directly by the frontend.
- Never store OAuth client secrets in React.
- Store secrets in PHP environment/configuration outside public web root.
- Use secure, HttpOnly cookies for session identifiers.
- Use `SameSite=Lax` or stricter where compatible.
- Set `Secure` in production.
- Regenerate session ID after login.
- Implement logout.
- Do not expose provider access tokens to React unless explicitly required.
- Store only the provider data needed by the product.

---

# 11. Authentication Database Tables

## users

```sql
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    display_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
);
```

## oauth_accounts

```sql
CREATE TABLE oauth_accounts (
    oauth_account_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_oauth_provider_user (provider, provider_user_id),
    KEY idx_oauth_user (user_id),

    CONSTRAINT fk_oauth_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);
```

---

# 12. User Profile

## user_profiles

Fields:

- profile_id
- user_id
- headline
- bio
- company
- job_title
- location
- industry
- website
- linkedin_url
- phone
- timezone
- avatar_url
- created_at
- updated_at

## Profile UI

```text
Your Profile

[Avatar]

Rahul Mehta
Software Engineer

Google

About
....................................

Skills
[React] [Node.js] [AI] [SaaS]

Interests
[Startups] [Technology] [Product]

Networking Goals
[Meet founders]
[Find mentors]
[Grow professional network]

[Edit Profile]
```

---

# 13. AI Profile / Persona

The persona describes how the user wants to network.

## user_personas

Suggested fields:

- persona_id
- user_id
- persona_name
- description
- version
- is_active
- created_at
- updated_at

## persona_attributes

Suggested fields:

- attribute_id
- persona_id
- attribute_key
- attribute_value
- confidence
- created_at

Examples:

```text
communication_style = concise
preferred_people = founders, product leaders
interests = AI, SaaS, startups
networking_goal = build strategic relationships
```

Do not use AI-generated persona information as factual identity data without user confirmation.

---

# 14. Connections / People CRM

A connection is a person the user has discovered, added or interacted with.

## connections

Suggested fields:

- connection_id
- requester_user_id
- receiver_user_id
- status
- source
- connected_at
- created_at
- updated_at

Statuses:

```text
pending
accepted
declined
blocked
archived
```

## Important

For a personal CRM, users may also need to track external contacts who are not registered users.

Create a separate contact model if required:

```text
contacts
```

This avoids forcing every networking contact to create a NexaLink account.

---

# 15. External Contacts

## contacts

Suggested fields:

- contact_id
- user_id
- first_name
- last_name
- email
- phone
- company
- job_title
- location
- website
- linkedin_url
- avatar_url
- relationship_type
- relationship_strength
- last_interaction_at
- next_follow_up_at
- notes
- created_at
- updated_at

Relationship types:

```text
friend
mentor
mentee
colleague
client
prospect
founder
investor
recruiter
partner
other
```

Relationship strength should be an explainable product metric, not an opaque AI score.

---

# 16. Tags

## tags

```text
tag_id
user_id
name
color
created_at
```

## contact_tags

```text
contact_id
tag_id
created_at
```

Examples:

```text
Potential Client
Mentor
Startup
AI
High Priority
Follow Up
Conference
```

---

# 17. Interaction Tracking

This is one of the core modules.

Supported interaction types:

```text
meeting
call
email
message
coffee
event
introduction
note
other
```

## interactions

Suggested fields:

- interaction_id
- user_id
- contact_id
- interaction_type
- title
- interaction_date
- duration_minutes
- summary
- outcome
- follow_up_required
- follow_up_date
- sentiment
- created_at
- updated_at

Do not automatically infer sensitive personal attributes from conversations.

---

# 18. Interaction Timeline

Contact detail should show:

```text
Rahul Mehta
Software Engineer @ Google

[Connect] [Add Interaction]

Relationship
Last interaction: 4 days ago
Next follow-up: Friday

Timeline
────────────────────────────
Sep 12
Meeting
Coffee Chat

Good discussion about AI networking.

Goal:
AI Network

────────────────────────────
Sep 05
Email
Shared Resources

────────────────────────────
Aug 30
Call
Product Discussion

Follow-up required
```

Tabs:

```text
Overview
Timeline
Interactions
Notes
Tasks
Goals
Files
```

---

# 19. Meetings

## meetings

Suggested fields:

- meeting_id
- user_id
- contact_id
- title
- meeting_type
- start_at
- end_at
- location
- meeting_url
- agenda
- outcome
- notes
- follow_up_date
- created_at
- updated_at

Meeting types:

```text
coffee
video
office
conference
phone
other
```

Meetings should optionally link to:

- Contact
- Goal
- Task
- Calendar event

---

# 20. Goal Engine

Goals should be measurable.

Examples:

```text
20 new connections this month
5 meaningful conversations
3 mentor introductions
10 follow-ups completed
4 industry events attended
```

## goals

Suggested fields:

- goal_id
- user_id
- title
- description
- goal_type
- target_value
- current_value
- unit
- start_date
- end_date
- status
- created_at
- updated_at

Statuses:

```text
active
completed
paused
cancelled
```

---

# 21. Goal Progress

## goal_progress

Suggested fields:

- progress_id
- goal_id
- progress_date
- progress_value
- notes
- created_at

Example:

```text
Goal:
20 New Connections

Current:
12 / 20

Progress:
████████████░░░░ 60%
```

---

# 22. Productivity Tools

NexaLink should include four productivity modules:

1. Kanban
2. Calendar
3. Tasks
4. Notes

---

# 23. Tasks

## tasks

Suggested fields:

- task_id
- user_id
- contact_id
- goal_id
- title
- description
- status
- priority
- due_date
- completed_at
- sort_order
- created_at
- updated_at

Statuses:

```text
todo
in_progress
done
cancelled
```

Priorities:

```text
low
medium
high
urgent
```

Example:

```text
To Do

Reach out to 5 AI founders
Follow up with Priya
Schedule meeting with Amit
Prepare for conference
```

---

# 24. Kanban Board

The Kanban board should support drag-and-drop.

Default columns:

```text
To Do
In Progress
Done
```

Allow custom columns later.

Every drag/drop action must persist through the API.

API:

```text
PATCH /api/tasks/{id}
```

Example payload:

```json
{
  "status": "in_progress",
  "sort_order": 120
}
```

Do not update the database directly from the browser.

---

# 25. Calendar

Calendar should aggregate:

- Meetings
- Tasks
- Follow-ups
- Goal deadlines

Views:

Mobile:

```text
Agenda
Day
```

Desktop:

```text
Month
Week
Day
Agenda
```

Calendar event colors should represent event type through semantic design tokens.

---

# 26. Notes

Notes can belong to:

- Contact
- Meeting
- Goal
- Task
- User

## notes

Suggested fields:

- note_id
- user_id
- contact_id
- meeting_id
- goal_id
- task_id
- title
- content
- is_pinned
- created_at
- updated_at

---

# 27. Networking Feed

The feed can contain:

- Connection activity
- Recommended people
- Saved content
- Networking opportunities
- User-created updates

Initial MVP should keep the feed simple.

Avoid building a complex social network until CRM adoption is validated.

---

# 28. Recommendations

Recommendation records should explain why a person is suggested.

## recommendations

Suggested fields:

- recommendation_id
- user_id
- contact_id
- recommended_user_id
- reason
- score
- status
- created_at

Example UI:

```text
Recommended for you

Priya Sharma

AI Product Manager

Why this person?

You both have interests in:
AI · SaaS · Product

[View Profile]
[Save]
[Dismiss]
```

Never represent recommendation scores as objective truth.

---

# 29. AI Service

The AI Service should be isolated behind a clean interface.

```text
AI Service
│
├── Conversation Service
├── Profile Intelligence
├── People Recommendation
├── Follow-up Suggestions
├── Message Drafting
├── Meeting Summary
├── Relationship Insights
├── Goal Suggestions
└── Productivity Suggestions
```

---

# 30. Conversation Service

This should be a first-class AI module.

## Purpose

Help users prepare for conversations with contacts.

Input:

- Contact profile
- Previous interactions
- Notes
- Company
- Role
- User persona
- Recent context
- User's goal

Output:

```text
Conversation Starter
Suggested Questions
Follow-up Ideas
Topics to Avoid
Suggested Next Step
```

Example:

```text
Conversation Assistant

You are meeting Priya tomorrow.

Suggested opener:
"How has your AI product work evolved since we last spoke?"

Questions:
1. What are you currently building?
2. What challenge are you seeing in AI adoption?
3. Which partnerships are you exploring?

Potential follow-up:
Share the AI networking research you discussed.

[Use Suggestion]
```

The user must remain in control of the final communication.

---

# 31. AI Message Drafting

The user can select:

```text
Draft follow-up
Draft introduction
Draft thank-you
Draft meeting request
Draft reconnect message
```

AI receives only the minimum required information.

Example:

```text
POST /api/ai/draft-message
```

Request:

```json
{
  "contact_id": 123,
  "purpose": "follow_up",
  "tone": "professional",
  "context": "We discussed AI product analytics."
}
```

Response:

```json
{
  "draft": "Hi Priya, great speaking with you..."
}
```

Do not send messages automatically.

---

# 32. AI Meeting Summary

User can paste meeting notes or provide an allowed transcript.

AI can return:

```text
Summary
Key Topics
Decisions
Action Items
Follow-up Date
Suggested Message
```

Before saving, show:

```text
AI-generated summary

[Edit]
[Save]
[Discard]
```

---

# 33. AI Relationship Insights

Possible insights:

```text
Follow-up overdue
Interaction frequency changed
Upcoming goal deadline
No recent interaction
Repeated conversation topic
Suggested reconnect
```

Use transparent language.

Prefer:

> "No interaction has been recorded with this contact for 45 days."

over:

> "Your relationship is failing."

---

# 34. AI Architecture

Use an adapter pattern:

```text
AIProviderInterface
        │
        ├── OpenAIProvider
        ├── FutureProvider
        └── MockAIProvider
```

PHP example concept:

```text
services/
    AI/
        AIProviderInterface.php
        OpenAIProvider.php
        ConversationService.php
        RecommendationService.php
        MessageDraftService.php
```

The React app must never contain an AI provider secret.

---

# 35. API Design

Base URL:

```text
/api
```

Return JSON.

## Standard response

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

---

# 36. Authentication API

```text
GET    /api/auth/me
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/microsoft
GET    /api/auth/microsoft/callback
POST   /api/auth/logout
POST   /api/auth/refresh
```

If password authentication is enabled:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

---

# 37. Profile API

```text
GET    /api/profile
PUT    /api/profile
PUT    /api/profile/persona
GET    /api/profile/preferences
PUT    /api/profile/preferences
```

---

# 38. Contacts API

```text
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/{id}
PUT    /api/contacts/{id}
DELETE /api/contacts/{id}

POST   /api/contacts/{id}/tags
DELETE /api/contacts/{id}/tags/{tagId}
```

Filters:

```text
search
company
industry
relationship_type
tag
last_interaction
follow_up_due
```

---

# 39. Interactions API

```text
GET    /api/interactions
POST   /api/interactions
GET    /api/interactions/{id}
PUT    /api/interactions/{id}
DELETE /api/interactions/{id}
```

---

# 40. Meetings API

```text
GET    /api/meetings
POST   /api/meetings
GET    /api/meetings/{id}
PUT    /api/meetings/{id}
DELETE /api/meetings/{id}
```

---

# 41. Goals API

```text
GET    /api/goals
POST   /api/goals
GET    /api/goals/{id}
PUT    /api/goals/{id}
DELETE /api/goals/{id}

POST   /api/goals/{id}/progress
GET    /api/goals/{id}/progress
```

---

# 42. Productivity API

## Tasks

```text
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

## Notes

```text
GET    /api/notes
POST   /api/notes
GET    /api/notes/{id}
PUT    /api/notes/{id}
DELETE /api/notes/{id}
```

## Calendar

```text
GET    /api/calendar/events
POST   /api/calendar/events
PUT    /api/calendar/events/{id}
DELETE /api/calendar/events/{id}
```

---

# 43. AI API

```text
POST /api/ai/conversation/suggestions
POST /api/ai/message/draft
POST /api/ai/meeting/summarize
POST /api/ai/contact/insights
POST /api/ai/recommendations
POST /api/ai/goal/suggestions
```

---

# 44. Dashboard API

Use a single aggregated endpoint for initial dashboard loading:

```text
GET /api/dashboard
```

Response:

```json
{
  "success": true,
  "data": {
    "stats": {},
    "tasks": [],
    "upcoming_meetings": [],
    "follow_ups": [],
    "recommendations": [],
    "ai_insights": []
  }
}
```

This reduces initial mobile network requests.

---

# 45. MySQL Database Design

Use normalized relational tables.

Core relationships:

```text
users
  │
  ├── user_profiles
  ├── user_personas
  │      └── persona_attributes
  │
  ├── contacts
  │      ├── contact_tags
  │      ├── interactions
  │      ├── meetings
  │      ├── notes
  │      └── tasks
  │
  ├── goals
  │      └── goal_progress
  │
  ├── tasks
  ├── notes
  ├── posts
  └── recommendations
```

---

# 46. Database Indexing Rules

Every large table must be reviewed for indexes.

Recommended examples:

```sql
CREATE INDEX idx_contacts_user
ON contacts(user_id);

CREATE INDEX idx_contacts_followup
ON contacts(user_id, next_follow_up_at);

CREATE INDEX idx_interactions_contact_date
ON interactions(contact_id, interaction_date);

CREATE INDEX idx_interactions_user_date
ON interactions(user_id, interaction_date);

CREATE INDEX idx_tasks_user_status
ON tasks(user_id, status);

CREATE INDEX idx_tasks_due_date
ON tasks(user_id, due_date);

CREATE INDEX idx_goals_user_status
ON goals(user_id, status);

CREATE INDEX idx_goal_progress_goal_date
ON goal_progress(goal_id, progress_date);
```

Do not add indexes blindly. Verify query patterns.

---

# 47. SQL-Only Backend Rules

The backend must use SQL directly.

Allowed:

```php
$stmt = $pdo->prepare(
    'SELECT contact_id, first_name, last_name
     FROM contacts
     WHERE user_id = :user_id
     ORDER BY updated_at DESC'
);

$stmt->execute([
    ':user_id' => $userId
]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

Not allowed:

- ORM
- Raw SQL concatenation with user input
- Dynamic SQL without validation
- Client-side database access
- Credentials in React
- SQL directly from browser

---

# 48. SQL Security

Always:

- Use PDO prepared statements.
- Validate request payloads.
- Validate IDs as integers.
- Use allowlists for sortable columns.
- Scope records by authenticated `user_id`.
- Use transactions for multi-table operations.
- Never concatenate user input into SQL.
- Avoid `SELECT *` for production API queries.
- Return only required columns.

Example:

```sql
SELECT
    contact_id,
    first_name,
    last_name,
    company,
    job_title,
    last_interaction_at,
    next_follow_up_at
FROM contacts
WHERE user_id = :user_id
ORDER BY updated_at DESC
LIMIT :limit OFFSET :offset;
```

---

# 49. PHP API Folder Structure

Recommended:

```text
backend/
├── public/
│   └── index.php
│
├── config/
│   ├── database.php
│   └── environment.php
│
├── routes/
│   ├── auth.php
│   ├── profile.php
│   ├── contacts.php
│   ├── interactions.php
│   ├── meetings.php
│   ├── goals.php
│   ├── tasks.php
│   ├── notes.php
│   └── ai.php
│
├── controllers/
│   ├── AuthController.php
│   ├── ProfileController.php
│   ├── ContactController.php
│   ├── InteractionController.php
│   ├── MeetingController.php
│   ├── GoalController.php
│   ├── TaskController.php
│   ├── NoteController.php
│   └── AIController.php
│
├── services/
│   ├── AuthService.php
│   ├── OAuthService.php
│   ├── ContactService.php
│   ├── InteractionService.php
│   ├── GoalService.php
│   ├── NotificationService.php
│   └── AI/
│       ├── AIProviderInterface.php
│       ├── OpenAIProvider.php
│       ├── ConversationService.php
│       ├── MessageDraftService.php
│       └── RecommendationService.php
│
├── repositories/
│   ├── UserRepository.php
│   ├── ContactRepository.php
│   ├── InteractionRepository.php
│   ├── GoalRepository.php
│   ├── TaskRepository.php
│   └── NoteRepository.php
│
├── middleware/
│   ├── AuthMiddleware.php
│   ├── CorsMiddleware.php
│   ├── RateLimitMiddleware.php
│   └── ErrorMiddleware.php
│
├── validators/
├── helpers/
└── database/
    ├── migrations/
    └── seeds/
```

---

# 50. React Folder Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── queryClient.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── cards/
│   │   └── charts/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── discovery/
│   │   ├── contacts/
│   │   ├── interactions/
│   │   ├── meetings/
│   │   ├── goals/
│   │   ├── tasks/
│   │   ├── kanban/
│   │   ├── calendar/
│   │   ├── notes/
│   │   ├── feed/
│   │   ├── ai/
│   │   └── analytics/
│   │
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   ├── pages/
│   └── main.tsx
│
├── public/
├── package.json
└── vite.config.ts
```

---

# 51. React Architecture Rules

Use feature-based architecture.

Do not create one giant:

```text
App.tsx
```

Instead:

```text
features/
  contacts/
    pages/
    components/
    hooks/
    api/
    types/
```

Use TanStack Query for server state.

Use React state/context only for local UI state where appropriate.

---

# 52. API Client

Create one API client.

Example:

```text
src/lib/api.ts
```

Responsibilities:

- Base URL
- JSON headers
- Credentials
- Error handling
- Authentication state
- Request timeout
- Standard response parsing

Do not duplicate `fetch()` logic in every component.

---

# 53. UI Components

Create reusable components:

```text
Button
Input
Textarea
Select
DatePicker
Modal
BottomSheet
Drawer
Tabs
Badge
Avatar
Card
EmptyState
Skeleton
Toast
Dropdown
SearchInput
Pagination
DataTable
Timeline
ProgressBar
StatCard
ConfirmDialog
```

Every component should be responsive.

---

# 54. Core Screens

## Authentication

```text
/login
/signup
/auth/callback
```

## Main

```text
/dashboard
/discover
/connections
/connections/:id
/interactions
/interactions/:id
/meetings
/meetings/:id
/goals
/goals/:id
/productivity
/kanban
/calendar
/tasks
/notes
/ai
/feed
/analytics
/profile
/settings
```

---

# 55. Contact Detail Mobile UI

Mobile screen:

```text
← Rahul Mehta                         ⋮

[Avatar]
Rahul Mehta
Software Engineer
Google

[Message] [Meeting] [Add Interaction]

Next Follow-up
Friday, Sep 18

Relationship
Last interaction 4 days ago

────────────────────
Timeline

Sep 12
Coffee Meeting
Good discussion...

Sep 05
Email
Shared Resources

Aug 30
Call
Product Discussion

────────────────────
AI Suggestions

[Prepare for next conversation]
[Draft follow-up]
```

Desktop can transform this into a two-column layout.

---

# 56. Discovery UI

Search:

```text
[ Search people, company, skill... ]

Filters:
Industry
Location
Role
Skills
Interests
Relationship
```

Person card:

```text
[Avatar]

Priya Sharma
AI Product Manager

Google
AI · SaaS · Product

Why recommended
Shared interest in AI and SaaS

[View]
[Connect]
```

---

# 57. Add Interaction Flow

Mobile:

```text
Add Interaction

Type
[Meeting ▼]

Contact
[Priya Sharma]

Date
[18 Sep 2026]

Title
[Product Discussion]

Summary
[....................]

Outcome
[....................]

Follow-up?
[✓]

Follow-up date
[25 Sep 2026]

Linked Goal
[AI Network ▼]

[Save Interaction]
```

After saving:

- Update timeline.
- Update `last_interaction_at`.
- Optionally create follow-up task.
- Update goal progress if applicable.

Use a transaction for related database changes.

---

# 58. Goal Creation Flow

```text
Create Goal

Title
20 New Connections

Goal Type
New Connections

Target
20

Start Date
01 Sep 2026

End Date
30 Sep 2026

[Create Goal]
```

AI can optionally suggest goals, but user approval is required.

---

# 59. Kanban UI

Desktop:

```text
TO DO              IN PROGRESS           DONE
────────────────   ─────────────────    ─────────────
Reach out to 5     Discussion with       Met with Karan
professionals     Rahul                 

Follow up with     Send introduction    Followed up
Priya              Neha → Vikram        with 3 contacts

Schedule meeting   Review partnership   Updated profile
with Amit          opportunity
```

Mobile:

- Horizontally scroll columns.
- Use drag-and-drop only if it remains usable on touch.
- Provide an accessible status-change menu as an alternative to drag/drop.

---

# 60. Calendar UI

Mobile default:

```text
September 2026

Today

10:00
Coffee with Rahul

14:00
Follow-up with Priya

17:00
Goal Review
```

Desktop:

```text
Month | Week | Day | Agenda
```

---

# 61. Analytics

Initial metrics:

```text
Total Connections
New Connections
Active Relationships
Interactions
Meetings
Follow-ups Completed
Goal Completion Rate
Average Interaction Frequency
User Retention
```

Charts:

- Network growth
- Interaction frequency
- Goal progress
- Follow-up completion
- Monthly activity

Avoid vanity metrics that do not help users act.

---

# 62. Notifications

Notification types:

```text
follow_up_due
meeting_reminder
goal_deadline
task_due
ai_suggestion
connection_request
```

## notifications

Suggested fields:

- notification_id
- user_id
- type
- title
- message
- entity_type
- entity_id
- is_read
- created_at

---

# 63. Search

Global search should search:

```text
Contacts
Companies
Interactions
Meetings
Tasks
Notes
Goals
```

Endpoint:

```text
GET /api/search?q=rahul
```

Return grouped results.

---

# 64. Empty States

Every module must have a useful empty state.

Example:

```text
No connections yet

Start building your network by adding
your first professional connection.

[Add Contact]
[Discover People]
```

Avoid blank white screens.

---

# 65. Loading States

Use:

- Skeleton cards
- Skeleton list
- Button loading state
- Optimistic UI only where safe

Never show a blank screen while API requests are loading.

---

# 66. Error Handling

Frontend:

```text
Network unavailable
Session expired
Validation failed
Permission denied
Server error
```

Show actionable messages.

Example:

```text
Your session has expired.

[Sign in again]
```

Backend should log technical details while exposing safe messages to users.

---

# 67. Authorization

Every authenticated endpoint must determine:

```text
authenticated user
```

Then query:

```sql
WHERE user_id = :authenticated_user_id
```

Never trust:

```text
user_id
```

from the request body for ownership.

Example:

Bad:

```json
{
  "user_id": 25,
  "title": "Task"
}
```

Better:

```json
{
  "title": "Task"
}
```

The backend obtains `user_id` from the authenticated session.

---

# 68. API Security

Implement:

- CORS allowlist
- CSRF protection where cookie-based state-changing requests require it
- Rate limiting
- Input validation
- Output encoding
- SQL injection protection
- Secure cookies
- OAuth state validation
- Authentication middleware
- Authorization checks
- Audit logging for security-sensitive operations

---

# 69. Audit Logging

Create:

```text
audit_logs
```

Suggested fields:

- audit_id
- user_id
- action
- entity_type
- entity_id
- metadata
- ip_address
- user_agent
- created_at

Do not log passwords, OAuth secrets, access tokens or sensitive message content unnecessarily.

---

# 70. Environment Variables

Frontend:

```text
VITE_API_BASE_URL=
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
```

Only public identifiers may be placed in frontend environment variables.

Backend:

```text
APP_ENV=
APP_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=

AI_PROVIDER=
AI_API_KEY=
```

Never commit secrets.

---

# 71. Deployment Model

## Frontend

Build:

```bash
npm run build
```

Deploy the generated:

```text
dist/
```

to the web server.

## PHP API

Deploy:

```text
backend/
```

behind HTTPS.

Recommended:

```text
https://app.example.com
https://api.example.com
```

or:

```text
https://example.com/
https://example.com/api/
```

The exact structure can depend on hosting.

---

# 72. Apache Rewrite Concept

If using Apache, route API requests to PHP.

Concept:

```text
/api/* → backend/public/index.php
```

Do not expose:

```text
config/
services/
repositories/
.env
database credentials
```

to the public web.

---

# 73. MySQL Migration Strategy

Never manually change production schema without a migration.

Use:

```text
database/migrations/
```

Example:

```text
001_create_users.sql
002_create_oauth_accounts.sql
003_create_profiles.sql
004_create_contacts.sql
005_create_tags.sql
006_create_interactions.sql
007_create_meetings.sql
008_create_goals.sql
009_create_goal_progress.sql
010_create_tasks.sql
011_create_notes.sql
012_create_notifications.sql
013_create_recommendations.sql
014_create_posts.sql
015_create_audit_logs.sql
```

Maintain a migration table:

```text
schema_migrations
```

---

# 74. Seed Data

Create development seed data:

- 1 demo user
- 10 contacts
- 20 interactions
- 5 tasks
- 3 goals
- 5 meetings
- Sample notes
- Sample AI suggestions

Do not seed production with fake personal data.

---

# 75. Database Transaction Example

When adding an interaction:

```text
BEGIN

INSERT interaction

UPDATE contact last_interaction_at

IF follow-up:
    INSERT task

IF linked goal:
    UPDATE goal progress

COMMIT
```

On any failure:

```text
ROLLBACK
```

---

# 76. Performance Requirements

Target:

```text
Initial mobile load: fast on 4G
API response: ideally < 500ms for normal CRUD
Dashboard: minimize request count
List pages: pagination required
Images: optimized
```

Use:

- Pagination
- Lazy loading
- Query indexes
- TanStack Query caching
- Debounced search
- Image optimization
- Code splitting

Never load all contacts at once.

---

# 77. Pagination

API:

```text
GET /api/contacts?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 128,
      "total_pages": 7
    }
  }
}
```

---

# 78. Accessibility

Must support:

- Keyboard navigation
- Screen readers
- Visible focus states
- Semantic HTML
- Accessible form labels
- Accessible dialogs
- Proper contrast
- Reduced motion preference
- Touch-friendly controls

Do not make icon-only controls without accessible labels.

---

# 79. Responsive Table Strategy

Do not force large desktop tables onto mobile.

Desktop:

```text
Date | Type | Title | Outcome | Goal
```

Mobile:

```text
Coffee Chat
Meeting · Sep 12

Outcome:
Good discussion

Goal:
AI Network
```

---

# 80. UX Rules for Forms

- Show field labels.
- Do not rely only on placeholders.
- Validate inline.
- Preserve entered data on validation failure.
- Disable submit during request.
- Show success confirmation.
- Handle server errors.
- Confirm destructive actions.

---

# 81. UX Rules for AI

Every AI result should include:

```text
AI suggestion
```

or:

```text
AI-generated
```

where appropriate.

Provide:

```text
Accept
Edit
Regenerate
Dismiss
```

AI should not:

- Send an email automatically.
- Send a message automatically.
- Delete CRM data.
- Modify a goal without confirmation.
- Change relationship records silently.

---

# 82. AI Context Policy

Only send relevant data to AI.

For example, conversation suggestions may require:

```text
Contact:
Name
Role
Company

Recent interactions:
Last 3–5 relevant interactions

User:
Networking goal
Persona/preferences
```

Do not send the entire database to an AI provider.

---

# 83. Privacy

Provide settings for:

```text
Profile visibility
Discoverability
AI data usage
Connected accounts
Notification preferences
Data export
Account deletion
```

Users should be able to understand what information is used by AI features.

---

# 84. OAuth Account Linking

If an existing user signs in using Google/Microsoft with a verified matching email:

- Do not blindly merge accounts.
- Use a controlled account-linking flow.
- Require confirmation where appropriate.

Example:

```text
An account already exists with this email.

Would you like to connect your Google account?

[Connect accounts]
[Cancel]
```

---

# 85. Testing Strategy

## Frontend

Test:

- Authentication
- Routing
- Forms
- Validation
- Contact CRUD
- Task CRUD
- Kanban movement
- Calendar rendering
- Responsive behavior
- AI loading/error states

## Backend

Test:

- Authentication
- Authorization
- SQL queries
- Validation
- Pagination
- Transactions
- OAuth callback
- Error handling

## Security tests

Verify:

```text
User A cannot access User B contact
User A cannot edit User B task
Invalid OAuth state rejected
SQL injection rejected
Unauthorized endpoint rejected
Expired session rejected
```

---

# 86. Required Definition of Done

A feature is complete only when:

- API endpoint works.
- SQL is parameterized.
- Authentication is enforced.
- Authorization is verified.
- Frontend UI works on mobile.
- Frontend UI works on desktop.
- Loading state exists.
- Empty state exists.
- Error state exists.
- Validation exists.
- Success feedback exists.
- Relevant tests exist.
- No console errors.
- No exposed secrets.
- No hardcoded user IDs.
- No direct database access from React.

---

# 87. Development Phases

## Phase 1 — Foundation

Build:

- React/Vite setup
- PHP API foundation
- MySQL connection
- Routing
- API client
- Design system
- Authentication shell
- OAuth integration
- User profile

Deliverable:

```text
User can sign in and reach dashboard.
```

---

## Phase 2 — Core CRM

Build:

- Contacts
- Tags
- Contact detail
- Timeline
- Notes
- Interactions
- Meetings

Deliverable:

```text
User can create a contact and maintain a complete relationship timeline.
```

---

## Phase 3 — Goals + Productivity

Build:

- Goals
- Goal progress
- Tasks
- Kanban
- Calendar
- Notes

Deliverable:

```text
User can convert networking intentions into measurable actions.
```

---

## Phase 4 — Discovery

Build:

- People search
- Filters
- Recommendations
- Connection requests
- Feed

Deliverable:

```text
User can discover and organize new relationships.
```

---

## Phase 5 — AI

Build:

- Conversation Service
- Message drafting
- Meeting summary
- Relationship insights
- Goal suggestions
- Recommendation intelligence

Deliverable:

```text
AI assists the user without taking autonomous external actions.
```

---

## Phase 6 — Analytics

Build:

- Network growth
- Interaction analytics
- Goal analytics
- Follow-up analytics
- Retention metrics

---

## Phase 7 — Hardening

Complete:

- Security audit
- Performance optimization
- Accessibility
- Responsive testing
- Error monitoring
- Backup strategy
- Production deployment

---

# 88. Antigravity Implementation Rules

Antigravity should follow these rules for the entire project.

## Rule 1

Before coding a new feature, inspect the existing architecture.

Do not create duplicate:

- API clients
- authentication logic
- UI components
- database connection code
- validation logic

## Rule 2

Do not replace the selected stack.

Use:

```text
React
Node/Vite tooling
PHP
MySQL
```

Do not introduce:

```text
Laravel
Next.js backend
Express backend
Prisma
MongoDB
Firebase
Supabase
```

unless explicitly requested.

## Rule 3

Database access must be SQL-based.

Use:

```text
PDO + prepared SQL
```

## Rule 4

Mobile-first is mandatory.

Every new UI must be tested conceptually at:

```text
360px
390px
430px
768px
1024px
1440px
```

## Rule 5

Do not generate giant React components.

Split by feature and responsibility.

## Rule 6

Do not use fake API data after a real endpoint has been implemented.

Mocks are allowed only for development/test mode.

## Rule 7

Never expose:

```text
DB password
OAuth secret
AI API key
```

to the browser.

## Rule 8

Never trust frontend ownership fields.

The authenticated PHP session determines the user.

## Rule 9

Before implementing an AI feature, define:

```text
Input
Context
Prompt contract
Output schema
Validation
User confirmation
Error handling
```

## Rule 10

When modifying database structure, create a migration SQL file.

---

# 89. Antigravity Master Prompt

Use the following prompt when starting the project in Antigravity.

```text
You are the lead full-stack engineer for NexaLink CRM.

Build a production-oriented networking CRM using:

FRONTEND:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Lucide icons

BACKEND:
- PHP 8.2+
- REST API
- PDO
- MySQL 8+
- SQL only
- No ORM
- No Node.js API server

AUTHENTICATION:
- OAuth 2.0 / OpenID Connect
- Google first
- Microsoft-ready architecture
- Secure HttpOnly session cookie
- OAuth state validation
- PKCE where applicable
- Never expose OAuth secrets to React

PRODUCT:
NexaLink CRM is an AI-powered networking and relationship-management platform.

Core modules:
1. Authentication
2. Profile
3. AI Persona
4. Discovery
5. Contacts / Connections
6. Relationship CRM
7. Interactions
8. Meetings
9. Goals
10. Goal Progress
11. Tasks
12. Kanban
13. Calendar
14. Notes
15. Feed
16. Recommendations
17. AI Assistant
18. Conversation Service
19. Analytics
20. Notifications
21. Settings

UI:
- Mobile first
- Responsive from 360px to desktop
- Modern SaaS design
- Blue/purple visual direction
- Clean cards
- Strong typography
- Accessible controls
- Touch-friendly interactions
- Desktop sidebar
- Mobile bottom navigation
- Mobile sheets/drawers
- Responsive tables
- Responsive Kanban
- Mobile agenda calendar

DATABASE:
- MySQL
- SQL migration files
- PDO prepared statements
- Foreign keys
- Indexes
- Transactions
- User-scoped records

SECURITY:
- Never trust user_id from client
- Derive ownership from authenticated session
- Validate all inputs
- Parameterized SQL
- Rate limiting
- CORS allowlist
- CSRF protection where applicable
- Secure cookies
- No secrets in frontend
- No sensitive data in logs

AI:
Create an AI service abstraction.

Services:
- Conversation Service
- Message Draft Service
- Meeting Summary Service
- Relationship Insight Service
- Recommendation Service
- Goal Suggestion Service

AI results must be suggestions requiring user review.
AI must never autonomously send messages or modify important CRM data without user confirmation.

ARCHITECTURE:
Use feature-based React architecture.
Use controllers/services/repositories on PHP.
Keep SQL in repository/query files.
Do not create giant files.
Create reusable UI components.
Create migrations for every schema change.

DEVELOPMENT PROCESS:
1. Inspect existing project.
2. Do not overwrite working code unnecessarily.
3. Create architecture documentation.
4. Build database migrations.
5. Build PHP API foundation.
6. Build authentication.
7. Build profile.
8. Build contacts.
9. Build interactions and meetings.
10. Build goals.
11. Build tasks/Kanban/calendar/notes.
12. Build discovery.
13. Build AI services.
14. Build analytics.
15. Add tests and security hardening.

For every feature:
- database migration if required
- PHP API
- SQL query
- validation
- authorization
- React page
- reusable components
- loading state
- empty state
- error state
- success state
- mobile responsive UI
- desktop responsive UI
- tests

Do not stop at creating UI mockups. Implement the actual API/database integration.

Before each major change, inspect existing files and preserve compatible code.

Do not introduce another backend technology.
```

---

# 90. Antigravity Prompt — Phase 1

```text
Implement Phase 1 of NexaLink CRM.

First inspect the existing React/Node project.

Do not create a Node backend.

Create the PHP REST API structure and MySQL migration structure.

Implement:

1. Project architecture
2. PHP database connection using PDO
3. API routing
4. JSON response helper
5. Error handling
6. CORS configuration
7. Authentication middleware
8. users table
9. oauth_accounts table
10. user_profiles table
11. Google OAuth flow
12. /api/auth/me
13. /api/auth/logout
14. profile API
15. React login screen
16. OAuth callback handling
17. Protected route
18. Dashboard shell
19. Responsive layout
20. Mobile bottom navigation
21. Desktop sidebar

Use SQL migration files.

Do not use ORM.

Use secure HttpOnly cookies.

Do not expose OAuth client secrets.

After implementation, provide:
- files created
- files changed
- SQL migrations
- API endpoints
- setup steps
- environment variables
- tests performed
- known limitations
```

---

# 91. Antigravity Prompt — Phase 2

```text
Implement Phase 2: Core Relationship CRM.

Create SQL migrations and APIs for:

- contacts
- tags
- contact_tags
- interactions
- meetings
- notes

Implement:

Contact list
Contact search
Contact filters
Contact detail
Relationship timeline
Add interaction
Edit interaction
Add meeting
Add note
Contact tags
Follow-up date

Every query must scope records using authenticated user_id.

Add:
- pagination
- loading states
- empty states
- error states
- responsive mobile UI
- desktop UI
- validation

When an interaction is created:
- update last_interaction_at
- optionally create follow-up task if requested
- support linked goal later

Use transactions where multiple records are updated.
```

---

# 92. Antigravity Prompt — Phase 3

```text
Implement Phase 3: Goals and Productivity.

Create:
- goals
- goal_progress
- tasks

Implement:
- goal list
- goal detail
- progress tracking
- task list
- task creation
- task editing
- task completion
- Kanban
- Calendar
- Notes

Kanban must use persistent API updates.

Mobile Kanban should horizontally scroll and also provide an accessible status-change control.

Calendar must support mobile agenda/day view and desktop month/week/day views.

Do not use fake data once APIs are available.

Create reusable components and TanStack Query hooks.
```

---

# 93. Antigravity Prompt — Phase 4

```text
Implement Phase 4: Network Discovery.

Build:
- people search
- contact discovery
- filters
- recommendations
- connection requests
- feed foundation

Recommendations must include an explanation field.

Do not describe recommendation scores as objective truth.

Build responsive mobile-first cards.

Add pagination and debounced search.

Ensure users cannot access private contact records belonging to another user.
```

---

# 94. Antigravity Prompt — Phase 5

```text
Implement Phase 5: AI Assistant.

Create an AI provider abstraction.

Implement:
1. Conversation Service
2. Message Draft Service
3. Meeting Summary
4. Relationship Insights
5. Recommendation Suggestions
6. Goal Suggestions

Conversation Service must use:
- contact profile
- recent interactions
- notes
- user persona
- networking goal

Return structured JSON.

Validate AI responses before returning them to React.

All AI outputs must be editable by the user.

Never send messages automatically.

Never expose AI API keys in React.

Add loading, retry, timeout and safe error handling.
```

---

# 95. Antigravity Prompt — Responsive UI Audit

```text
Perform a complete mobile-first UI audit of NexaLink CRM.

Test every screen conceptually at:
360px
390px
430px
768px
1024px
1440px

Check:
- horizontal overflow
- touch target size
- typography
- form usability
- modal behavior
- drawer behavior
- table responsiveness
- Kanban usability
- calendar usability
- navigation
- sticky actions
- loading states
- empty states
- error states
- accessibility

Fix issues rather than only reporting them.

Do not break desktop layouts while fixing mobile.
```

---

# 96. Antigravity Prompt — Security Audit

```text
Perform a security audit of NexaLink CRM.

Check:
- SQL injection
- authentication bypass
- authorization bypass
- IDOR
- OAuth state validation
- OAuth token handling
- session fixation
- secure cookies
- CSRF
- CORS
- rate limiting
- secret exposure
- sensitive logs
- XSS
- unsafe file handling
- API validation

Pay special attention to:
user_id ownership
contact_id access
task_id access
goal_id access
interaction_id access
meeting_id access

Fix vulnerabilities and provide a concise audit report.
```

---

# 97. Suggested MVP Scope

Do not attempt to build every feature before validating the core product.

### MVP

```text
Authentication
Profile
Contacts
Interactions
Meetings
Goals
Tasks
Kanban
Calendar
Notes
Basic AI Conversation Service
Basic AI Message Drafting
Dashboard
Basic Analytics
```

### V1.1

```text
Discovery
Recommendations
Feed
Notifications
Advanced AI Insights
Calendar integrations
Email integration
```

### V2

```text
Mobile native app
Advanced relationship intelligence
Team CRM
Organization workspaces
Advanced automation
AI agents with explicit user approval
Advanced analytics
```

---

# 98. Success Metrics

Track:

```text
User Growth
Monthly Active Users
Connections per User
Interactions per User
Meaningful Conversations
Goal Completion Rate
Follow-up Completion Rate
Meeting Rate
AI Feature Usage
Retention
```

Do not optimize solely for number of connections. The product's purpose is useful, sustained relationships.

---

# 99. Suggested Initial Routes

```text
/
  → redirect to /dashboard if authenticated
  → redirect to /login otherwise

/login
/auth/callback
/dashboard
/discover
/connections
/connections/:id
/interactions
/meetings
/goals
/goals/:id
/tasks
/kanban
/calendar
/notes
/ai
/feed
/analytics
/profile
/settings
```

---

# 100. Final Engineering Checklist

Before calling the first production release complete:

## Frontend

- [ ] React TypeScript
- [ ] Feature architecture
- [ ] Responsive design
- [ ] Mobile navigation
- [ ] Desktop navigation
- [ ] Form validation
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Accessibility
- [ ] API integration
- [ ] Error boundary
- [ ] Production build

## Backend

- [ ] PHP 8.2+
- [ ] PDO
- [ ] SQL migrations
- [ ] Prepared statements
- [ ] Authentication
- [ ] OAuth
- [ ] Authorization
- [ ] Validation
- [ ] CORS
- [ ] CSRF where applicable
- [ ] Rate limiting
- [ ] Error logging
- [ ] Audit logging

## Database

- [ ] Foreign keys
- [ ] Indexes
- [ ] Transactions
- [ ] User ownership
- [ ] Migration history
- [ ] Backup strategy

## AI

- [ ] Provider abstraction
- [ ] Conversation Service
- [ ] Message drafting
- [ ] Meeting summary
- [ ] Validation
- [ ] User confirmation
- [ ] No secret exposure
- [ ] Usage monitoring

## Deployment

- [ ] HTTPS
- [ ] Environment variables
- [ ] Secure cookies
- [ ] Database backup
- [ ] Error monitoring
- [ ] Production build
- [ ] OAuth production redirect URLs
- [ ] CORS production origin
- [ ] PHP production configuration

---

# 101. Product Name

## NexaLink CRM

**Full Name:** NexaLink — AI Networking & Relationship CRM

**Tagline:**

> Build Meaningful Connections. Track Relationships. Achieve Your Goals.

**Short description:**

> An AI-powered personal networking CRM that helps you discover people, manage relationships, track interactions, organize follow-ups and turn networking goals into measurable actions.

**Primary navigation label:**

```text
NexaLink
```

**Browser title:**

```text
NexaLink CRM — AI Networking & Relationship Management
```

---

# 102. Recommended Initial Build Order

Use this exact order with Antigravity:

```text
01. Project inspection
02. Architecture documentation
03. MySQL migrations
04. PHP API foundation
05. Authentication
06. Google OAuth
07. Profile
08. Dashboard shell
09. Contacts
10. Contact detail
11. Tags
12. Interactions
13. Meetings
14. Notes
15. Goals
16. Goal progress
17. Tasks
18. Kanban
19. Calendar
20. Discovery
21. Recommendations
22. AI service abstraction
23. Conversation Service
24. AI message drafts
25. Meeting summaries
26. Relationship insights
27. Analytics
28. Notifications
29. Security audit
30. Responsive audit
31. Performance audit
32. Production deployment
```

---

# 103. Important Constraint

The application should remain maintainable for a small engineering team.

Prefer:

```text
simple architecture
clear SQL
small PHP services
feature-based React
reusable UI
strong authentication
explicit authorization
```

Avoid premature complexity.

The target architecture is:

```text
React
   ↓
REST API
   ↓
PHP Services
   ↓
PDO / SQL
   ↓
MySQL
```

with external integrations isolated behind services:

```text
OAuth
Email
Calendar
AI
Notifications
Analytics
```

This architecture gives NexaLink a strong foundation while keeping the implementation compatible with a typical PHP/MySQL hosting environment and the existing React/Node development setup.

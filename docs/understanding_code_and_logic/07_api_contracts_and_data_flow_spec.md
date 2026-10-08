# API Contracts & Data Flow Specification

## 1. Overview & Protocol Standard

NexaLink CRM exposes a RESTful JSON HTTP API mounted at `/api`.

### Core Standards:
- **Transport:** HTTP / HTTPS
- **Authentication:** Bearer token or `token` HttpOnly cookie
- **Payload Encoding:** `application/json` (limits up to 10MB)
- **Envelope Standard:** All responses adhere to a consistent envelope structure:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
  Or for errors:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable error description"
    }
  }
  ```

---

## 2. Complete Endpoints Reference Matrix

### 🔐 Authentication (`/api/auth/*`)
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | `{ email, password, display_name }` | Create new account |
| `POST` | `/api/auth/login` | None | `{ email, password }` | Authenticate & issue cookie |
| `POST` | `/api/auth/demo-login` | None | `{}` | Authenticate demo account |
| `POST` | `/api/auth/google` | None | `{ credential }` | Google OAuth token exchange |
| `GET` | `/api/auth/me` | User | None | Return authenticated user & session |
| `POST` | `/api/auth/logout` | User | None | Clear session cookie |

### 👤 Profile & Persona (`/api/profile/*`)
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `GET` | `/api/profile` | User | None | Return profile and persona records |
| `PUT` | `/api/profile` | User | `{ headline, bio, company, job_title, skills, interests }` | Update user profile |
| `PUT` | `/api/profile/persona` | User | `{ persona_name, communication_style, preferred_people, networking_goal }` | Update AI persona |
| `POST`| `/api/upload/avatar` | User | `multipart/form-data (avatar)` | Upload custom profile picture |

### 📊 Dashboard & System (`/api/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/dashboard` | Gated | None | Aggregated dashboard stats & cards |
| `GET` | `/api/search` | Gated | `?q=query` | Multi-entity global search |
| `GET` | `/api/version` | None | None | Service version & uptime check |
| `GET` | `/api/health` | None | None | API health status probe |

### 👥 Contacts CRM (`/api/contacts/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/contacts` | Gated | `?search=&relationship_type=&tag=&page=&limit=` | Paginated contact list with tags |
| `POST` | `/api/contacts` | Gated | `{ first_name, last_name, email, phone, company, job_title, relationship_type, tags[] }` | Create contact |
| `GET` | `/api/contacts/:id`| Gated | None | Full contact dossier |
| `PUT` | `/api/contacts/:id`| Gated | Partial contact updates | Update contact |
| `DELETE`| `/api/contacts/:id`| Gated | None | Delete contact |
| `GET` | `/api/contacts/tags`| Gated | None | Get user's contact tags |

### 🤝 Interactions Engine (`/api/interactions/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/interactions` | Gated | `?contact_id=&goal_id=&type=&limit=&page=` | List touchpoints |
| `POST` | `/api/interactions` | Gated | `{ contact_id, goal_id, interaction_type, title, interaction_date, duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment }` | Log touchpoint (Transaction) |
| `GET` | `/api/interactions/:id` | Gated | None | Get interaction detail |
| `PUT` | `/api/interactions/:id` | Gated | Partial interaction updates | Update interaction |
| `DELETE`| `/api/interactions/:id`| Gated | None | Delete interaction |

### 📅 Meetings Management (`/api/meetings/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/meetings` | Gated | `?upcoming_only=&start_date=&end_date=&contact_id=` | List meetings |
| `POST` | `/api/meetings` | Gated | `{ contact_id, title, meeting_type, start_at, end_at, location, agenda }` | Schedule meeting |
| `GET` | `/api/meetings/:id` | Gated | None | Get meeting detail |
| `PUT` | `/api/meetings/:id` | Gated | Partial updates (`status`, `outcome`, `agenda`) | Update meeting |
| `DELETE`| `/api/meetings/:id`| Gated | None | Delete meeting |

### 🎯 Goals Engine (`/api/goals/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/goals` | Gated | `?status=` | List goals with progress percentage |
| `POST` | `/api/goals` | Gated | `{ title, description, goal_type, target_value, unit, end_date }` | Create goal |
| `GET` | `/api/goals/:id` | Gated | None | Get goal & milestone history |
| `PUT` | `/api/goals/:id` | Gated | Partial goal updates | Update goal |
| `POST` | `/api/goals/:id/progress` | Gated | `{ increment, notes }` | Increment progress milestone |
| `DELETE`| `/api/goals/:id` | Gated | None | Delete goal |

### 📋 Tasks & Kanban (`/api/tasks/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Gated | `?status=&priority=&contact_id=&goal_id=` | List tasks |
| `POST` | `/api/tasks` | Gated | `{ contact_id, goal_id, title, description, priority, due_date }` | Create task |
| `GET` | `/api/tasks/:id` | Gated | None | Get task detail |
| `PUT` / `PATCH` | `/api/tasks/:id` | Gated | `{ status, priority, due_date, completed_at }` | Update task or Kanban stage |
| `DELETE`| `/api/tasks/:id` | Gated | None | Delete task |

### 📝 Notes Workspace (`/api/notes/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/notes` | Gated | `?contact_id=&search=` | List notes (pinned first) |
| `POST` | `/api/notes` | Gated | `{ contact_id, title, content, is_pinned }` | Create note |
| `GET` | `/api/notes/:id` | Gated | None | Get note detail |
| `PUT` | `/api/notes/:id` | Gated | Partial note updates / pin toggle | Update note |
| `DELETE`| `/api/notes/:id` | Gated | None | Delete note |

### 🌐 Recommendations & Discovery (`/api/recommendations/*`, `/api/discover`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/discover` | Gated | None | Fetch recommended network members |
| `GET` | `/api/recommendations` | Gated | None | Fetch precomputed match recommendations |
| `POST` | `/api/recommendations/skip/:skippedUserId` | Gated | None | Skip member from recommendation feed |
| `POST` | `/api/recommendations/:id/status` | Gated | `{ status }` | Update recommendation status |
| `POST` | `/api/recommendations/:id/convert` | Gated | None | Convert recommended user to CRM contact |

### 📢 Networking Feed (`/api/feed/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/feed` | Gated | None | List activity feed posts |
| `POST` | `/api/feed` | Gated | `{ content, tags[] }` | Publish new post |
| `POST` | `/api/feed/:id/like` | Gated | None | Toggle like on post |
| `GET` | `/api/feed/:id/replies` | Gated | None | Get comments and intro offers |
| `POST` | `/api/feed/:id/reply` | Gated | `{ replyType, targetPerson, content }` | Post threaded reply |
| `GET` | `/api/feed/:id/can-connect` | Gated | None | Resolve Can-Connect intro bridges |

### 🤖 AI Assistant (`/api/ai/*`)
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/ai/conversation/suggestions` | Gated | `{ contact_id, custom_goal }` | Generate conversation strategy |
| `POST` | `/api/ai/message/draft` | Gated | `{ contact_id, purpose, tone, context }` | Draft personalized communication |
| `POST` | `/api/ai/meeting/summarize` | Gated | `{ meeting_id, notes, agenda }` | Distill meeting takeaways & tasks |
| `GET` | `/api/ai/insights` | Gated | None | Get proactive relationship health alerts |
| `GET` | `/api/ai/goals/suggestions` | Gated | None | Suggest network-aligned goals |

### 📈 Analytics & Notifications (`/api/analytics`, `/api/notifications/*`)
| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/analytics` | Gated | None | Full reporting analytics payload |
| `GET` | `/api/notifications` | Gated | None | List user alerts |
| `POST` | `/api/notifications/:id/read` | Gated | None | Mark single notification as read |
| `POST` | `/api/notifications/read-all` | Gated | None | Mark all notifications read |

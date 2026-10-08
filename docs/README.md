# NexaLink CRM — Comprehensive Architecture, Card Files & Code Logic Documentation

Welcome to the central technical documentation repository for **NexaLink CRM**, an AI-powered personal networking and relationship intelligence platform built with **React 18 + TypeScript + Tailwind CSS** on the frontend and **Node.js + Express + MySQL (SQL-First)** on the backend.

---

## 📚 Documentation Index

### 1. 🗂️ Frontend Card Files (`docs/cards/frontend/`)
Modular reference cards covering UI component structure, props, local and server states, styling, and interactions:

- [01. KPI Stat Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/01_kpi_stat_cards.md) — 4 High-level metric cards (Connections, Active Relationships, Follow-ups Due, Goals % Complete).
- [02. Contact Cards & Dossier](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/02_contact_cards.md) — Directory grid cards, Dossier overview cards, and relationship gauges.
- [03. AutoConnect Matchmaking Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/03_autoconnect_matchmaking_card.md) — Bidirectional AI matchmaking card, warm intro bridges, and match badges.
- [04. AI Recommendation & Discovery Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/04_recommendation_discovery_card.md) — Discovery feed cards with explainability tags and 1-click contact conversion.
- [05. Goal Progress Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/05_goal_progress_card.md) — Measurable networking goal cards, milestone trackers, and progress velocity bars.
- [06. Kanban Task Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/06_kanban_task_card.md) — Priority task cards with status columns (`To Do`, `In Progress`, `Done`) and drag/click updates.
- [07. Meeting Agenda Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/07_meeting_agenda_card.md) — Upcoming meeting agenda cards, participant pills, and virtual meeting links.
- [08. Interaction Timeline Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/08_interaction_timeline_card.md) — Chronological touchpoint log cards with sentiment tags and outcome markers.
- [09. Networking Feed Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/09_feed_social_card.md) — Feed activity posts, milestone celebration cards, and Can-Connect pathway cards.
- [10. Notes Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/10_notes_card.md) — Pinned and standard quick note cards with contact associations.
- [11. AI Assistant Studio Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/11_ai_studio_cards.md) — Conversation prep, message composer, and meeting summarizer interactive studio cards.
- [12. Analytics & Chart Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/12_analytics_chart_cards.md) — Data visualization cards using Recharts (Growth trends, Health distributions).
- [13. Notification Alert Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/13_notification_cards.md) — Unread badge cards, follow-up alerts, and interactive mark-read controls.
- [14. Profile & Persona Cards](file:///home/osmos/Downloads/nexalink-main/docs/cards/frontend/14_profile_persona_card.md) — Profile dossier card, Persona communication settings, and offer/seek taxonomy cards.

---

### 2. 🗂️ Backend Module Cards (`docs/cards/backend/`)
Modular reference cards detailing backend controllers, routes, repositories, SQL queries, and business rules:

- [01. Auth & Security Module Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/01_auth_security_card.md) — JWT cookies, Bcrypt password hashing, Demo login, Rate limiting, Audit logging.
- [02. AutoConnect Engine Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/02_autoconnect_engine_card.md) — Tokenization, substring matching, token overlap scoring, and reverse matching logic.
- [03. Matchmaking Service Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/03_matchmaking_service_card.md) — 100-point algorithm, intent complementarity, geography, and precomputation cache.
- [04. AI Intelligence Service Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/04_ai_service_card.md) — Context assembly, prompt engineering, message generation, and relationship insights.
- [05. Contacts CRM Module Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/05_contacts_crm_card.md) — Relational contact CRUD, dynamic filtering, relationship health score calculation.
- [06. Interactions Engine Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/06_interactions_engine_card.md) — ACID transactions updating contacts, scheduling follow-up tasks, and logging milestones.
- [07. Meetings Management Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/07_meetings_card.md) — Agenda scheduling, contact attendees, and date-bounded calendar queries.
- [08. Goals & Milestones Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/08_goals_milestones_card.md) — Quantitative goal tracking, completion percentage math, and milestone logs.
- [09. Tasks & Kanban Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/09_tasks_kanban_card.md) — Status transitions, priority levels, contact foreign keys, and due-date filters.
- [10. Notes Repository Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/10_notes_card.md) — Pinned-first ordering, contact association joins, and full-text search.
- [11. Networking Feed & Bridge Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/11_feed_social_card.md) — Feed post lifecycle, like toggles, reply threads, and bridge path resolution.
- [12. Analytics & Reporting Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/12_analytics_reporting_card.md) — High-performance SQL aggregation pipelines, group-by metrics, and trend calculations.
- [13. Global Search & Notifications Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/13_search_notifications_card.md) — Multi-table UNION search and notification dispatch.
- [14. Database & Repository Pattern Card](file:///home/osmos/Downloads/nexalink-main/docs/cards/backend/14_database_repository_architecture_card.md) — `mysql2/promise` pool, `withTransaction`, migrations, and prepared statements.

---

### 3. 🧠 In-Depth Understanding Code and Logic Files (`docs/understanding_code_and_logic/`)
Comprehensive architectural deep-dives, mathematical formulations, database dictionaries, and full API specifications:

- [01. System Architecture & End-to-End Flow](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/01_system_architecture_and_end_to_end_flow.md) — Global architecture diagram, client-server handshake, middleware pipelines, and security layers.
- [02. Backend Architecture & Code Logic](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/02_backend_architecture_and_code_logic.md) — Express server runtime, middleware chain, controller contracts, repository pattern, and transaction flows.
- [03. Frontend Architecture & UI Logic](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/03_frontend_architecture_and_ui_logic.md) — React 18, TanStack Query cache patterns, Context API, Tailwind layout system, and responsive breakpoints.
- [04. Matchmaking & AutoConnect Algorithms Deep Dive](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/04_matchmaking_and_autoconnect_algorithms_deep_dive.md) — Mathematical formulation, multi-vector synergy scoring, tokenization, and bidirectional bridge matching.
- [05. Database Schema & SQL Query Logic](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/05_database_schema_and_sql_query_logic.md) — Complete 20-table schema dictionary, ER relationships, indexes, constraints, and raw SQL queries.
- [06. AI Assistant Intelligence & Prompt Logic](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/06_ai_assistant_intelligence_and_prompt_logic.md) — Prompt engineering architecture, context extraction, persona integration, and deterministic rule-based fallbacks.
- [07. API Contracts & Data Flow Specification](file:///home/osmos/Downloads/nexalink-main/docs/understanding_code_and_logic/07_api_contracts_and_data_flow_spec.md) — Complete REST API reference for all 40+ endpoints with request/response schemas.

---

## 🛠️ Quick Technology Summary

| Layer | Technologies & Patterns |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router v6, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, `mysql2/promise` with prepared statements, JWT (HttpOnly cookie), Bcrypt |
| **Database** | MySQL 8.0+ / MariaDB 10.4+, Normalized 3NF Relational Schema, Foreign Key cascades, ACID Transactions |
| **AI Intelligence** | Isolated AI Service boundary, Persona context aggregation, Structured JSON output schemas |
| **Matchmaking** | Two-tier Tokenizer & N-Gram match, Multi-vector Synergy engine, Reverse bridge resolver |

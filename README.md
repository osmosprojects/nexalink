# NexaLink CRM — AI Networking & Relationship Platform

> **Build Meaningful Connections. Track Relationships. Achieve Your Goals.**

NexaLink CRM is an AI-powered personal networking and relationship-management platform developed completely using **React + TypeScript + Tailwind CSS** on the frontend and **Node.js + Express + MySQL (SQL-First)** on the backend.

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL running on port 3306)
Ensure MySQL is running (e.g., via XAMPP):
```bash
# Verify MySQL running on port 3306
mysql -u root -e "SHOW DATABASES;"
```

### 2. Run Database Migrations & Seed Data
```bash
npm run db:setup
```

### 3. Start Backend & Frontend
In separate terminal tabs:

**Backend (Port 5000):**
```bash
npm run dev:backend
```

**Frontend (Port 5173):**
```bash
npm run dev:frontend
```

Then open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Login Credentials

- **Email:** `demo@nexalink.com`
- **Password:** `password123`
- Or simply click the **"1-Click Demo"** button on the Login page!

---

## 🏗️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, TanStack Query, React Router, Recharts, Canvas Confetti.
- **Backend:** Node.js, Express, TypeScript, `mysql2/promise` with prepared statements (no ORM), JWT / HttpOnly Cookie Authentication, Bcrypt, CORS, Rate Limiting, Audit Logging.
- **Database:** MySQL 8+ / MariaDB 10.4+ on port 3306 with normalized relational schema, indexes, transactions, and foreign keys.
- **AI Intelligence:** Isolated AI Service provider covering Conversation Preparation, Message Drafting, Meeting Summarization, and Relationship Insights.

---

## 📦 Modules Implemented

1. **Authentication:** Register, Login, 1-Click Demo Login, Session validation (`/api/auth/me`), Logout.
2. **Dashboard:** 4 KPI Cards (Connections, Active Relationships, Follow-ups Due, Goals % Complete), Today's Action items, AI Networking Insight card, Upcoming Meetings, and Quick Add.
3. **Connections Directory:** Full CRM contact table/grid, multi-filter, relationship strength gauge, and tags.
4. **Contact Detail CRM:** Contact Dossier, Overview, Chronological Timeline, Interactions, Meetings, Tasks, Notes, and AI action triggers.
5. **Interaction Tracking:** Log meetings, calls, coffee chats, emails with outcomes, follow-up flags, and automatic transactional contact updates.
6. **Meetings Management:** Calendar and card views, agendas, outcomes, and join links.
7. **Goal Engine:** Measurable targets, progress bars, and 1-click milestone updates.
8. **Kanban Board:** Multi-column board (To Do, In Progress, Done) with persistent API status updates.
9. **Calendar:** Chronological Agenda and Month views aggregating meetings, tasks, follow-ups, and goal deadlines.
10. **Tasks & Notes:** Priorities, checklists, status toggles, pinned notes, and contact links.
11. **AI Assistant Studio:** Conversation Preparation, Message Drafting Composer (tones/purposes), Meeting Summarizer, and Proactive Insights.
12. **Network Discovery:** AI Recommendations with "Why recommended" explainability and 1-click Connect.
13. **Networking Feed:** Milestone updates, activity posts, likes, and tags.
14. **Analytics & Metrics:** Recharts visualizations for network growth, interaction distribution, and goal velocity.
15. **Notifications Center:** Alerts for follow-ups, meetings, and goal deadlines with mark-as-read.
16. **Settings & Privacy:** Public profile toggles, discoverability controls, AI usage consent, JSON data export backup.
17. **Global Search:** Multi-entity quick search across contacts, meetings, interactions, tasks, goals, and notes.

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { config } from '../config/env';

export async function runSeeds() {
  console.log('🌱 Seeding database:', config.db.database);

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });

  try {
    // Clean old data in correct order
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE audit_logs;');
    await connection.query('TRUNCATE TABLE notifications;');
    await connection.query('TRUNCATE TABLE posts;');
    await connection.query('TRUNCATE TABLE recommendations;');
    await connection.query('TRUNCATE TABLE notes;');
    await connection.query('TRUNCATE TABLE tasks;');
    await connection.query('TRUNCATE TABLE meetings;');
    await connection.query('TRUNCATE TABLE interactions;');
    await connection.query('TRUNCATE TABLE goal_progress;');
    await connection.query('TRUNCATE TABLE goals;');
    await connection.query('TRUNCATE TABLE contact_tags;');
    await connection.query('TRUNCATE TABLE tags;');
    await connection.query('TRUNCATE TABLE contacts;');
    await connection.query('TRUNCATE TABLE user_personas;');
    await connection.query('TRUNCATE TABLE user_profiles;');
    await connection.query('TRUNCATE TABLE oauth_accounts;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Demo User
    const [userRes]: any = await connection.execute(
      `INSERT INTO users (email, password_hash, display_name, avatar_url, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'demo@nexalink.com',
        passwordHash,
        'Rahul Mehta',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'active',
      ]
    );
    const userId = userRes.insertId;

    // 2. User Profile
    await connection.execute(
      `INSERT INTO user_profiles (
        user_id, headline, bio, company, job_title, location, industry, website, linkedin_url, phone, timezone, avatar_url, skills, interests, networking_goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Lead AI Engineer & Startup Advisor | Building the Future of SaaS',
        'Passionate about distributed systems, autonomous agents, and relationship intelligence. Always open to high-signal conversations with builders and investors.',
        'NexaLabs / Google Fellow',
        'Staff Software Engineer',
        'San Francisco, CA',
        'Artificial Intelligence / SaaS',
        'https://rahulmehta.dev',
        'https://linkedin.com/in/rahulmehta-demo',
        '+1 (415) 555-0192',
        'America/Los_Angeles',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        JSON.stringify(['React', 'Node.js', 'TypeScript', 'MySQL', 'LLMs', 'System Architecture', 'SaaS Growth']),
        JSON.stringify(['Generative AI', 'Startups', 'Developer Tools', 'Angel Investing', 'Product Design']),
        JSON.stringify(['Connect with 20 AI Founders', 'Find 3 Enterprise Mentors', 'Host monthly Bay Area Tech Coffee']),
      ]
    );

    // 3. User Persona
    await connection.execute(
      `INSERT INTO user_personas (user_id, persona_name, communication_style, preferred_people, networking_goal, interests, confidence, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Strategic Tech Leader & Angel Investor',
        'Concise, high-signal, authentic and collaborative',
        'AI Founders, CTOs, Seed/Series A VCs, Product Design Leaders',
        'Build long-term strategic relationships with founders and domain experts',
        'AI Infrastructure, Agentic Workflows, SaaS Unit Economics, Developer Experience',
        92,
        1,
      ]
    );

    // 4. Tags
    const tagsData = [
      { name: 'AI Founder', color: '#8B5CF6' },
      { name: 'High Priority', color: '#EF4444' },
      { name: 'Investor / VC', color: '#10B981' },
      { name: 'Mentor', color: '#F59E0B' },
      { name: 'Tech Lead', color: '#3B82F6' },
      { name: 'Client Prospect', color: '#EC4899' },
      { name: 'Conference Met', color: '#06B6D4' },
      { name: 'Follow-up Due', color: '#F97316' },
    ];

    const tagMap: Record<string, number> = {};
    for (const t of tagsData) {
      const [tRes]: any = await connection.execute(
        `INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`,
        [userId, t.name, t.color]
      );
      tagMap[t.name] = tRes.insertId;
    }

    // 5. Contacts
    const contactsData = [
      {
        first_name: 'Priya',
        last_name: 'Sharma',
        email: 'priya.sharma@google.com',
        phone: '+1 (415) 555-2341',
        company: 'Google',
        job_title: 'Director of Product, AI Ecosystems',
        location: 'Mountain View, CA',
        linkedin_url: 'https://linkedin.com/in/priya-sharma-demo',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'mentor',
        relationship_strength: 88,
        last_interaction_at: '2026-09-14 11:30:00',
        next_follow_up_at: '2026-09-22 10:00:00',
        notes: 'Priya gave incredible advice on agentic API design. Discussed potential collaboration on open standards.',
        tags: ['Mentor', 'AI Founder', 'High Priority'],
      },
      {
        first_name: 'Amit',
        last_name: 'Patel',
        email: 'amit@synthai.tech',
        phone: '+1 (650) 555-8912',
        company: 'SynthAI',
        job_title: 'Co-Founder & CEO',
        location: 'San Francisco, CA',
        linkedin_url: 'https://linkedin.com/in/amit-patel-synthai',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'founder',
        relationship_strength: 78,
        last_interaction_at: '2026-09-12 15:00:00',
        next_follow_up_at: '2026-09-19 14:00:00',
        notes: 'Building multimodal agents for enterprise workflows. Currently raising $4M Seed round.',
        tags: ['AI Founder', 'High Priority'],
      },
      {
        first_name: 'Neha',
        last_name: 'Verma',
        email: 'neha@horizonvc.io',
        phone: '+1 (415) 555-7734',
        company: 'Horizon Capital',
        job_title: 'General Partner',
        location: 'San Francisco, CA',
        linkedin_url: 'https://linkedin.com/in/neha-verma-vc',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'investor',
        relationship_strength: 82,
        last_interaction_at: '2026-09-10 16:30:00',
        next_follow_up_at: '2026-09-25 09:30:00',
        notes: 'Active early-stage investor in developer tools and AI infrastructure. Wants introduction to Amit Patel.',
        tags: ['Investor / VC', 'High Priority'],
      },
      {
        first_name: 'Vikram',
        last_name: 'Singh',
        email: 'vikram@scaleops.dev',
        phone: '+1 (408) 555-3211',
        company: 'ScaleOps Systems',
        job_title: 'VP of Engineering',
        location: 'San Jose, CA',
        linkedin_url: 'https://linkedin.com/in/vikram-singh-eng',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'colleague',
        relationship_strength: 70,
        last_interaction_at: '2026-09-08 14:00:00',
        next_follow_up_at: '2026-09-24 11:00:00',
        notes: 'Ex-Stripe colleague. Great contact for scaling Kubernetes infrastructure and database sharding.',
        tags: ['Tech Lead', 'Conference Met'],
      },
      {
        first_name: 'Elena',
        last_name: 'Rostova',
        email: 'elena@devsphere.io',
        phone: '+1 (415) 555-6611',
        company: 'DevSphere',
        job_title: 'Head of Developer Relations',
        location: 'Seattle, WA',
        linkedin_url: 'https://linkedin.com/in/elena-rostova',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'partner',
        relationship_strength: 65,
        last_interaction_at: '2026-09-02 10:00:00',
        next_follow_up_at: '2026-09-20 15:00:00',
        notes: 'Organizing AI Developer Summit in November. Invited me to deliver a keynote on full-stack AI CRM architectures.',
        tags: ['Conference Met', 'Follow-up Due'],
      },
      {
        first_name: 'Alex',
        last_name: 'Morgan',
        email: 'alex@morgancap.com',
        phone: '+1 (212) 555-9011',
        company: 'Morgan Ventures',
        job_title: 'Managing Director',
        location: 'New York, NY',
        linkedin_url: 'https://linkedin.com/in/alex-morgan-investor',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'investor',
        relationship_strength: 60,
        last_interaction_at: '2026-08-28 17:00:00',
        next_follow_up_at: '2026-09-28 16:00:00',
        notes: 'Met at NYC Tech Week. Interested in our relationship graph engine and market expansion.',
        tags: ['Investor / VC'],
      },
      {
        first_name: 'David',
        last_name: 'Chen',
        email: 'david.chen@vercel-labs.com',
        phone: '+1 (415) 555-4500',
        company: 'Vercel Labs',
        job_title: 'Principal Architect',
        location: 'San Francisco, CA',
        linkedin_url: 'https://linkedin.com/in/david-chen-arch',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'colleague',
        relationship_strength: 75,
        last_interaction_at: '2026-09-11 12:15:00',
        next_follow_up_at: '2026-09-23 14:30:00',
        notes: 'Co-collaborator on Next/React edge rendering patterns. Discussed optimizing CRM client latency.',
        tags: ['Tech Lead'],
      },
      {
        first_name: 'Maya',
        last_name: 'Lin',
        email: 'maya@studiomatrix.co',
        phone: '+1 (312) 555-8833',
        company: 'Studio Matrix',
        job_title: 'Founder & Chief Design Officer',
        location: 'Chicago, IL',
        linkedin_url: 'https://linkedin.com/in/maya-lin-design',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        relationship_type: 'client',
        relationship_strength: 55,
        last_interaction_at: '2026-08-25 13:00:00',
        next_follow_up_at: '2026-09-18 17:00:00',
        notes: 'Looking for a custom CRM & workflow automation pipeline for her 35-person design studio.',
        tags: ['Client Prospect', 'Follow-up Due'],
      },
    ];

    const contactMap: Record<string, number> = {};
    for (const c of contactsData) {
      const [cRes]: any = await connection.execute(
        `INSERT INTO contacts (
          user_id, first_name, last_name, email, phone, company, job_title, location, linkedin_url, avatar_url, relationship_type, relationship_strength, last_interaction_at, next_follow_up_at, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          c.first_name,
          c.last_name,
          c.email,
          c.phone,
          c.company,
          c.job_title,
          c.location,
          c.linkedin_url,
          c.avatar_url,
          c.relationship_type,
          c.relationship_strength,
          c.last_interaction_at,
          c.next_follow_up_at,
          c.notes,
        ]
      );
      const contactId = cRes.insertId;
      contactMap[`${c.first_name} ${c.last_name}`] = contactId;

      // Link tags
      for (const tName of c.tags) {
        if (tagMap[tName]) {
          await connection.execute(
            `INSERT IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`,
            [contactId, tagMap[tName]]
          );
        }
      }
    }

    // 6. Goals
    const goalsData = [
      {
        title: 'Connect with 20 AI Founders',
        description: 'Expand our network of seed & growth stage founders building generative AI and autonomous workflows.',
        goal_type: 'connections',
        target_value: 20,
        current_value: 14,
        unit: 'founders',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        status: 'active',
      },
      {
        title: '5 In-Depth Coffee Strategy Chats',
        description: 'Meet high-impact advisors and technical peers for meaningful 1-on-1 strategy discussions.',
        goal_type: 'interactions',
        target_value: 5,
        current_value: 4,
        unit: 'meetings',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        status: 'active',
      },
      {
        title: 'Complete 15 Timely Follow-ups',
        description: 'Ensure zero networking opportunities drop through timely follow-ups within 5 days of meeting.',
        goal_type: 'follow_ups',
        target_value: 15,
        current_value: 11,
        unit: 'follow-ups',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        status: 'active',
      },
      {
        title: 'Attend 4 Tech Conferences / Meetups',
        description: 'Participate actively in SF tech ecosystem events and demo sessions.',
        goal_type: 'events',
        target_value: 4,
        current_value: 2,
        unit: 'events',
        start_date: '2026-09-01',
        end_date: '2026-10-31',
        status: 'active',
      },
    ];

    const goalIds: number[] = [];
    for (const g of goalsData) {
      const [gRes]: any = await connection.execute(
        `INSERT INTO goals (user_id, title, description, goal_type, target_value, current_value, unit, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, g.title, g.description, g.goal_type, g.target_value, g.current_value, g.unit, g.start_date, g.end_date, g.status]
      );
      const gid = gRes.insertId;
      goalIds.push(gid);

      // Goal progress
      await connection.execute(
        `INSERT INTO goal_progress (goal_id, progress_date, progress_value, notes) VALUES (?, ?, ?, ?)`,
        [gid, '2026-09-10', 5, 'Great progress from SF Tech Week introductions.']
      );
      await connection.execute(
        `INSERT INTO goal_progress (goal_id, progress_date, progress_value, notes) VALUES (?, ?, ?, ?)`,
        [gid, '2026-09-15', 3, 'Added 3 founders from AI Demo Night.']
      );
    }

    // 7. Interactions
    const priyaId = contactMap['Priya Sharma'];
    const amitId = contactMap['Amit Patel'];
    const nehaId = contactMap['Neha Verma'];
    const davidId = contactMap['David Chen'];
    const mayaId = contactMap['Maya Lin'];

    const interactionsData = [
      {
        contact_id: priyaId,
        goal_id: goalIds[1],
        interaction_type: 'coffee',
        title: 'Coffee Strategy Chat at Blue Bottle SF',
        interaction_date: '2026-09-14 11:30:00',
        duration_minutes: 45,
        summary: 'Deep dive into AI-driven CRM architectures and privacy standards. Priya shared valuable insights on user-controlled AI agents.',
        outcome: 'Agreed to collaborate on open-source agent integration schemas. Scheduled follow-up for next week.',
        follow_up_required: 1,
        follow_up_date: '2026-09-22',
        sentiment: 'positive',
      },
      {
        contact_id: amitId,
        goal_id: goalIds[0],
        interaction_type: 'meeting',
        title: 'Product Architecture & Seed Deck Review',
        interaction_date: '2026-09-12 15:00:00',
        duration_minutes: 60,
        summary: 'Walked through SynthAI architecture diagram. Discussed latency benchmarks and angel investor intros.',
        outcome: 'Introduced Amit to Neha Verma at Horizon Capital.',
        follow_up_required: 1,
        follow_up_date: '2026-09-19',
        sentiment: 'positive',
      },
      {
        contact_id: nehaId,
        goal_id: goalIds[0],
        interaction_type: 'call',
        title: 'Angel Syndicate Sync & Market Thesis Call',
        interaction_date: '2026-09-10 16:30:00',
        duration_minutes: 30,
        summary: 'Discussed Q3 investment trends in B2B AI tooling. Neha confirmed interest in reviewing SynthAI seed round.',
        outcome: 'Sent SynthAI memo and introductory email.',
        follow_up_required: 1,
        follow_up_date: '2026-09-25',
        sentiment: 'positive',
      },
      {
        contact_id: davidId,
        goal_id: goalIds[1],
        interaction_type: 'meeting',
        title: 'React Server Actions & Edge Caching Deep Dive',
        interaction_date: '2026-09-11 12:15:00',
        duration_minutes: 40,
        summary: 'Brainstormed real-time updates for Kanban boards and optimistic UI patterns with MySQL read replicas.',
        outcome: 'Implemented TanStack Query cache invalidation strategy.',
        follow_up_required: 0,
        follow_up_date: null,
        sentiment: 'positive',
      },
      {
        contact_id: mayaId,
        goal_id: goalIds[2],
        interaction_type: 'email',
        title: 'Studio Matrix CRM Workflow Discovery Proposal',
        interaction_date: '2026-08-25 13:00:00',
        duration_minutes: 15,
        summary: 'Sent detailed capabilities summary of NexaLink custom fields, calendar sync, and Kanban views.',
        outcome: 'Awaiting Maya confirmation for demo walkthrough.',
        follow_up_required: 1,
        follow_up_date: '2026-09-18',
        sentiment: 'neutral',
      },
    ];

    for (const inter of interactionsData) {
      await connection.execute(
        `INSERT INTO interactions (
          user_id, contact_id, goal_id, interaction_type, title, interaction_date, duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          inter.contact_id,
          inter.goal_id,
          inter.interaction_type,
          inter.title,
          inter.interaction_date,
          inter.duration_minutes,
          inter.summary,
          inter.outcome,
          inter.follow_up_required,
          inter.follow_up_date,
          inter.sentiment,
        ]
      );
    }

    // 8. Meetings
    const meetingsData = [
      {
        contact_id: priyaId,
        goal_id: goalIds[1],
        title: 'Follow-up on AI Agent Protocols',
        meeting_type: 'video',
        start_at: '2026-09-22 10:00:00',
        end_at: '2026-09-22 10:45:00',
        location: 'Google Meet',
        meeting_url: 'https://meet.google.com/nex-crm-sync',
        agenda: '1. Review draft agent schemas\n2. Discuss privacy isolation for enterprise CRM\n3. Schedule joint workshop',
        outcome: null,
        follow_up_date: '2026-09-25',
      },
      {
        contact_id: amitId,
        goal_id: goalIds[0],
        title: 'SynthAI Demo Walkthrough & Pitch Prep',
        meeting_type: 'coffee',
        start_at: '2026-09-19 14:00:00',
        end_at: '2026-09-19 15:00:00',
        location: 'Sightglass Coffee, SOMA, SF',
        meeting_url: null,
        agenda: 'Review final live demo before VC pitches next week.',
        outcome: null,
        follow_up_date: '2026-09-21',
      },
      {
        contact_id: mayaId,
        goal_id: goalIds[2],
        title: 'Design Studio CRM Workflow Demo',
        meeting_type: 'video',
        start_at: '2026-09-18 17:00:00',
        end_at: '2026-09-18 17:30:00',
        location: 'Zoom',
        meeting_url: 'https://zoom.us/j/918237465',
        agenda: 'Walkthrough Kanban board, interaction timeline, and automated follow-up reminders for design clients.',
        outcome: null,
        follow_up_date: '2026-09-20',
      },
      {
        contact_id: nehaId,
        goal_id: goalIds[0],
        title: 'Quarterly Venture Portfolio Round Table',
        meeting_type: 'office',
        start_at: '2026-09-25 09:30:00',
        end_at: '2026-09-25 11:00:00',
        location: 'Horizon Capital, 101 California St, SF',
        meeting_url: null,
        agenda: 'Quarterly review of emerging AI infra startups and syndication opportunities.',
        outcome: null,
        follow_up_date: '2026-09-27',
      },
    ];

    for (const m of meetingsData) {
      await connection.execute(
        `INSERT INTO meetings (
          user_id, contact_id, goal_id, title, meeting_type, start_at, end_at, location, meeting_url, agenda, outcome, follow_up_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          m.contact_id,
          m.goal_id,
          m.title,
          m.meeting_type,
          m.start_at,
          m.end_at,
          m.location,
          m.meeting_url,
          m.agenda,
          m.outcome,
          m.follow_up_date,
        ]
      );
    }

    // 9. Tasks (Kanban / Productivity)
    const tasksData = [
      {
        title: 'Follow up with Maya Lin on CRM demo agenda',
        description: 'Send Zoom link and pre-read notes on Studio Matrix requirements.',
        contact_id: mayaId,
        goal_id: goalIds[2],
        status: 'todo',
        priority: 'urgent',
        due_date: '2026-09-18',
        sort_order: 10,
      },
      {
        title: 'Send SynthAI memo to Neha Verma',
        description: 'Include 1-pager summary, traction metrics, and founder bios.',
        contact_id: nehaId,
        goal_id: goalIds[0],
        status: 'in_progress',
        priority: 'high',
        due_date: '2026-09-19',
        sort_order: 20,
      },
      {
        title: 'Prepare discussion points for Priya Sharma follow-up',
        description: 'Use AI Conversation Assistant to formulate 3 high-impact questions on agent safety.',
        contact_id: priyaId,
        goal_id: goalIds[1],
        status: 'in_progress',
        priority: 'medium',
        due_date: '2026-09-21',
        sort_order: 30,
      },
      {
        title: 'Review Elena Rostova AI Keynote outline',
        description: 'Confirm 30-minute speaking slot at DevSphere Conference.',
        contact_id: contactMap['Elena Rostova'],
        goal_id: goalIds[3],
        status: 'todo',
        priority: 'medium',
        due_date: '2026-09-20',
        sort_order: 40,
      },
      {
        title: 'Met with Amit Patel & reviewed Seed pitch',
        description: 'Completed 60-min in-person feedback session.',
        contact_id: amitId,
        goal_id: goalIds[0],
        status: 'done',
        priority: 'high',
        due_date: '2026-09-12',
        sort_order: 50,
      },
      {
        title: 'Shared open-source React agent repo with David Chen',
        description: 'Reviewed edge rendering PR and benchmark numbers.',
        contact_id: davidId,
        goal_id: goalIds[1],
        status: 'done',
        priority: 'low',
        due_date: '2026-09-11',
        sort_order: 60,
      },
    ];

    for (const t of tasksData) {
      await connection.execute(
        `INSERT INTO tasks (user_id, contact_id, goal_id, title, description, status, priority, due_date, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, t.contact_id, t.goal_id, t.title, t.description, t.status, t.priority, t.due_date, t.sort_order]
      );
    }

    // 10. Notes
    const notesData = [
      {
        contact_id: priyaId,
        title: 'Key Insights: Enterprise AI Agent Architecture',
        content: 'Priya emphasized that enterprise clients prioritize deterministic control boundaries over pure autonomy. Recommended building explicit human-in-the-loop review screens for all external communication.',
        is_pinned: 1,
      },
      {
        contact_id: amitId,
        title: 'SynthAI Investor Pitch & Unit Economics',
        content: 'Current ARR: $280k. CAC payback: 4.2 months. Seeking $4M round led by tier-1 funds. Top pipeline clients include 2 Fortune 500 financial institutions.',
        is_pinned: 1,
      },
      {
        contact_id: null,
        title: 'Q3 Networking Master Plan',
        content: 'Focus areas: 1) AI Agents 2) High-signal founder coffee chats 3) Expand angel syndication network. Keep all interactions logged in NexaLink within 24 hours.',
        is_pinned: 0,
      },
    ];

    for (const n of notesData) {
      await connection.execute(
        `INSERT INTO notes (user_id, contact_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)`,
        [userId, n.contact_id, n.title, n.content, n.is_pinned]
      );
    }

    // 11. Recommendations
    const recommendationsData = [
      {
        recommended_name: 'Dr. Aris Thorne',
        recommended_role: 'Chief Scientist & Co-Founder',
        recommended_company: 'HyperScale AI',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        industry: 'Artificial Intelligence',
        skills: JSON.stringify(['Distributed Training', 'LLM Alignment', 'PyTorch']),
        reason: 'You both share interests in autonomous agent architectures and have 3 mutual colleagues at Google Research.',
        score: 94,
        status: 'pending',
      },
      {
        recommended_name: 'Sarah Jenkins',
        recommended_role: 'Partner',
        recommended_company: 'Sequoia Surge',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        industry: 'Venture Capital',
        skills: JSON.stringify(['Seed Investing', 'B2B SaaS', 'Board Advisory']),
        reason: 'Actively investing in developer infrastructure tools matching your current goal "Connect with 20 AI Founders".',
        score: 91,
        status: 'pending',
      },
      {
        recommended_name: 'Marcus Brody',
        recommended_role: 'VP of Product Engineering',
        recommended_company: 'Datastream Inc',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        industry: 'Cloud Infrastructure',
        skills: JSON.stringify(['Distributed Systems', 'Postgres/MySQL', 'Kubernetes']),
        reason: 'Both located in SF Bay Area with shared focus on real-time database indexing and scalable CRM architectures.',
        score: 87,
        status: 'pending',
      },
    ];

    for (const r of recommendationsData) {
      await connection.execute(
        `INSERT INTO recommendations (
          user_id, recommended_name, recommended_role, recommended_company, avatar_url, industry, skills, reason, score, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, r.recommended_name, r.recommended_role, r.recommended_company, r.avatar_url, r.industry, r.skills, r.reason, r.score, r.status]
      );
    }

    // 12. Networking Feed Posts
    const postsData = [
      {
        author_name: 'Priya Sharma',
        author_title: 'Director of Product, AI Ecosystems @ Google',
        author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Excited to announce our new open benchmark for conversational CRM agents! High-signal relationships require transparent, user-controlled AI assistants.',
        tags: JSON.stringify(['AI', 'Product', 'OpenSource']),
        likes_count: 42,
      },
      {
        author_name: 'Amit Patel',
        author_title: 'Co-Founder @ SynthAI',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Productive coffee with Rahul Mehta reviewing our multi-agent architecture. The Bay Area builder energy is unmatched this month.',
        tags: JSON.stringify(['Startups', 'Networking', 'SFTech']),
        likes_count: 28,
      },
      {
        author_name: 'Elena Rostova',
        author_title: 'Head of DevRel @ DevSphere',
        author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        content: 'Speaker lineup for the Seattle AI Summit is coming together! Topics include real-time relational caching, full-stack TypeScript, and AI-driven CRM workflows.',
        tags: JSON.stringify(['Conference', 'DevRel', 'TechEvents']),
        likes_count: 19,
      },
    ];

    for (const p of postsData) {
      await connection.execute(
        `INSERT INTO posts (user_id, author_name, author_title, author_avatar, content, tags, likes_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, p.author_name, p.author_title, p.author_avatar, p.content, p.tags, p.likes_count]
      );
    }

    // 13. Notifications
    const notificationsData = [
      {
        type: 'follow_up_due',
        title: 'Follow-up Due Today: Maya Lin',
        message: 'You have a scheduled demo follow-up with Maya Lin (Studio Matrix).',
        entity_type: 'contact',
        entity_id: mayaId,
        is_read: 0,
      },
      {
        type: 'meeting_reminder',
        title: 'Upcoming Meeting: Design Studio CRM Demo',
        message: 'Today at 5:00 PM via Zoom with Maya Lin.',
        entity_type: 'meeting',
        entity_id: 3,
        is_read: 0,
      },
      {
        type: 'goal_deadline',
        title: 'Goal Milestone: 70% Reached',
        message: 'You have achieved 14/20 connections for "Connect with 20 AI Founders".',
        entity_type: 'goal',
        entity_id: goalIds[0],
        is_read: 1,
      },
      {
        type: 'ai_suggestion',
        title: 'AI Networking Insight',
        message: 'You have not reached out to Alex Morgan in 21 days. Consider sending a reconnect note.',
        entity_type: 'contact',
        entity_id: contactMap['Alex Morgan'],
        is_read: 0,
      },
    ];

    for (const notif of notificationsData) {
      await connection.execute(
        `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, notif.type, notif.title, notif.message, notif.entity_type, notif.entity_id, notif.is_read]
      );
    }

    // 14. Audit Logs
    await connection.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'SYSTEM_SEED_INITIALIZED',
        'system',
        userId,
        JSON.stringify({ note: 'Initial development database seed completed successfully' }),
        '127.0.0.1',
        'NexaLink Seed Engine',
      ]
    );

    console.log('✅ Seed data inserted successfully!');
    console.log('🔑 Demo Login Credentials:');
    console.log('   Email:    demo@nexalink.com');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

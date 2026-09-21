"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeds = runSeeds;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
async function runSeeds() {
    console.log('🌱 Seeding database:', env_1.config.db.database);
    const connection = await promise_1.default.createConnection({
        host: env_1.config.db.host,
        port: env_1.config.db.port,
        user: env_1.config.db.user,
        password: env_1.config.db.password,
        database: env_1.config.db.database,
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
        const passwordHash = await bcryptjs_1.default.hash('password123', 10);
        const usersToSeed = [
            {
                name: 'Sanjeev Sarma',
                email: 'sanjeev.sarma@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                headline: 'Strategic Director & Tech Advisor',
                bio: 'Building high-growth teams and strategic partnerships.',
                company: 'NexaLink Enterprise',
                role: 'Director of Strategy',
                location: 'Mumbai, India',
                industry: 'Technology / SaaS',
                persona: 'Strategic Leader',
            },
            {
                name: 'Geeta Rathod',
                email: 'geeta.rathod@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                headline: 'VP of People & Culture',
                bio: 'Passionate about talent, leadership, and high-trust organizations.',
                company: 'NexaLink Enterprise',
                role: 'VP of People',
                location: 'Bengaluru, India',
                industry: 'Human Resources / Talent',
                persona: 'People & Talent Leader',
            },
            {
                name: 'Vinay Mishra',
                email: 'vinay.mishra@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                headline: 'Lead Solutions Architect',
                bio: 'Designing scalable cloud architecture and enterprise systems.',
                company: 'NexaLink Enterprise',
                role: 'Lead Solutions Architect',
                location: 'Delhi, India',
                industry: 'Cloud Architecture',
                persona: 'Technical Architect',
            },
            {
                name: 'Abhinav N',
                email: 'abhinav.n@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
                headline: 'Senior Product Manager',
                bio: 'Crafting user-centric products and leading agile delivery.',
                company: 'NexaLink Enterprise',
                role: 'Senior Product Manager',
                location: 'Hyderabad, India',
                industry: 'Product Management',
                persona: 'Product Innovator',
            },
            {
                name: 'Devyani',
                email: 'devyani@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
                headline: 'Head of Design & UX',
                bio: 'Creating intuitive, accessible, and delight-driven product experiences.',
                company: 'NexaLink Enterprise',
                role: 'Head of Design',
                location: 'Pune, India',
                industry: 'Product Design / UX',
                persona: 'Design Visionary',
            },
            {
                name: 'Abhishek Tiwari',
                email: 'abhishek.tiwari@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
                headline: 'Senior Engineering Manager',
                bio: 'Leading engineering teams building mission-critical platforms.',
                company: 'NexaLink Enterprise',
                role: 'Senior Engineering Manager',
                location: 'Bengaluru, India',
                industry: 'Software Engineering',
                persona: 'Engineering Leader',
            },
            {
                name: 'Hitesh Mishra',
                email: 'hitesh.mishra@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                headline: 'Head of Business Development',
                bio: 'Driving strategic revenue growth and channel partnerships.',
                company: 'NexaLink Enterprise',
                role: 'Head of Business Development',
                location: 'Gurugram, India',
                industry: 'Business Development',
                persona: 'Dealmaker & Strategist',
            },
            {
                name: 'Mayur Tiwari',
                email: 'mayur.tiwari@nexalink.com',
                avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
                headline: 'Operations & Growth Lead',
                bio: 'Optimizing cross-functional operations and execution speed.',
                company: 'NexaLink Enterprise',
                role: 'Operations & Growth Lead',
                location: 'Noida, India',
                industry: 'Operations & Growth',
                persona: 'Operations Architect',
            },
        ];
        for (const u of usersToSeed) {
            const [res] = await connection.execute(`INSERT INTO users (email, password_hash, display_name, avatar_url, status)
         VALUES (?, ?, ?, ?, ?)`, [u.email, passwordHash, u.name, u.avatar, 'active']);
            const uid = res.insertId;
            await connection.execute(`INSERT INTO user_profiles (
          user_id, headline, bio, company, job_title, location, industry, timezone, skills, interests, networking_goals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                uid,
                u.headline,
                u.bio,
                u.company,
                u.role,
                u.location,
                u.industry,
                'Asia/Kolkata',
                JSON.stringify(['Leadership', 'Strategic Planning', 'Collaboration']),
                JSON.stringify(['Enterprise SaaS', 'Innovation']),
                JSON.stringify(['Build strategic network']),
            ]);
            await connection.execute(`INSERT INTO user_personas (
          user_id, persona_name, communication_style, preferred_people, networking_goal, interests, confidence, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                uid,
                u.persona,
                'Professional, Strategic & Direct',
                'Industry Leaders, Founders, Partners',
                'Build long-term high-value relationships',
                'Enterprise Innovation & Scaling',
                90,
                1,
            ]);
        }
        console.log('✅ Seed completed successfully with 8 users!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await connection.end();
    }
}
if (require.main === module) {
    runSeeds()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

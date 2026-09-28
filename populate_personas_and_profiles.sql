-- ====================================================================
-- NexaLink CRM — Persona & Profile Update Script
-- Context: B2B, B2C, SME, SMB Business Profiles
-- Note: Excludes Sanjeev Sarma and Abhishek Tiwari profiles
-- Note: avatar_url is explicitly set to NULL (No profile pics used)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure avatar_url is cleared (NULL) only for target profiles (excludes user_id 1 and 9)
UPDATE `users` SET `avatar_url` = NULL WHERE `user_id` NOT IN (1, 9);
UPDATE `user_profiles` SET `avatar_url` = NULL WHERE `user_id` NOT IN (1, 9);

-- --------------------------------------------------------------------
-- 2. GEETA RATHOD (user_id = 2) — B2B SMB HR & Talent Leader
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    2,
    'Building High-Performance Remote Teams & B2B SMB Hiring Pipelines',
    'VP of People & Talent Solutions at Zenith HR. Passionate about helping growing SMB tech companies build remote engineering teams, optimize candidate pipelines, and design high-trust organizational cultures.',
    'Zenith HR Solutions (SMB)',
    'VP of People & Talent Acquisition',
    'Bengaluru, India',
    'B2B HR Tech & SMB Talent Services',
    'https://zenithhr.example.com',
    'https://linkedin.com/in/geeta-rathod-hr',
    '+91-9876543210',
    'Asia/Kolkata',
    NULL,
    '["B2B Recruitment", "Talent Acquisition", "SMB Team Scaling", "HR Automation", "Remote Team Leadership"]',
    '["B2B SaaS Growth", "HR Tech Innovation", "Employee Retention", "Talent Analytics"]',
    '["Connect with SMB founders hiring remote engineers", "Partner with B2B HR tech software vendors", "Build mentor network for HR leaders"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    2,
    'B2B SMB HR & Talent Leader',
    'Empathetic, Structured & Solution-Oriented',
    'SMB Founders, VP of Engineering, HR Directors, B2B SaaS Executives',
    'Expand B2B talent consulting client base across growing SMBs and build strategic hiring alliances.',
    'Remote Work Infrastructure, B2B Recruitment Automation, Organizational Culture',
    90,
    1
);

-- --------------------------------------------------------------------
-- 3. VINAY MISHRA (user_id = 3) — B2B SME Cloud & Technical Architect
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    3,
    'Designing Resilient Multi-Cloud Systems & DevOps Pipelines for B2B SMEs',
    'Principal Architect at CloudScale Systems. 12+ years in cloud infrastructure, microservices architecture, AWS/GCP migration, and enterprise security compliance for mid-sized business enterprises (SMEs).',
    'CloudScale Systems (SME)',
    'Principal Cloud Architect',
    'Delhi NCR, India',
    'B2B Cloud Infrastructure & SME Enterprise IT',
    'https://cloudscalesystems.example.com',
    'https://linkedin.com/in/vinay-mishra-cloud',
    '+91-9876543211',
    'Asia/Kolkata',
    NULL,
    '["Cloud Architecture", "AWS & Kubernetes", "B2B SaaS Infrastructure", "DevOps Pipelines", "Cloud FinOps"]',
    '["Serverless Microservices", "Cybersecurity Compliance", "Cloud Cost Optimization", "Infrastructure as Code"]',
    '["Advise SME CTOs on cloud cost reduction", "Connect with B2B tech solution partners", "Explore enterprise multi-cloud tools"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    3,
    'B2B SME Cloud & Technical Architect',
    'Technical, Data-Driven & Precise',
    'CTOs, VP of Engineering, DevOps Engineers, Enterprise IT Auditors',
    'Connect with B2B SME executives needing cloud modernization, security audits, and infrastructure cost optimization.',
    'Kubernetes Scaling, AWS Security Best Practices, FinOps & Infrastructure Management',
    92,
    1
);

-- --------------------------------------------------------------------
-- 4. ABHINAV N (user_id = 4) — B2C SMB E-Commerce Growth Specialist
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    4,
    'Driving Retention, Customer LTV & AI Personalization for B2C Brands',
    'Product & Growth Lead at UrbanLifestyle Goods. Specializing in D2C e-commerce growth strategies, customer lifecycle marketing, conversion funnel optimization, and AI-driven buyer personalization for SMB retailers.',
    'UrbanLifestyle Goods (B2C SMB)',
    'Growth & Product Lead',
    'Hyderabad, India',
    'B2C E-Commerce & Retail Tech',
    'https://urbanlifestyle.example.com',
    'https://linkedin.com/in/abhinav-n-growth',
    '+91-9876543212',
    'Asia/Kolkata',
    NULL,
    '["B2C Marketing", "Funnel Optimization", "E-Commerce Growth", "Customer LTV", "Performance Ads"]',
    '["D2C Brands", "Customer Behavior AI", "Omnichannel Retail", "Growth Hacking"]',
    '["Discover B2C marketing automation tools", "Partner with shipping & payment gateways", "Connect with retail founders"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    4,
    'B2C SMB E-Commerce Growth Specialist',
    'Energetic, Metric-Driven & Creative',
    'D2C Founders, E-Commerce Managers, Performance Marketers, Brand Agency Leads',
    'Exchange B2C conversion tactics, evaluate customer acquisition tools, and form SMB retail partnerships.',
    'Consumer Analytics, AI Personalization Engines, Viral Retention Loops',
    88,
    1
);

-- --------------------------------------------------------------------
-- 5. DEVYANI (user_id = 5) — B2B/B2C Creative Product Design Leader
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    5,
    'Crafting High-Converting UI/UX for B2B Apps & B2C Consumer Platforms',
    'Founder & Creative Director at PixelCraft Studio. Leading a boutique design team empowering SMEs, B2B SaaS startups, and consumer mobile apps with user-centered interface design, UX research, and brand systems.',
    'PixelCraft Studio (SME)',
    'Founder & Creative Director',
    'Pune, India',
    'B2B & B2C Product Design Agency',
    'https://pixelcraft.example.com',
    'https://linkedin.com/in/devyani-design',
    '+91-9876543213',
    'Asia/Kolkata',
    NULL,
    '["UI/UX Design", "B2C Mobile App UX", "Design Systems", "User Research", "Conversion UX"]',
    '["Design System Architecture", "Micro-Interactions", "Mobile Accessibility", "Design-Driven Growth"]',
    '["Build agency partnerships with B2B SaaS founders", "Find B2C product redesign projects", "Network with product leads"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    5,
    'B2B/B2C Creative Product Design Leader',
    'Collaborative, Visual & Insightful',
    'Product Managers, SaaS Founders, Chief Marketing Officers, Mobile App Developers',
    'Partner with B2B SaaS and B2C mobile apps needing end-to-end product design revamps and UI design systems.',
    'User Psychology, Design-Led Growth, Interactive Prototyping',
    95,
    1
);

-- --------------------------------------------------------------------
-- 6. HITESH MISHRA (user_id = 7) — B2B SME Corporate Sales & Partnerships Lead
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    7,
    'Driving B2B Enterprise Alliances & SME Supply Chain Logistics',
    'Head of Business Development at Apex Global Logistics. Focused on B2B enterprise deal structuring, key account management, supply chain optimization, and expanding partner logistics networks across domestic SME manufacturing hubs.',
    'Apex Global Logistics (SME)',
    'Head of Business Development',
    'Gurugram, India',
    'B2B Logistics & SME Supply Chain',
    'https://apexlogistics.example.com',
    'https://linkedin.com/in/hitesh-mishra-bd',
    '+91-9876543214',
    'Asia/Kolkata',
    NULL,
    '["B2B Enterprise Sales", "Key Account Management", "Contract Negotiation", "SME Logistics", "Partner Alliances"]',
    '["Supply Chain Technology", "Cross-Border Trade", "B2B Deal Structuring", "Sales Pipeline Automation"]',
    '["Expand B2B enterprise client portfolio", "Form channel partnerships with freight software", "Connect with SME manufacturers"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    7,
    'B2B SME Corporate Sales & Partnerships Lead',
    'Direct, Negotiation-Oriented & Results-Focused',
    'Procurement Directors, Supply Chain VPs, B2B Sales Executives, Logistics Managers',
    'Secure strategic B2B supply chain contracts with growing SMEs and enterprise manufacturing clients.',
    'B2B Sales Tactics, Freight Automation, High-Value Commercial Deals',
    91,
    1
);

-- --------------------------------------------------------------------
-- 7. MAYUR TIWARI (user_id = 8) — B2C Fintech & SMB Merchant Growth Lead
-- --------------------------------------------------------------------
INSERT INTO `user_profiles` (
    `user_id`, `headline`, `bio`, `company`, `job_title`, `location`, `industry`, 
    `website`, `linkedin_url`, `phone`, `timezone`, `avatar_url`, `skills`, `interests`, `networking_goals`
) VALUES (
    8,
    'Scaling Digital Payment Adoption for SMB Merchants & B2C Retailers',
    'Head of Operations at PayQuick Solutions. Overseeing merchant onboarding, fraud risk mitigation, and operational workflow automation for a B2C payment gateway catering to local SMB retailers and digital storefronts.',
    'PayQuick Solutions (SMB)',
    'Head of Operations & Growth',
    'Noida, India',
    'B2C Fintech & SMB Payments',
    'https://payquick.example.com',
    'https://linkedin.com/in/mayur-tiwari-ops',
    '+91-9876543215',
    'Asia/Kolkata',
    NULL,
    '["Merchant Operations", "SMB Payment Gateways", "B2C Fintech", "Fraud Risk Management", "Workflow Automation"]',
    '["Financial Inclusion", "POS System Integration", "Digital Payment Innovations", "Operations Research"]',
    '["Connect with SMB retail associations", "Partner with POS software developers", "Streamline merchant onboarding"]'
) ON DUPLICATE KEY UPDATE 
    `headline` = VALUES(`headline`),
    `bio` = VALUES(`bio`),
    `company` = VALUES(`company`),
    `job_title` = VALUES(`job_title`),
    `location` = VALUES(`location`),
    `industry` = VALUES(`industry`),
    `website` = VALUES(`website`),
    `linkedin_url` = VALUES(`linkedin_url`),
    `phone` = VALUES(`phone`),
    `timezone` = VALUES(`timezone`),
    `avatar_url` = NULL,
    `skills` = VALUES(`skills`),
    `interests` = VALUES(`interests`),
    `networking_goals` = VALUES(`networking_goals`);

INSERT INTO `user_personas` (
    `user_id`, `persona_name`, `communication_style`, `preferred_people`, `networking_goal`, `interests`, `confidence`, `is_active`
) VALUES (
    8,
    'B2C Fintech & SMB Merchant Growth Lead',
    'Pragmatic, Process-Driven & Strategic',
    'Retail Business Owners, Fintech Operations Leads, Compliance Officers, Payment Partners',
    'Accelerate merchant acquisition across SMB retail sectors and build seamless digital payment operations.',
    'Fintech Infrastructure, Merchant Retention, Payment Gateway Scaling',
    89,
    1
);

SET FOREIGN_KEY_CHECKS = 1;

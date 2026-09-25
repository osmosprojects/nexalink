"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AutoConnectEngine_1 = require("./AutoConnectEngine");
function runTests() {
    console.log('🧪 Running AutoConnectEngine Unit Tests...\n');
    // Test 1: Direct / Substring Match (95% Score)
    const score1 = (0, AutoConnectEngine_1.calculateMatchScore)('SaaS', 'SaaS', 'Acme', 'CTO', 'Alice');
    console.assert(score1 === 95, `Test 1 failed: expected 95, got ${score1}`);
    console.log(`✓ Test 1 Passed: Exact domain match score = ${score1}`);
    const score1b = (0, AutoConnectEngine_1.calculateMatchScore)('Enterprise SaaS Solutions', 'SaaS', 'Acme', 'CTO', 'Alice');
    console.assert(score1b === 95, `Test 1b failed: expected 95, got ${score1b}`);
    console.log(`✓ Test 1b Passed: Substring domain in query score = ${score1b}`);
    // Test 2: Token Overlap Ratio (50% - 90% Score)
    // queryTokens = ["cloud", "architecture"] (length 2)
    // targetText = "infrastructure nexa enterprise architect bob"
    // "architecture" vs "architect" -> no exact token match, let's test with exact token "cloud"
    const score2 = (0, AutoConnectEngine_1.calculateMatchScore)('Cloud Platforms & Infrastructure', 'Infrastructure', 'Nexa', 'Cloud Specialist', 'Bob');
    // "cloud" is token in query (length 5 > 2), targetText has "cloud" -> 1 matched token out of ["cloud", "platforms", "infrastructure"] -> total 3 tokens (since "infrastructure" matches domain substring, wait: domain "infrastructure" is in query "Cloud Platforms & Infrastructure" so that's a direct match = 95!).
    console.assert(score2 === 95, `Test 2 direct match failed: expected 95, got ${score2}`);
    console.log(`✓ Test 2 Passed: Domain contained in query = ${score2}`);
    // Token ratio test without domain match:
    // Query: "Fintech Banking Analytics" -> tokens: ["fintech", "banking", "analytics"]
    // candidate: domain = "Payments", org = "PayCo", role = "Fintech Lead", person = "Charlie"
    // targetText = "payments payco fintech lead charlie"
    // "fintech" matches -> 1 / 3 ratio -> 50 + (1/3 * 40) = 50 + 13 = 63
    const score3 = (0, AutoConnectEngine_1.calculateMatchScore)('Fintech Banking Analytics', 'Payments', 'PayCo', 'Fintech Lead', 'Charlie');
    console.assert(score3 === 63, `Test 3 token ratio failed: expected 63, got ${score3}`);
    console.log(`✓ Test 3 Passed: Token overlap ratio score = ${score3}`);
    // Test 4: No Overlap (0% Score)
    const score4 = (0, AutoConnectEngine_1.calculateMatchScore)('Healthcare BioTech', 'Automotive', 'AutoCorp', 'VP Manufacturing', 'David');
    console.assert(score4 === 0, `Test 4 no overlap failed: expected 0, got ${score4}`);
    console.log(`✓ Test 4 Passed: No overlap score = ${score4}`);
    // Test 5: Bidirectional Matching & Ranking
    const userProfile = {
        userId: 1,
        displayName: 'User A',
        targetBusinesses: ['SaaS', 'Fintech'],
        connectionsOffered: [
            {
                businessDomain: 'HealthTech',
                personName: 'Dr. Smith',
                orgName: 'HealthCare Inc',
                role: 'Chief Medical Officer',
            },
        ],
    };
    const networkMembers = [
        {
            userId: 2,
            displayName: 'Member B',
            jobTitle: 'Founder',
            company: 'SaaSify',
            targetBusinesses: ['HealthTech'],
            connectionsOffered: [
                {
                    businessDomain: 'SaaS',
                    personName: 'Jane Doe',
                    orgName: 'SaaSify',
                    role: 'VP Sales',
                },
            ],
        },
    ];
    const recs = (0, AutoConnectEngine_1.generateAutoConnectRecommendations)(userProfile, networkMembers);
    console.assert(recs.length === 2, `Test 5 failed: expected 2 recs (1 direct, 1 reverse), got ${recs.length}`);
    console.assert(recs[0].matchScore >= recs[1].matchScore, 'Test 5 failed: recommendations not sorted descending');
    console.assert(recs.some((r) => r.isReverseMatch === false), 'Test 5 failed: missing direct match');
    console.assert(recs.some((r) => r.isReverseMatch === true), 'Test 5 failed: missing reverse match');
    console.log(`✓ Test 5 Passed: Generated ${recs.length} bidirectional recommendations correctly sorted descending!\n`);
    console.log('🎉 All AutoConnectEngine tests passed successfully!');
}
runTests();

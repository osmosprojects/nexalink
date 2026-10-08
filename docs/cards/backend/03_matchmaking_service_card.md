# Backend Card: Matchmaking Service Card

## 1. Overview
The **Matchmaking Service** (`backend/src/services/MatchmakingService.ts`) runs the platform-wide multi-vector matchmaking algorithm (0–100 points) and precomputes candidate compatibility scores into MySQL (`user_match_scores` and `user_recommendations`).

- **Primary Source Files:**
  - Service: `backend/src/services/MatchmakingService.ts`
  - Taxonomy: `backend/src/config/GoalTaxonomy.ts`
  - Cron Job: `backend/src/jobs/matchmakingCron.ts`
  - Repositories: `UserMatchScoreRepository.ts`, `RecommendationRepository.ts`

---

## 2. 100-Point Scoring Breakdown

The final score is synthesized across 7 orthogonal dimensions (capped at 98 pts):

```text
+-------------------------------------------------------------+
| Dimension                                     Max Points    |
+-------------------------------------------------------------+
| 1. Shared Networking Groups                   30 pts        |
| 2. Hobbies & Personal Interests               25 pts        |
| 3. Target Industry Overlap                    15 pts        |
| 4. Offered Services & Domain Synergy          20 pts        |
| 5. Strategic Intent Complementarity (Taxonomy)20 pts        |
| 6. Geographic / Expansion Match               15 pts        |
| 7. Profile Completeness Health                 5 pts        |
+-------------------------------------------------------------+
```

---

## 3. Complementarity & Taxonomy Rules

```typescript
// backend/src/config/GoalTaxonomy.ts
export const GOAL_COMPLEMENT_MAP: Record<NetworkingGoalEnum, GoalComplementRule> = {
  find_investors: {
    targetJobKeywords: ['angel', 'investor', 'partner', 'venture', 'vc', 'capital'],
    targetBridgeDomains: ['Venture Capital', 'Angel Investing', 'Private Equity', 'Finance'],
  },
  find_co_founder: {
    targetJobKeywords: ['cto', 'architect', 'engineer', 'product', 'designer'],
    targetBridgeDomains: ['Software', 'DeepTech', 'AI', 'Product Design'],
  },
  hire_talent: {
    targetJobKeywords: ['recruiter', 'talent', 'headhunter', 'hr'],
    targetBridgeDomains: ['Recruitment', 'Staffing', 'Human Resources'],
  },
  find_clients: {
    targetJobKeywords: ['procurement', 'director', 'vp', 'head of', 'cxo', 'buyer'],
    targetBridgeDomains: ['Enterprise SaaS', 'Consulting', 'B2B Services'],
  },
};
```

---

## 4. Precomputation & Cron Sync

1. **Daily Cron Trigger:** `backend/src/jobs/matchmakingCron.ts` runs automatically at midnight (and on server bootstrap).
2. **Matrix Sweep:** Calculates Cartesian product of active user profiles:
   ```sql
   INSERT INTO user_match_scores (user_id, target_user_id, score, reasons, updated_at)
   VALUES (?, ?, ?, ?, NOW())
   ON DUPLICATE KEY UPDATE score = VALUES(score), reasons = VALUES(reasons), updated_at = NOW();
   ```
3. **Recommendation Sync:** Generates top $N$ high-affinity pending recommendations into `user_recommendations` table.

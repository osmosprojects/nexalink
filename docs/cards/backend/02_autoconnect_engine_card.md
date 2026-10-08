# Backend Card: AutoConnect Engine Card

## 1. Overview
The **AutoConnect Engine** (`backend/src/services/AutoConnectEngine.ts`) implements deterministic matching between a user's target business needs and network members' offered bridges. It provides two-tier scoring (exact substring vs. token overlap ratio), reverse match detection, and warm intro draft synthesis.

- **Primary Source Files:**
  - Service: `backend/src/services/AutoConnectEngine.ts`
  - Unit Tests: `backend/src/services/AutoConnectEngine.test.ts`

---

## 2. Match Scoring Mathematical Model

### A. Cleaning & Tokenization
- Normalize query to lowercase and trim.
- Split by delimiters `[\s,&\/-]+`.
- Filter out stop words and short tokens ($\le 2$ characters).

### B. Tier 1: Direct / Substring Match (95% Score)
If the combined bridge text (`domain + org + role + person`) contains the exact query string, or the candidate's domain is explicitly contained within the user's query:
$$\text{Score} = 95$$

### C. Tier 2: Token Overlap Ratio (50% – 90% Score)
If direct substring matching fails, the engine measures token overlap:
$$\text{Ratio} = \frac{\text{Matched Tokens}}{\max(\text{Total Query Tokens}, 1)}$$
$$\text{Score} = \text{round}(50 + (\text{Ratio} \times 40))$$

If matched tokens is 0:
$$\text{Score} = 0 \quad (\text{Pair is excluded})$$

---

## 3. Core Implementation

```typescript
export function calculateMatchScore(
  query: string,
  domain: string,
  org: string,
  role: string,
  person: string
): number {
  const cleanedQuery = (query || '').toLowerCase().trim();
  if (!cleanedQuery) return 0;

  const queryTokens = cleanedQuery
    .split(/[\s,&\/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const domainLower = (domain || '').toLowerCase().trim();
  const orgLower = (org || '').toLowerCase().trim();
  const roleLower = (role || '').toLowerCase().trim();
  const personLower = (person || '').toLowerCase().trim();

  const targetText = `${domainLower} ${orgLower} ${roleLower} ${personLower}`.trim();

  // Tier 1: Substring match
  const isDirectSubstringMatch =
    (targetText.length > 0 && targetText.includes(cleanedQuery)) ||
    (domainLower.length > 0 && cleanedQuery.includes(domainLower));

  if (isDirectSubstringMatch) {
    return 95;
  }

  // Tier 2: Token overlap ratio
  if (queryTokens.length > 0) {
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (targetText.includes(token)) matchedTokens++;
    }

    if (matchedTokens > 0) {
      const ratio = matchedTokens / Math.max(queryTokens.length, 1);
      return Math.round(50 + ratio * 40);
    }
  }

  return 0;
}
```

---

## 4. Reverse Matching Logic

A match is bidirectional when:
1. Member $B$ offers a bridge matching User $A$'s target business query.
2. Member $B$'s target businesses simultaneously match User $A$'s offerings, company, or domain.

When bidirectional synergy is verified:
- `isReverseMatch = true`
- An extra strategic rationale is appended to the recommendation.
- An email draft is personalized highlighting reciprocal value.

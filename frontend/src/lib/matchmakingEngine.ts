import { ConnectablePerson, UserProfile, AutoConnectRecommendation } from '../types';

/**
 * 1. Scoring Logic: calculateMatchScore
 * Evaluates compatibility between a search target query and a connectable contact bridge:
 * 
 * @param query - Search target query (e.g. "SaaS", "HealthTech AI")
 * @param domain - Candidate bridge's business domain (e.g. "Software", "FinTech")
 * @param org - Candidate bridge's organization name
 * @param role - Candidate bridge's role/title
 * @param person - Candidate bridge's person name
 * @returns Numerical match score (0, or 50 - 95)
 */
export function calculateMatchScore(
  query: string,
  domain: string,
  org: string,
  role: string,
  person: string
): number {
  // Tokenization & Normalization
  const cleanedQuery = (query || '').toLowerCase().trim();
  if (!cleanedQuery) return 0;

  // Tokenize by delimiters (\s, ,, &, /, -), filtering out short tokens (<= 2 characters)
  const queryTokens = cleanedQuery
    .split(/[\s,&\/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const domainLower = (domain || '').toLowerCase().trim();
  const orgLower = (org || '').toLowerCase().trim();
  const roleLower = (role || '').toLowerCase().trim();
  const personLower = (person || '').toLowerCase().trim();

  // Combine candidate's fields into a single searchable string
  const targetText = `${domainLower} ${orgLower} ${roleLower} ${personLower}`.trim();

  // Two-Tier Match Scoring:
  // Direct / Substring Match (95% Score):
  // If targetText contains exact target query or target query contains business domain, award 95%
  const isDirectSubstringMatch =
    (targetText.length > 0 && targetText.includes(cleanedQuery)) ||
    (domainLower.length > 0 && cleanedQuery.includes(domainLower));

  if (isDirectSubstringMatch) {
    return 95;
  }

  // Token Overlap Ratio (50% - 90% Score):
  if (queryTokens.length > 0) {
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (targetText.includes(token)) {
        matchedTokens++;
      }
    }

    if (matchedTokens > 0) {
      const ratio = matchedTokens / Math.max(queryTokens.length, 1);
      return Math.round(50 + ratio * 40);
    }
  }

  // No Overlap (0% Score)
  return 0;
}

/**
 * 2. Bidirectional Matching Workflow & 3. Ranking & Output
 * 
 * Runs direct (What You Want -> What Network Offer) and reverse (What Network Want -> What You Offer)
 * evaluations, aggregations, and returns sorted AutoConnectRecommendation array.
 */
export function generateAutoConnectRecommendations(
  userProfile: Partial<UserProfile> & { displayName?: string; userId?: number; avatarUrl?: string | null },
  networkMembers: (Partial<UserProfile> & { displayName?: string; userId?: number; avatarUrl?: string | null })[]
): AutoConnectRecommendation[] {
  const recs: AutoConnectRecommendation[] = [];

  const myTargets: string[] = Array.isArray(userProfile.targetBusinesses) ? userProfile.targetBusinesses : [];
  const myBridges: ConnectablePerson[] = Array.isArray(userProfile.connectionsOffered) ? userProfile.connectionsOffered : [];
  const currentUserName = userProfile.displayName || 'You';

  for (const member of networkMembers) {
    const memberId = member.user_id || member.userId;
    const currentUserId = userProfile.user_id || userProfile.userId;
    if (memberId && currentUserId && memberId === currentUserId) continue;

    const memberName = member.displayName || (member as any).display_name || 'Network Member';
    const memberRole = member.job_title || member.headline || 'Professional';
    const memberCompany = member.company || 'Enterprise';
    const memberAvatar = member.avatar_url || member.avatarUrl;

    const memberTargets: string[] = Array.isArray(member.targetBusinesses) ? member.targetBusinesses : [];
    const memberBridges: ConnectablePerson[] = Array.isArray(member.connectionsOffered) ? member.connectionsOffered : [];

    // Direct Matches (isReverseMatch: false): What You Want -> What Network Members Offer
    for (const targetQuery of myTargets) {
      if (!targetQuery || !targetQuery.trim()) continue;

      for (const bridge of memberBridges) {
        const score = calculateMatchScore(
          targetQuery,
          bridge.businessDomain || '',
          bridge.orgName || bridge.relationship || '',
          bridge.role || '',
          bridge.personName || ''
        );

        if (score > 0) {
          const bridgeOrg = bridge.orgName || bridge.relationship || '';
          const reason = `Direct Match (${score}% Synergy): ${memberName} offers a warm intro connection to ${bridge.personName || 'Contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}) in ${bridge.businessDomain || 'Industry'} for your target "${targetQuery}".`;

          const introEmailDraft = `Subject: Warm Intro Request: ${bridge.personName || 'Contact'}${bridgeOrg ? ' at ' + bridgeOrg : ''}\n\nHi ${memberName.split(' ')[0]},\n\nI hope you're having a great week!\n\nI noticed in your network that you have a warm connection with ${bridge.personName || 'a contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}).\n\nI am currently expanding connections in ${targetQuery} and would be very grateful for a quick warm introduction whenever convenient.\n\nBest regards,\n${currentUserName}`;

          recs.push({
            id: `direct-${memberId || memberName}-${bridge.personName || bridge.businessDomain}-${targetQuery}`,
            userId: memberId || 0,
            userName: memberName,
            userRole: memberRole,
            userCompany: memberCompany,
            userAvatar: memberAvatar,
            matchScore: score,
            isReverseMatch: false,
            targetQuery,
            bridgePerson: bridge,
            reason,
            introEmailDraft,
          });
        }
      }
    }

    // Reverse Matches (isReverseMatch: true): What Network Members Want -> What You Offer
    for (const targetQuery of memberTargets) {
      if (!targetQuery || !targetQuery.trim()) continue;

      for (const bridge of myBridges) {
        const score = calculateMatchScore(
          targetQuery,
          bridge.businessDomain || '',
          bridge.orgName || bridge.relationship || '',
          bridge.role || '',
          bridge.personName || ''
        );

        if (score > 0) {
          const bridgeOrg = bridge.orgName || bridge.relationship || '';
          const reason = `Reverse Match (${score}% Synergy): You can provide ${memberName} a warm intro bridge to ${bridge.personName || 'Contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}) for their target "${targetQuery}".`;

          const introEmailDraft = `Subject: Warm Intro Offer: ${bridge.personName || 'Contact'}${bridgeOrg ? ' at ' + bridgeOrg : ''}\n\nHi ${memberName.split(' ')[0]},\n\nI saw that you're actively exploring opportunities in ${targetQuery}.\n\nI have a direct connection in my network, ${bridge.personName || 'a key contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}), and would be happy to facilitate a warm intro for you if helpful!\n\nBest regards,\n${currentUserName}`;

          recs.push({
            id: `reverse-${memberId || memberName}-${bridge.personName || bridge.businessDomain}-${targetQuery}`,
            userId: memberId || 0,
            userName: memberName,
            userRole: memberRole,
            userCompany: memberCompany,
            userAvatar: memberAvatar,
            matchScore: score,
            isReverseMatch: true,
            targetQuery,
            bridgePerson: bridge,
            reason,
            introEmailDraft,
          });
        }
      }
    }
  }

  // Ranking & Output: Sorted descending by matchScore
  return recs.sort((a, b) => b.matchScore - a.matchScore);
}

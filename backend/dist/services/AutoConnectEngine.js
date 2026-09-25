"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMatchScore = calculateMatchScore;
exports.generateAutoConnectRecommendations = generateAutoConnectRecommendations;
/**
 * 1. Scoring Logic: calculateMatchScore
 * Evaluates compatibility between a search target query and a connectable contact bridge:
 *
 * typescript
 * function calculateMatchScore(query: string, domain: string, org: string, role: string, person: string)
 *
 * Tokenization & Normalization:
 * - Cleans the target query (converts to lowercase, trims whitespace).
 * - Tokenizes by delimiters (\s, ,, &, /, -), filtering out short tokens (<= 2 characters).
 * - Combines candidate's fields into a single searchable string:
 *   targetText = "${domain} ${org} ${role} ${person}".toLowerCase()
 *
 * Two-Tier Match Scoring:
 * - Direct / Substring Match (95% Score):
 *   If targetText contains exact target query or target query contains business domain, 95% score is awarded.
 * - Token Overlap Ratio (50% - 90% Score):
 *   If full match fails, count token occurrences:
 *   ratio = matched_tokens / max(total_query_tokens, 1)
 *   score = round(50 + (ratio * 40))
 * - No Overlap (0% Score):
 *   If no tokens match, pair is excluded.
 */
function calculateMatchScore(query, domain, org, role, person) {
    const cleanedQuery = (query || '').toLowerCase().trim();
    if (!cleanedQuery)
        return 0;
    // Tokenize by delimiters (\s, ,, &, /, -), filtering out short tokens (<= 2 characters)
    const queryTokens = cleanedQuery
        .split(/[\s,&\/-]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 2);
    const domainLower = (domain || '').toLowerCase().trim();
    const orgLower = (org || '').toLowerCase().trim();
    const roleLower = (role || '').toLowerCase().trim();
    const personLower = (person || '').toLowerCase().trim();
    // Combine candidate's fields into a single searchable string:
    const targetText = `${domainLower} ${orgLower} ${roleLower} ${personLower}`.trim();
    // Direct / Substring Match (95% Score):
    const isDirectSubstringMatch = (targetText.length > 0 && targetText.includes(cleanedQuery)) ||
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
 * Direct Matches (isReverseMatch: false): What You Want -> What Network Offer
 * Reverse Matches (isReverseMatch: true): What Network Want -> What You Offer
 *
 * Returns array of AutoConnectRecommendation objects sorted descending by matchScore.
 */
function generateAutoConnectRecommendations(userProfile, networkMembers) {
    const recs = [];
    const myTargets = Array.isArray(userProfile.targetBusinesses) ? userProfile.targetBusinesses : [];
    const myBridges = Array.isArray(userProfile.connectionsOffered) ? userProfile.connectionsOffered : [];
    const currentUserName = userProfile.displayName || 'You';
    for (const member of networkMembers) {
        if (member.userId === userProfile.userId)
            continue;
        const memberName = member.displayName || 'Network Member';
        const memberRole = member.jobTitle || 'Professional';
        const memberCompany = member.company || 'Enterprise';
        const memberAvatar = member.avatarUrl;
        const memberTargets = Array.isArray(member.targetBusinesses) ? member.targetBusinesses : [];
        const memberBridges = Array.isArray(member.connectionsOffered) ? member.connectionsOffered : [];
        // 1. Direct Matches (isReverseMatch: false)
        for (const targetQuery of myTargets) {
            if (!targetQuery || !targetQuery.trim())
                continue;
            for (const bridge of memberBridges) {
                const score = calculateMatchScore(targetQuery, bridge.businessDomain || '', bridge.orgName || bridge.relationshipContext || bridge.relationship || '', bridge.role || '', bridge.personName || '');
                if (score > 0) {
                    const bridgeOrg = bridge.orgName || bridge.relationshipContext || bridge.relationship || '';
                    const reason = `Direct Match (${score}% Synergy): ${memberName} offers a warm intro connection to ${bridge.personName || 'Contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}) in ${bridge.businessDomain || 'Industry'} matching your target "${targetQuery}".`;
                    const introEmailDraft = `Subject: Warm Intro Request: ${bridge.personName || 'Contact'}${bridgeOrg ? ' at ' + bridgeOrg : ''}\n\nHi ${memberName.split(' ')[0]},\n\nI hope you're having a great week!\n\nI noticed in your network that you have a warm connection with ${bridge.personName || 'a contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}).\n\nI am currently expanding connections in ${targetQuery} and would be very grateful for a quick warm introduction whenever convenient.\n\nBest regards,\n${currentUserName}`;
                    recs.push({
                        id: `direct-${member.userId}-${bridge.personName || bridge.businessDomain}-${targetQuery}`,
                        userId: member.userId,
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
        // 2. Reverse Matches (isReverseMatch: true)
        for (const targetQuery of memberTargets) {
            if (!targetQuery || !targetQuery.trim())
                continue;
            for (const bridge of myBridges) {
                const score = calculateMatchScore(targetQuery, bridge.businessDomain || '', bridge.orgName || bridge.relationshipContext || bridge.relationship || '', bridge.role || '', bridge.personName || '');
                if (score > 0) {
                    const bridgeOrg = bridge.orgName || bridge.relationshipContext || bridge.relationship || '';
                    const reason = `Reverse Match (${score}% Synergy): You can provide ${memberName} a warm intro bridge to ${bridge.personName || 'Contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}) for their target "${targetQuery}".`;
                    const introEmailDraft = `Subject: Warm Intro Offer: ${bridge.personName || 'Contact'}${bridgeOrg ? ' at ' + bridgeOrg : ''}\n\nHi ${memberName.split(' ')[0]},\n\nI saw that you're actively exploring opportunities in ${targetQuery}.\n\nI have a direct connection in my network, ${bridge.personName || 'a key contact'} (${bridge.role || 'Executive'}${bridgeOrg ? ' at ' + bridgeOrg : ''}), and would be happy to facilitate a warm intro for you if helpful!\n\nBest regards,\n${currentUserName}`;
                    recs.push({
                        id: `reverse-${member.userId}-${bridge.personName || bridge.businessDomain}-${targetQuery}`,
                        userId: member.userId,
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
    // 3. Ranking & Output: Sorted descending by matchScore
    return recs.sort((a, b) => b.matchScore - a.matchScore);
}

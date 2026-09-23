"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOAL_COMPLEMENT_MAP = exports.NetworkingGoalEnum = void 0;
var NetworkingGoalEnum;
(function (NetworkingGoalEnum) {
    NetworkingGoalEnum["SEEKING_COFOUNDER"] = "SEEKING_COFOUNDER";
    NetworkingGoalEnum["SEEKING_INVESTORS"] = "SEEKING_INVESTORS";
    NetworkingGoalEnum["HIRING_ENGINEERS"] = "HIRING_ENGINEERS";
    NetworkingGoalEnum["OFFERS_VC_BRIDGE"] = "OFFERS_VC_BRIDGE";
    NetworkingGoalEnum["SEEKING_MENTOR"] = "SEEKING_MENTOR";
    NetworkingGoalEnum["OFFERS_MENTORSHIP"] = "OFFERS_MENTORSHIP";
    NetworkingGoalEnum["SEEKING_SALES_LEADS"] = "SEEKING_SALES_LEADS";
    NetworkingGoalEnum["OFFERS_BUSINESS_DEV"] = "OFFERS_BUSINESS_DEV";
    NetworkingGoalEnum["SEEKING_STRATEGIC_PARTNERS"] = "SEEKING_STRATEGIC_PARTNERS";
})(NetworkingGoalEnum || (exports.NetworkingGoalEnum = NetworkingGoalEnum = {}));
exports.GOAL_COMPLEMENT_MAP = {
    [NetworkingGoalEnum.SEEKING_COFOUNDER]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_COFOUNDER, NetworkingGoalEnum.SEEKING_STRATEGIC_PARTNERS],
        targetJobKeywords: ['founder', 'co-founder', 'cto', 'ceo', 'entrepreneur'],
        targetBridgeDomains: ['startups', 'technology', 'product'],
    },
    [NetworkingGoalEnum.SEEKING_INVESTORS]: {
        complementaryGoals: [NetworkingGoalEnum.OFFERS_VC_BRIDGE],
        targetJobKeywords: ['investor', 'venture capital', 'vc', 'angel investor', 'partner', 'principal'],
        targetBridgeDomains: ['venture capital', 'investment', 'private equity', 'angel group'],
    },
    [NetworkingGoalEnum.HIRING_ENGINEERS]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_STRATEGIC_PARTNERS],
        targetJobKeywords: ['software engineer', 'developer', 'cto', 'engineering manager', 'tech lead'],
        targetBridgeDomains: ['software engineering', 'technology', 'development'],
    },
    [NetworkingGoalEnum.OFFERS_VC_BRIDGE]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_INVESTORS],
        targetJobKeywords: ['founder', 'ceo', 'entrepreneur'],
        targetBridgeDomains: ['startups', 'fundraising'],
    },
    [NetworkingGoalEnum.SEEKING_MENTOR]: {
        complementaryGoals: [NetworkingGoalEnum.OFFERS_MENTORSHIP],
        targetJobKeywords: ['advisor', 'mentor', 'vp', 'director', 'head of', 'veteran'],
        targetBridgeDomains: ['executive coaching', 'advisory', 'mentorship'],
    },
    [NetworkingGoalEnum.OFFERS_MENTORSHIP]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_MENTOR],
        targetJobKeywords: ['founder', 'junior', 'associate', 'mentee'],
        targetBridgeDomains: ['career development', 'growth'],
    },
    [NetworkingGoalEnum.SEEKING_SALES_LEADS]: {
        complementaryGoals: [NetworkingGoalEnum.OFFERS_BUSINESS_DEV],
        targetJobKeywords: ['head of sales', 'cro', 'vp sales', 'procurement', 'business development'],
        targetBridgeDomains: ['sales', 'enterprise sales', 'business development'],
    },
    [NetworkingGoalEnum.OFFERS_BUSINESS_DEV]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_SALES_LEADS, NetworkingGoalEnum.SEEKING_STRATEGIC_PARTNERS],
        targetJobKeywords: ['business development', 'partnerships', 'account executive'],
        targetBridgeDomains: ['partnerships', 'channel sales'],
    },
    [NetworkingGoalEnum.SEEKING_STRATEGIC_PARTNERS]: {
        complementaryGoals: [NetworkingGoalEnum.SEEKING_STRATEGIC_PARTNERS, NetworkingGoalEnum.OFFERS_BUSINESS_DEV],
        targetJobKeywords: ['partner', 'founder', 'vp partnerships', 'business development'],
        targetBridgeDomains: ['strategic alliances', 'ecosystems'],
    },
};

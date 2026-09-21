import { ContactRepository } from '../repositories/ContactRepository';
import { InteractionRepository } from '../repositories/InteractionRepository';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { NoteRepository } from '../repositories/NoteRepository';
import { GoalRepository } from '../repositories/GoalRepository';

export interface ConversationSuggestionResult {
  contact_name: string;
  opener: string;
  discussion_questions: string[];
  suggested_follow_up: string;
  topics_to_avoid: string[];
  strategic_value: string;
}

export interface DraftMessageResult {
  purpose: string;
  tone: string;
  subject?: string;
  draft: string;
  key_points: string[];
}

export interface MeetingSummaryResult {
  summary: string;
  key_takeaways: string[];
  decisions: string[];
  action_items: { task: string; due_days: number; priority: string }[];
  suggested_follow_up_date: string;
}

export interface RelationshipInsightResult {
  insight_type: string;
  title: string;
  description: string;
  suggested_action: string;
  urgency: 'high' | 'medium' | 'low';
}

export class AIService {
  /**
   * Generates tailored conversation starters & discussion strategy for a contact
   */
  static async getConversationSuggestions(
    userId: number,
    contactId: number,
    customGoal?: string
  ): Promise<ConversationSuggestionResult> {
    const contact = await ContactRepository.getById(userId, contactId);
    if (!contact) throw new Error('Contact not found');

    const persona = await ProfileRepository.getPersonaByUserId(userId);
    const interactions = await InteractionRepository.list(userId, { contact_id: contactId, limit: 3 });
    const notes = await NoteRepository.list(userId, { contact_id: contactId });

    const contactName = `${contact.first_name} ${contact.last_name}`;
    const company = contact.company || 'their organization';
    const role = contact.job_title || 'Leader';

    // Build intelligent high-signal suggestions tailored to contact & context
    const recentTopic = interactions.items[0]?.title || 'recent industry developments';
    const personaStyle = persona?.communication_style || 'Concise & Strategic';

    return {
      contact_name: contactName,
      opener: `Hi ${contact.first_name}, wonderful connecting again! I was reflecting on our previous discussion about ${recentTopic} and wanted to check in on how things are progressing at ${company}.`,
      discussion_questions: [
        `What are the most exciting strategic milestones you are targeting at ${company} this quarter?`,
        `Given the rapid evolution in your space, what bottlenecks or opportunities are you currently navigating around ${contact.relationship_type === 'founder' ? 'fundraising & product distribution' : 'scaling architecture and team workflows'}?`,
        `Are there any introductions or advisory connections in my network that would be particularly high-leverage for you right now?`,
      ],
      suggested_follow_up: `Share relevant case studies or introduction offers tailored to ${company}'s current growth stage.`,
      topics_to_avoid: [
        'Unconfirmed market rumors or sensitive internal roadmaps',
        'Premature commercial asks before establishing mutual alignment',
      ],
      strategic_value: `Strengthening your ${contact.relationship_type} bond with ${contact.first_name} helps advance your goal: "${customGoal || persona?.networking_goal || 'Build strategic relationships'}".`,
    };
  }

  /**
   * Drafts personalized messages (follow-up, intro, thank you, reconnect)
   */
  static async draftMessage(
    userId: number,
    params: {
      contact_id: number;
      purpose: 'follow_up' | 'intro' | 'thank_you' | 'meeting_request' | 'reconnect';
      tone?: 'professional' | 'warm' | 'concise';
      context?: string;
    }
  ): Promise<DraftMessageResult> {
    const contact = await ContactRepository.getById(userId, params.contact_id);
    if (!contact) throw new Error('Contact not found');

    const tone = params.tone || 'professional';
    const purpose = params.purpose || 'follow_up';
    const name = contact.first_name;
    const company = contact.company || 'your team';
    const userContext = params.context || 'our recent conversation';

    let subject = '';
    let draft = '';
    let keyPoints: string[] = [];

    switch (purpose) {
      case 'follow_up':
        subject = `Following up — ${userContext}`;
        draft =
          tone === 'concise'
            ? `Hi ${name},\n\nGreat speaking recently. Following up on ${userContext}.\n\nLet me know when you'd like to sync on next steps.\n\nBest regards.`
            : tone === 'warm'
            ? `Hi ${name},\n\nIt was truly fantastic catching up with you! I really enjoyed our conversation regarding ${userContext}.\n\nI'd love to continue the dialogue whenever your schedule allows. Let me know if next week works for a quick check-in.\n\nWarmly,`
            : `Dear ${name},\n\nThank you for taking the time to speak with me. I am following up regarding our discussion on ${userContext}.\n\nPlease let me know if you need any additional details from my end. I look forward to our next collaboration.\n\nSincerely,`;
        keyPoints = ['Clear follow-up reference', 'Low friction call to action', 'Respectful tone'];
        break;

      case 'meeting_request':
        subject = `Quick sync — ${company} & strategic collaboration`;
        draft = `Hi ${name},\n\nHope your week is going well. I've been following the great work at ${company} and would love to propose a quick 20-minute coffee or virtual sync to exchange perspectives on ${userContext}.\n\nWould you have 15-20 minutes open sometime next Tuesday or Thursday afternoon?\n\nBest regards,`;
        keyPoints = ['Specific time options', 'Clear purpose', 'Short time commitment'];
        break;

      case 'thank_you':
        subject = `Thank you, ${name}!`;
        draft = `Hi ${name},\n\nJust wanted to send a quick note of gratitude for your time and guidance during our recent discussion. Your insights regarding ${userContext} were exceptionally valuable.\n\nAlways happy to return the favor whenever I can be helpful to you.\n\nBest,`;
        keyPoints = ['Express genuine gratitude', 'Highlight specific takeaway', 'Offer reciprocal support'];
        break;

      case 'reconnect':
        subject = `Catching up / Thinking of ${company}`;
        draft = `Hi ${name},\n\nIt's been a little while since we last caught up, and I wanted to check in to see how everything is going at ${company}!\n\nWould love to reconnect and hear about what you're working on these days. Let me know if you're open to a brief chat sometime soon.\n\nBest regards,`;
        keyPoints = ['Acknowledge time gap gracefully', 'Inquire about current milestones', 'No pressure invitation'];
        break;

      case 'intro':
      default:
        subject = `Intro: Connecting regarding ${userContext}`;
        draft = `Hi ${name},\n\nI hope this note finds you well. I am reaching out to connect regarding ${userContext}.\n\nGiven your leadership at ${company}, I believe a brief exchange of ideas could be very valuable for both of us.\n\nLooking forward to hearing from you.`;
        keyPoints = ['Warm introduction', 'State mutual alignment', 'Simple reply prompt'];
        break;
    }

    return {
      purpose,
      tone,
      subject,
      draft,
      key_points: keyPoints,
    };
  }

  /**
   * Summarizes raw meeting notes into structured takeaways and action items
   */
  static async summarizeMeeting(
    userId: number,
    params: {
      meeting_title?: string;
      notes: string;
      contact_id?: number;
    }
  ): Promise<MeetingSummaryResult> {
    const raw = params.notes || '';
    const lines = raw.split('\n').filter((l) => l.trim().length > 0);

    const takeaways = lines.slice(0, 3).map((l) => l.replace(/^[-*•0-9.]+\s*/, '').trim());
    if (takeaways.length === 0) {
      takeaways.push('Discussed strategic roadmap and mutually beneficial next steps.');
    }

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 5);

    return {
      summary: `High-signal meeting covering ${params.meeting_title || 'key topics'}. Addressed core milestones, established alignment on deliverables, and confirmed follow-up cadence.`,
      key_takeaways: takeaways,
      decisions: [
        'Approved proposal to move forward with joint exploration.',
        'Scheduled follow-up review for the upcoming milestone.',
      ],
      action_items: [
        {
          task: `Send follow-up recap and supporting documents for ${params.meeting_title || 'the discussion'}`,
          due_days: 2,
          priority: 'high',
        },
        {
          task: `Prepare draft alignment plan before next sync`,
          due_days: 5,
          priority: 'medium',
        },
      ],
      suggested_follow_up_date: followUpDate.toISOString().slice(0, 10),
    };
  }

  /**
   * Generates proactive relationship insights
   */
  static async getRelationshipInsights(userId: number): Promise<RelationshipInsightResult[]> {
    const contacts = await ContactRepository.list(userId, { limit: 100 });
    const insights: RelationshipInsightResult[] = [];

    // Stale high-value contacts
    const staleHighValue = contacts.items.filter(
      (c) =>
        c.relationship_strength >= 70 &&
        (!c.last_interaction_at ||
          new Date(c.last_interaction_at).getTime() < Date.now() - 25 * 24 * 60 * 60 * 1000)
    );

    if (staleHighValue.length > 0) {
      const c = staleHighValue[0];
      insights.push({
        insight_type: 'stale_connection',
        title: `Reconnect with ${c.first_name} ${c.last_name}`,
        description: `You haven't interacted with ${c.first_name} (${c.job_title || 'Colleague'} at ${c.company || 'Network'}) in over 25 days despite a high relationship score (${c.relationship_strength}/100).`,
        suggested_action: 'Send Reconnect Note',
        urgency: 'high',
      });
    }

    // Overdue follow ups
    const overdueFollowUps = contacts.items.filter(
      (c) => c.next_follow_up_at && new Date(c.next_follow_up_at).getTime() <= Date.now()
    );

    if (overdueFollowUps.length > 0) {
      const c = overdueFollowUps[0];
      insights.push({
        insight_type: 'overdue_followup',
        title: `Follow-up Due: ${c.first_name} ${c.last_name}`,
        description: `You set a reminder to follow up with ${c.first_name} by ${new Date(c.next_follow_up_at!).toLocaleDateString()}.`,
        suggested_action: 'Complete Follow-up',
        urgency: 'high',
      });
    }

    // Goal momentum
    const goals = await GoalRepository.list(userId, 'active');
    if (goals.length > 0) {
      const activeGoal = goals[0];
      insights.push({
        insight_type: 'goal_momentum',
        title: `Goal Progress: "${activeGoal.title}"`,
        description: `Currently at ${activeGoal.current_value}/${activeGoal.target_value} ${activeGoal.unit} (${activeGoal.progress_percentage}%). Reaching out to 2 more connections this week will hit your target on schedule.`,
        suggested_action: 'Log New Interaction',
        urgency: 'medium',
      });
    }

    return insights;
  }

  /**
   * Generates AI suggestions for measurable networking goals
   */
  static async suggestGoals(userId: number) {
    const persona = await ProfileRepository.getPersonaByUserId(userId);
    return [
      {
        title: 'Connect with 15 Tech Founders & VCs',
        goal_type: 'connections',
        target_value: 15,
        unit: 'people',
        description: 'Expand your circle of early-stage builders and investors aligned with your persona.',
      },
      {
        title: 'Schedule 6 1-on-1 Coffee Chats',
        goal_type: 'interactions',
        target_value: 6,
        unit: 'meetings',
        description: 'Deepen relationships with key advisors and engineering leaders through focused 1-on-1s.',
      },
      {
        title: 'Complete 100% of Follow-ups within 48h',
        goal_type: 'follow_ups',
        target_value: 12,
        unit: 'follow-ups',
        description: 'Maintain network momentum by ensuring timely follow-ups after every event or meeting.',
      },
    ];
  }
}

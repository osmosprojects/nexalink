import { query } from '../config/db';

export class AnalyticsRepository {
  static async getDashboardStats(userId: number) {
    // Total connections
    const [totalContacts]: any = await query(
      `SELECT COUNT(*) as count FROM contacts WHERE user_id = ?`,
      [userId]
    );

    // Active relationships (interacted in last 30 days)
    const [activeRelationships]: any = await query(
      `SELECT COUNT(*) as count FROM contacts 
       WHERE user_id = ? AND last_interaction_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [userId]
    );

    // Follow-ups due
    const [followUpsDue]: any = await query(
      `SELECT COUNT(*) as count FROM contacts 
       WHERE user_id = ? AND next_follow_up_at IS NOT NULL AND next_follow_up_at <= NOW()`,
      [userId]
    );

    // Goal stats
    const [goalsSummary]: any = await query(
      `SELECT 
        COUNT(*) as total_goals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals,
        AVG(CASE WHEN target_value > 0 THEN (current_value / target_value) * 100 ELSE 0 END) as avg_progress
       FROM goals WHERE user_id = ?`,
      [userId]
    );

    // Total interactions
    const [totalInteractions]: any = await query(
      `SELECT COUNT(*) as count FROM interactions WHERE user_id = ?`,
      [userId]
    );

    // Upcoming meetings
    const [upcomingMeetings]: any = await query(
      `SELECT COUNT(*) as count FROM meetings WHERE user_id = ? AND start_at >= NOW()`,
      [userId]
    );

    return {
      total_contacts: totalContacts.count || 0,
      active_relationships: activeRelationships.count || 0,
      follow_ups_due: followUpsDue.count || 0,
      total_goals: goalsSummary.total_goals || 0,
      completed_goals: goalsSummary.completed_goals || 0,
      goal_completion_rate: Math.round(goalsSummary.avg_progress || 0),
      total_interactions: totalInteractions.count || 0,
      upcoming_meetings: upcomingMeetings.count || 0,
    };
  }

  static async getFullAnalytics(userId: number) {
    const stats = await this.getDashboardStats(userId);

    // Interaction type breakdown
    const interactionTypes: any[] = await query(
      `SELECT interaction_type as type, COUNT(*) as count 
       FROM interactions WHERE user_id = ? 
       GROUP BY interaction_type ORDER BY count DESC`,
      [userId]
    );

    // Monthly interactions chart data (last 6 months)
    const monthlyActivity: any[] = await query(
      `SELECT 
        DATE_FORMAT(interaction_date, '%b %Y') as month,
        COUNT(*) as interactions
       FROM interactions 
       WHERE user_id = ? AND interaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(interaction_date, '%b %Y'), YEAR(interaction_date), MONTH(interaction_date)
       ORDER BY YEAR(interaction_date) ASC, MONTH(interaction_date) ASC`,
      [userId]
    );

    // Relationship strength breakdown
    const strengthBreakdown: any[] = await query(
      `SELECT 
        CASE 
          WHEN relationship_strength >= 80 THEN 'High (80-100)'
          WHEN relationship_strength >= 50 THEN 'Moderate (50-79)'
          ELSE 'Growing (0-49)'
        END as tier,
        COUNT(*) as count
       FROM contacts WHERE user_id = ?
       GROUP BY tier`,
      [userId]
    );

    // Relationship types
    const relationshipTypes: any[] = await query(
      `SELECT relationship_type, COUNT(*) as count 
       FROM contacts WHERE user_id = ? 
       GROUP BY relationship_type ORDER BY count DESC`,
      [userId]
    );

    return {
      stats,
      interaction_types: interactionTypes,
      monthly_activity: monthlyActivity,
      strength_breakdown: strengthBreakdown,
      relationship_types: relationshipTypes,
    };
  }
}

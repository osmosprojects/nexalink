import { query } from '../config/db';

export class SearchRepository {
  static async globalSearch(userId: number, searchTerm: string) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        contacts: [],
        interactions: [],
        meetings: [],
        tasks: [],
        goals: [],
        notes: [],
      };
    }

    const term = `%${searchTerm.trim()}%`;

    const [contacts, interactions, meetings, tasks, goals, notes]: [any[], any[], any[], any[], any[], any[]] = await Promise.all([
      // Contacts
      query(
        `SELECT contact_id, first_name, last_name, company, job_title, avatar_url, relationship_type
         FROM contacts 
         WHERE user_id = ? AND (first_name LIKE ? OR last_name LIKE ? OR company LIKE ? OR job_title LIKE ?)
         LIMIT 5`,
        [userId, term, term, term, term]
      ),
      // Interactions
      query(
        `SELECT i.interaction_id, i.title, i.interaction_type, i.interaction_date, CONCAT(c.first_name, ' ', c.last_name) as contact_name
         FROM interactions i
         JOIN contacts c ON i.contact_id = c.contact_id
         WHERE i.user_id = ? AND (i.title LIKE ? OR i.summary LIKE ?)
         LIMIT 5`,
        [userId, term, term]
      ),
      // Meetings
      query(
        `SELECT m.meeting_id, m.title, m.meeting_type, m.start_at, CONCAT(c.first_name, ' ', c.last_name) as contact_name
         FROM meetings m
         LEFT JOIN contacts c ON m.contact_id = c.contact_id
         WHERE m.user_id = ? AND (m.title LIKE ? OR m.agenda LIKE ?)
         LIMIT 5`,
        [userId, term, term]
      ),
      // Tasks
      query(
        `SELECT task_id, title, status, priority, due_date
         FROM tasks 
         WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
         LIMIT 5`,
        [userId, term, term]
      ),
      // Goals
      query(
        `SELECT goal_id, title, goal_type, target_value, current_value, status
         FROM goals 
         WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
         LIMIT 5`,
        [userId, term, term]
      ),
      // Notes
      query(
        `SELECT note_id, title, content, is_pinned
         FROM notes 
         WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
         LIMIT 5`,
        [userId, term, term]
      ),
    ]);

    return {
      contacts,
      interactions,
      meetings,
      tasks,
      goals,
      notes,
    };
  }
}

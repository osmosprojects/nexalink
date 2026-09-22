export interface User {
  userId: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  status?: string;
  createdAt?: string;
}

export interface ConnectablePerson {
  id: string;
  businessDomain: string;
  personName: string;
  orgName: string;
  role: string;
}

export interface UserProfile {
  profile_id?: number;
  user_id?: number;
  headline?: string | null;
  bio?: string | null;
  company?: string | null;
  job_title?: string | null;
  location?: string | null;
  industry?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  timezone?: string;
  avatar_url?: string | null;
  skills?: any;
  interests?: any;
  networking_goals?: any;
  targetBusinesses?: string[];
  connectionsOffered?: ConnectablePerson[];
  networkingTargetMeets?: number;
  networkingTargetPeriod?: 'week' | 'month';
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface UserPersona {
  persona_id: number;
  user_id: number;
  persona_name: string;
  communication_style: string;
  preferred_people: string | null;
  networking_goal: string | null;
  interests: string | null;
  confidence: number;
  is_active: number;
}

export interface Tag {
  tag_id: number;
  name: string;
  color: string;
}

export interface Contact {
  contact_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  relationship_type: 'friend' | 'mentor' | 'mentee' | 'colleague' | 'client' | 'prospect' | 'founder' | 'investor' | 'recruiter' | 'partner' | 'other';
  relationship_strength: number;
  last_interaction_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Interaction {
  interaction_id: number;
  user_id: number;
  contact_id: number;
  goal_id: number | null;
  interaction_type: 'meeting' | 'call' | 'email' | 'message' | 'coffee' | 'event' | 'introduction' | 'note' | 'other';
  title: string;
  interaction_date: string;
  duration_minutes: number;
  summary: string | null;
  outcome: string | null;
  follow_up_required: number;
  follow_up_date: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}

export interface Meeting {
  meeting_id: number;
  user_id: number;
  contact_id: number | null;
  goal_id: number | null;
  title: string;
  meeting_type: 'coffee' | 'video' | 'office' | 'conference' | 'phone' | 'other';
  start_at: string;
  end_at: string;
  location: string | null;
  meeting_url: string | null;
  agenda: string | null;
  outcome: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}

export interface GoalProgress {
  progress_id: number;
  goal_id: number;
  progress_date: string;
  progress_value: number;
  notes: string | null;
  created_at: string;
}

export interface Goal {
  goal_id: number;
  user_id: number;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  recent_progress?: GoalProgress[];
}

export interface Task {
  task_id: number;
  user_id: number;
  contact_id: number | null;
  goal_id: number | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_avatar?: string;
  goal_title?: string;
}

export interface Note {
  note_id: number;
  user_id: number;
  contact_id: number | null;
  meeting_id: number | null;
  goal_id: number | null;
  task_id: number | null;
  title: string;
  content: string;
  is_pinned: number;
  created_at: string;
  updated_at: string;
  contact_name?: string;
}

export interface Recommendation {
  recommendation_id: number;
  user_id: number;
  contact_id: number | null;
  recommended_name: string;
  recommended_role: string;
  recommended_company: string;
  avatar_url: string | null;
  industry: string | null;
  skills: string[];
  reason: string;
  score: number;
  status: 'pending' | 'connected' | 'saved' | 'dismissed';
  created_at: string;
}

export interface Post {
  post_id: number;
  user_id: number;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  content: string;
  tags: string[];
  likes_count: number;
  created_at: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: number | null;
  is_read: number;
  created_at: string;
}

export interface DashboardData {
  stats: {
    total_contacts: number;
    active_relationships: number;
    follow_ups_due: number;
    total_goals: number;
    completed_goals: number;
    goal_completion_rate: number;
    total_interactions: number;
    upcoming_meetings: number;
  };
  tasks: Task[];
  upcoming_meetings: Meeting[];
  follow_ups: Contact[];
  recommendations: Recommendation[];
  ai_insights: {
    insight_type: string;
    title: string;
    description: string;
    suggested_action: string;
    urgency: 'high' | 'medium' | 'low';
  }[];
  goals: Goal[];
  recent_interactions: Interaction[];
}

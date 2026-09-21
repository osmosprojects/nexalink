import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users,
  HeartHandshake,
  Clock,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  MessageSquareShare,
  Coffee,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { DashboardData } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate, getRelationshipTypeBadge } from '../lib/utils';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      api.patch(`/tasks/${taskId}`, { status: status === 'done' ? 'todo' : 'done' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Failed to load dashboard</h3>
        <p className="text-xs text-slate-500 mt-1">Please ensure your MySQL database and backend are running.</p>
      </div>
    );
  }

  const { stats, tasks, upcoming_meetings, follow_ups, recommendations, ai_insights, goals, recent_interactions } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>AI Relationship Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Good morning, {user?.displayName?.split(' ')[0] || 'Builder'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
            You have <span className="font-bold text-brand-300">{stats.follow_ups_due} follow-ups</span> and{' '}
            <span className="font-bold text-purple-300">{stats.upcoming_meetings} meetings</span> scheduled this week.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={() => navigate('/ai')}
            className="px-4 py-2.5 bg-purple-600/90 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => openQuickAdd?.()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Decorative background ambient circles */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: Connections */}
        <div 
          onClick={() => navigate('/connections')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-brand-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Connections</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total_contacts}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">In your network</p>
        </div>

        {/* Card 2: Active Relationships */}
        <div 
          onClick={() => navigate('/connections')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Relationships</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.active_relationships}</span>
            <span className="text-[11px] font-semibold text-purple-600">Last 30 days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Recent touchpoints</p>
        </div>

        {/* Card 3: Follow-ups Due */}
        <div 
          onClick={() => navigate('/tasks')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Follow-ups Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.follow_ups_due}</span>
            {stats.follow_ups_due > 0 && (
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Actionable
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Timely responses</p>
        </div>

        {/* Card 4: Goals Complete */}
        <div 
          onClick={() => navigate('/goals')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Networking Goals</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.goal_completion_rate}%</span>
            <span className="text-[11px] font-semibold text-emerald-600">On Track</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-brand-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, stats.goal_completion_rate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Insight Card (Guide Section 9) */}
      {ai_insights.length > 0 && (
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl shadow-purple-900/10 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400/20">
                  AI Relationship Insight
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{ai_insights[0].title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl font-normal leading-relaxed">
                {ai_insights[0].description}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai')}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
          >
            <span>{ai_insights[0].suggested_action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Priority Actions & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Priority Tasks & Follow-ups & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Action Items</h3>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View all ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No pending tasks today. Great job!
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskMutation.mutate({ taskId: task.task_id, status: task.status })}
                        className="text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        {task.contact_name && (
                          <p className="text-[11px] text-slate-500 truncate">
                            Linked: <span className="font-semibold text-slate-700">{task.contact_name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Interactions Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareShare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Interactions</h3>
              </div>
              <button
                onClick={() => navigate('/interactions')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Full Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recent_interactions.map((inter) => (
                <div
                  key={inter.interaction_id}
                  onClick={() => navigate(`/connections/${inter.contact_id}`)}
                  className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50/60 hover:bg-brand-50/50 border border-slate-200/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={inter.contact_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={inter.contact_name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {inter.title}
                        </h5>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                          {inter.interaction_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        With <span className="font-semibold text-slate-700">{inter.contact_name}</span> · {formatDate(inter.interaction_date, 'relative')}
                      </p>
                      {inter.summary && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-normal">
                          {inter.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Meetings & AI Recommendations */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Meetings</h3>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Calendar
              </button>
            </div>

            {upcoming_meetings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No meetings scheduled for this week.
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming_meetings.map((m) => (
                  <div
                    key={m.meeting_id}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/50 to-purple-50/50 border border-brand-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{m.title}</span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                        {m.meeting_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(m.start_at, 'long')}</span>
                    </p>
                    {m.contact_name && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        Attendee: <span className="font-bold text-slate-800">{m.contact_name}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended People */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Recommended for You</h3>
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                Discover
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.recommendation_id}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/50 border border-slate-200/60 transition-all space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={rec.recommended_name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{rec.recommended_name}</h5>
                      <p className="text-[11px] text-slate-500 truncate">{rec.recommended_role} · {rec.recommended_company}</p>
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/50">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-purple-700">Why recommended:</span> {rec.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/discover')}
                    className="w-full py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-center"
                  >
                    View & Connect →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

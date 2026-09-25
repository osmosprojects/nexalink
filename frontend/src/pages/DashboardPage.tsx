import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  AlertCircle,
  Mail,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Send
} from 'lucide-react';
import { api } from '../lib/api';
import { DashboardData, AutoConnectRecommendation } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import { generateAutoConnectRecommendations } from '../lib/matchmakingEngine';
import confetti from 'canvas-confetti';

const SAMPLE_NETWORK_MEMBERS = [
  {
    userId: 101,
    displayName: 'Sanjeev Sarma',
    jobTitle: 'Strategic Director & Tech Advisor',
    company: 'NexaLink Enterprise',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    targetBusinesses: ['SaaS', 'FinTech', 'AI Software'],
    connectionsOffered: [
      {
        id: 'b1',
        businessDomain: 'Enterprise SaaS',
        personName: 'Rohan Mehta',
        orgName: 'SaaSify Global',
        role: 'VP Engineering',
        city: 'Mumbai',
        relationship: 'Former Colleague',
      },
      {
        id: 'b2',
        businessDomain: 'Healthcare',
        personName: 'Dr. Ananya Roy',
        orgName: 'Apollo Digital',
        role: 'Chief Medical Officer',
        city: 'Bengaluru',
        relationship: 'Advisor',
      },
    ],
  },
  {
    userId: 102,
    displayName: 'Geeta Rathod',
    jobTitle: 'VP of Talent & Culture',
    company: 'Innovate HR',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    targetBusinesses: ['HealthTech', 'Human Resources'],
    connectionsOffered: [
      {
        id: 'b3',
        businessDomain: 'FinTech',
        personName: 'Vikram Shah',
        orgName: 'PayGlobal',
        role: 'Head of Product',
        city: 'Delhi',
        relationship: 'Alumni',
      },
    ],
  },
  {
    userId: 103,
    displayName: 'Devyani',
    jobTitle: 'Head of Product Design',
    company: 'Creative Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    targetBusinesses: ['Product Design / UX', 'FinTech'],
    connectionsOffered: [
      {
        id: 'b4',
        businessDomain: 'AI Software',
        personName: 'Sameer Verma',
        orgName: 'NeuroTech AI',
        role: 'Founder & CEO',
        city: 'Pune',
        relationship: 'Co-founder',
      },
    ],
  },
];

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const [activeIntroModal, setActiveIntroModal] = useState<AutoConnectRecommendation | null>(null);
  const [editedEmailDraft, setEditedEmailDraft] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

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

  // Calculate AutoConnect Recommendations using Bidirectional Matchmaking Engine
  const autoConnectRecs = useMemo(() => {
    const userProfileData = {
      userId: user?.userId || 1,
      displayName: user?.displayName || 'User',
      avatarUrl: user?.avatarUrl,
      jobTitle: profile?.job_title || profile?.headline || 'Builder',
      company: profile?.company || 'Innovator',
      targetBusinesses: profile?.targetBusinesses && profile.targetBusinesses.length > 0
        ? profile.targetBusinesses
        : ['SaaS', 'FinTech', 'AI Software'],
      connectionsOffered: profile?.connectionsOffered && profile.connectionsOffered.length > 0
        ? profile.connectionsOffered
        : [
            {
              id: 'my-b1',
              businessDomain: 'HealthTech',
              personName: 'Dr. Dave Sharma',
              orgName: 'HealthTech Labs',
              role: 'Chief Technology Officer',
              city: 'Mumbai',
            },
          ],
    };

    const recs = generateAutoConnectRecommendations(userProfileData, SAMPLE_NETWORK_MEMBERS);
    return recs;
  }, [user, profile]);

  const handleOpenIntroModal = (rec: AutoConnectRecommendation) => {
    setActiveIntroModal(rec);
    setEditedEmailDraft(rec.introEmailDraft);
    setCopiedSuccess(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(editedEmailDraft);
    setCopiedSuccess(true);
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } });
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleOpenMailClient = () => {
    if (!activeIntroModal) return;
    const lines = editedEmailDraft.split('\n\n');
    const subjectLine = lines[0].startsWith('Subject: ') ? lines[0].replace('Subject: ', '') : `Intro Request: ${activeIntroModal.userName}`;
    const bodyText = lines.slice(1).join('\n\n');
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
  };

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

  const { stats, tasks, upcoming_meetings, recommendations, ai_insights, recent_interactions } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>AI Matchmaking Engine</span>
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

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
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

      {/* AI Insight Card */}
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

      {/* ========================================== */}
      {/* BIDIRECTIONAL AUTOCONNECT MATCHMAKING WIDGET */}
      {/* ========================================== */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Bidirectional AutoConnect Recommendations</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Calculated dynamically using exact substring & token overlap scoring (50%–95% Synergy) across direct and reverse network bridges.
            </p>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 shrink-0 self-start sm:self-auto"
          >
            <span>Update Target Fields</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {autoConnectRecs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active bridge recommendations found. Add your target businesses and connections offered in Profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {autoConnectRecs.map((rec) => {
              const isReverse = rec.isReverseMatch;
              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-white to-purple-50/30 border border-slate-200/80 hover:border-purple-300 shadow-sm transition-all space-y-3.5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: User Avatar & Score Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.userName)}&background=6366f1&color=fff`}
                          alt={rec.userName}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-purple-100 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                            <span>{rec.userName}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">{rec.userRole} · {rec.userCompany}</p>
                        </div>
                      </div>

                      {/* Synergy Score & Direction Tag */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          {rec.matchScore}% Synergy Match
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                            isReverse
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {isReverse ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-amber-600" /> Reverse Match (You Offer)
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-indigo-600" /> Direct Match (What You Want)
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Explanatory Reason Box */}
                    <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed space-y-1">
                      <p className="font-semibold text-slate-800">
                        <span className="text-purple-700 font-bold">Match Reason:</span> {rec.reason}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                        <span className="px-2 py-0.5 rounded bg-white font-bold text-slate-800 border border-slate-200">
                          Target: {rec.targetQuery}
                        </span>
                        {rec.bridgePerson && (
                          <span className="px-2 py-0.5 rounded bg-purple-100/70 font-bold text-purple-800">
                            Bridge: {rec.bridgePerson.personName} ({rec.bridgePerson.role || 'Executive'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Automated Intro Email Generator Button */}
                  <button
                    onClick={() => handleOpenIntroModal(rec)}
                    className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-brand-200" />
                    <span>Generate 1-Click Intro Email</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Priority Actions & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Priority Tasks & Recent Activity */}
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

        {/* Right Col: Upcoming Meetings & Standard AI Recommendations */}
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

      {/* ========================================== */}
      {/* 1-CLICK INTRO EMAIL GENERATOR MODAL */}
      {/* ========================================== */}
      {activeIntroModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Automated 1-Click Intro Email Generator</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    To: <span className="font-bold text-slate-800">{activeIntroModal.userName}</span> · {activeIntroModal.userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveIntroModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Context Pill */}
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
                <span className="font-bold text-purple-900">
                  {activeIntroModal.matchScore}% Synergy Match ({activeIntroModal.isReverseMatch ? 'Reverse Match' : 'Direct Match'})
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-200/80 text-[11px] font-bold text-purple-800">
                Target: {activeIntroModal.targetQuery}
              </span>
            </div>

            {/* Email Body Draft Text Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Editable Email Draft</label>
              <textarea
                rows={8}
                value={editedEmailDraft}
                onChange={(e) => setEditedEmailDraft(e.target.value)}
                className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden leading-relaxed text-slate-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleCopyEmail}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copy Email Draft</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenMailClient}
                className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Open Email App (mailto)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

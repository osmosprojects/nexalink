import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquareShare,
  Target,
  Award,
  Calendar,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../lib/api';

const COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="h-80 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const { stats, interaction_types = [], monthly_activity = [], strength_breakdown = [], relationship_types = [] } = data || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Network Intelligence & Analytics</h2>
          <p className="text-xs text-slate-500">Measure relationship growth velocity, touchpoint frequency, and goal completion rates</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Total Network Size</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats?.total_contacts || 0}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Active Connections</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Total Interactions Logged</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats?.total_interactions || 0}</p>
          <p className="text-[11px] text-purple-600 font-bold mt-0.5">Touchpoints Recorded</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Goal Completion Rate</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats?.goal_completion_rate || 0}%</p>
          <p className="text-[11px] text-brand-600 font-bold mt-0.5">Milestones on Track</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Follow-up Adherence</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">94%</p>
          <p className="text-[11px] text-amber-600 font-bold mt-0.5">&lt; 48h Response Time</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Touchpoint Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <span>Monthly Interaction Velocity</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly_activity.length > 0 ? monthly_activity : [{ month: 'Sep 2026', interactions: stats?.total_interactions || 5 }]}>
                <defs>
                  <linearGradient id="colorInter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="interactions" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInter)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interaction Breakdown by Type */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareShare className="w-4 h-4 text-purple-600" />
            <span>Interaction Distribution by Type</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interaction_types}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="type" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Relationship Strength Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Relationship Strength Tiers</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strength_breakdown}
                  dataKey="count"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.tier} (${entry.count})`}
                  labelLine={false}
                >
                  {strength_breakdown.map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Relationship Roles Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Network Composition by Role</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={relationship_types}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="relationship_type" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

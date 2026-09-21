import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Sparkles,
  UserPlus,
  Bookmark,
  X,
  Check,
  Building,
  MapPin,
  TrendingUp,
  Filter
} from 'lucide-react';
import { api } from '../lib/api';
import { Recommendation } from '../types';
import confetti from 'canvas-confetti';

export const DiscoverPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ['recommendations'],
    queryFn: () => api.get<Recommendation[]>('/recommendations?status=pending'),
  });

  const connectMutation = useMutation({
    mutationFn: (recId: number) => api.post(`/recommendations/${recId}/convert`),
    onSuccess: (newContact: any) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      navigate(`/connections/${newContact.contact_id}`);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (recId: number) => api.post(`/recommendations/${recId}/status`, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const filtered = recommendations.filter((r) => {
    const matchSearch =
      r.recommended_name.toLowerCase().includes(search.toLowerCase()) ||
      r.recommended_role.toLowerCase().includes(search.toLowerCase()) ||
      r.recommended_company.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());

    const matchIndustry = industryFilter === 'all' || r.industry?.toLowerCase() === industryFilter.toLowerCase();

    return matchSearch && matchIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Discovery & Recommendations</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black">Expand Your Strategic Network</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
          NexaLink analyzes your networking goals, skills, and industry focus to recommend high-affinity founders, leaders, and peers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search recommended people by name, role, company, or mutual interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-white/10 text-white placeholder:text-slate-400 border border-white/20 rounded-2xl focus:bg-white/20 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-2xl focus:bg-white/20 focus:outline-hidden font-semibold"
            >
              <option value="all" className="bg-slate-900 text-white">All Industries</option>
              <option value="Artificial Intelligence" className="bg-slate-900 text-white">Artificial Intelligence</option>
              <option value="Venture Capital" className="bg-slate-900 text-white">Venture Capital</option>
              <option value="Cloud Infrastructure" className="bg-slate-900 text-white">Cloud Infrastructure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommended People Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching recommendations</h3>
          <p className="text-xs text-slate-500">Check back soon or update your AI Persona preferences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rec) => (
            <div
              key={rec.recommendation_id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-soft hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={rec.recommended_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-100 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        {rec.recommended_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{rec.recommended_role}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{rec.recommended_company}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {rec.score}% Match
                  </span>
                </div>

                {/* Why recommended explanation card (Guide Section 28 & 93) */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Why recommended:</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rec.reason}
                  </p>
                </div>

                {/* Skills Tags */}
                {rec.skills && rec.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => connectMutation.mutate(rec.recommendation_id)}
                  disabled={connectMutation.isPending}
                  className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => dismissMutation.mutate(rec.recommendation_id)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Dismiss recommendation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

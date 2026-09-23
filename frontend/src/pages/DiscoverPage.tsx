import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Sparkles,
  UserPlus,
  X,
  Check,
  Building,
  MapPin,
  Filter,
  Eye,
  Heart,
  RotateCcw,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Users2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { Recommendation } from '../types';
import { UserProfileModal } from '../components/ui/UserProfileModal';
import confetti from 'canvas-confetti';

export const DiscoverPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'swiper' | 'list'>('list');
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<Recommendation | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Recommendation Filter Preferences State (Screen 6)
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Strategic Partnerships']);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(['Founders', 'Investors']);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Technology', 'SaaS']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Mumbai']);

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
      if (newContact?.contact_id) {
        navigate(`/connections/${newContact.contact_id}`);
      }
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

    const matchIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.some(
        (ind) => r.industry?.toLowerCase().includes(ind.toLowerCase()) || r.reason.toLowerCase().includes(ind.toLowerCase())
      );

    return matchSearch && matchIndustry;
  });

  const currentSwiperCard = filtered[swiperIndex] || filtered[0];

  const toggleFilter = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) {
      return { label: '⭐ High Match', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (score >= 70) {
      return { label: '👍 Good Match', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else {
      return { label: '💡 Potential Match', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 sm:px-4 pb-12">
      
      {/* 1. TOP HEADER BANNER (Screen 1 & 5) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Discovery & Matchmaking Engine</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">Expand Your Strategic Network</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              NexaLink analyzes your goals, interests, location, and network to suggest high-affinity leaders & peers.
            </p>
          </div>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Recommended List</span>
            </button>
            <button
              onClick={() => setViewMode('swiper')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'swiper'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Quick Discover</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filter Drawer Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search people by name, company, role, location or interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 bg-white/10 text-white placeholder:text-slate-400 border border-white/20 rounded-2xl focus:bg-white/20 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className="w-full sm:w-auto px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Improve Recommendations</span>
          </button>
        </div>
      </div>

      {/* 2. SWIPER / QUICK DISCOVER VIEW (Screens 2 & 4) */}
      {viewMode === 'swiper' && (
        <div className="flex flex-col items-center justify-center pt-2 pb-6 space-y-4">
          {isLoading ? (
            <div className="w-full max-w-md h-[450px] bg-slate-200 rounded-3xl animate-pulse" />
          ) : !currentSwiperCard ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 max-w-md w-full">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No more cards to discover</h3>
              <p className="text-xs text-slate-500">Switch to List View or update your filter preferences.</p>
            </div>
          ) : (
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn relative">
              
              {/* Swiper Header Counter */}
              <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-bold rounded-full border border-white/20">
                Discover {swiperIndex + 1}/{filtered.length}
              </div>

              {/* Score Badge */}
              <div className="absolute top-3 right-3 z-10">
                {(() => {
                  const badge = getScoreBadge(currentSwiperCard.score);
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-md ${badge.bg}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Profile Image & Cover */}
              <div className="h-64 sm:h-72 bg-gradient-to-br from-slate-100 to-indigo-50 relative flex items-center justify-center overflow-hidden">
                <img
                  src={currentSwiperCard.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentSwiperCard.recommended_name)}&background=3b82f6&color=fff`}
                  alt={currentSwiperCard.recommended_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h3 className="text-xl font-extrabold flex items-center gap-1.5">
                    <span>{currentSwiperCard.recommended_name}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-400 inline" />
                  </h3>
                  <p className="text-xs font-semibold text-slate-200">{currentSwiperCard.recommended_role} • {currentSwiperCard.recommended_company}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{currentSwiperCard.location || 'Mumbai, India'}</span>
                    </span>
                    <span>• 8+ yrs</span>
                  </div>
                </div>
              </div>

              {/* Body: Why this match? */}
              <div className="p-5 space-y-4">
                <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Why Your Match?</span>
                  </div>
                  <ul className="space-y-1 text-xs text-indigo-950 font-medium">
                    {currentSwiperCard.reason.split('\n').map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{bullet.replace(/^✓\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills/Tags */}
                {currentSwiperCard.skills && currentSwiperCard.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {currentSwiperCard.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Controls (Screen 4: Tinder-style controls) */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => dismissMutation.mutate(currentSwiperCard.recommendation_id)}
                    className="flex-1 py-3 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    <span>Not for me</span>
                  </button>

                  <button
                    onClick={() => setSelectedProfile(currentSwiperCard)}
                    className="p-3 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-colors"
                    title="View Profile Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => connectMutation.mutate(currentSwiperCard.recommendation_id)}
                    disabled={connectMutation.isPending}
                    className="flex-1 py-3 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Interested</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. RECOMMENDED FOR YOU LIST VIEW (Screens 1 & 5) */}
      {viewMode === 'list' && (
        <>
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Recommended for You</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Based on your networking goals & interests
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Screen 7: Empty State */
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Users2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No strong matches yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                We couldn't find enough people matching your exact networking criteria right now.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowFilterDrawer(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                >
                  Update Networking Preferences
                </button>
                <button
                  onClick={() => navigate('/connections')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                >
                  Explore All People
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-left max-w-md mx-auto space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Tips to get better matches:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc font-medium">
                  <li>Add more specific focus interests in your Profile.</li>
                  <li>Expand target cities and location preferences.</li>
                  <li>Add your active networking groups or alumni clubs.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((rec) => {
                const scoreBadge = getScoreBadge(rec.score);
                const reasonsList = rec.reason.split('\n').map((b) => b.replace(/^✓\s*/, ''));

                return (
                  <div
                    key={rec.recommendation_id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card hover:shadow-soft hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Avatar & Basic Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.recommended_name)}&background=3b82f6&color=fff`}
                            alt={rec.recommended_name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-100 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors flex items-center gap-1">
                              <span>{rec.recommended_name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            </h4>
                            <p className="text-xs text-slate-600 font-bold">{rec.recommended_role}</p>
                            <p className="text-[11px] text-slate-400 font-semibold">{rec.recommended_company}</p>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{rec.location || 'Mumbai, India'} • 8+ yrs</span>
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${scoreBadge.bg}`}>
                          {scoreBadge.label}
                        </span>
                      </div>

                      {/* Tags */}
                      {rec.skills && rec.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.skills.map((skill, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Why this match? Box (Screen 1 & 5) */}
                      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/50 p-3.5 rounded-2xl border border-indigo-100/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-900 uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Why this match?</span>
                        </div>
                        <ul className="space-y-1 text-xs text-indigo-950 font-medium">
                          {reasonsList.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProfile(rec)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>View Profile</span>
                      </button>

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
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 4. COMPLETE USER PROFILE MODAL (Screen 3) */}
      {selectedProfile && (
        <UserProfileModal
          user={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onConnect={(recId) => connectMutation.mutate(recId)}
        />
      )}

      {/* 5. "IMPROVE RECOMMENDATIONS" FILTER DRAWER (Screen 6) */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Improve Recommendations</h3>
                  <p className="text-xs text-slate-500">Help us suggest better matches for you.</p>
                </div>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter 1: Networking Goals */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Networking Goals</label>
                <div className="flex flex-wrap gap-2">
                  {['Strategic Partnerships', 'Mentorship', 'Growth', 'Raising Capital', 'Hiring'].map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleFilter(goal, selectedGoals, setSelectedGoals)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Looking For */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Looking For</label>
                <div className="flex flex-wrap gap-2">
                  {['Founders', 'Investors', 'Talent', 'Advisors', 'Co-Founders'].map((lf) => {
                    const isSelected = selectedLookingFor.includes(lf);
                    return (
                      <button
                        key={lf}
                        onClick={() => toggleFilter(lf, selectedLookingFor, setSelectedLookingFor)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lf}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 3: Industries */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Industries</label>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'SaaS', 'Healthcare', 'Finance', 'AI & ML', 'E-Commerce'].map((ind) => {
                    const isSelected = selectedIndustries.includes(ind);
                    return (
                      <button
                        key={ind}
                        onClick={() => toggleFilter(ind, selectedIndustries, setSelectedIndustries)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 4: Locations */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Locations</label>
                <div className="flex flex-wrap gap-2">
                  {['Mumbai', 'Pune', 'Bengaluru', 'Delhi', 'San Francisco'].map((loc) => {
                    const isSelected = selectedLocations.includes(loc);
                    return (
                      <button
                        key={loc}
                        onClick={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowFilterDrawer(false);
                  queryClient.invalidateQueries({ queryKey: ['recommendations'] });
                }}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-brand-600/20"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

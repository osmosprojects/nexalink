import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  User,
  Sparkles,
  Building,
  MapPin,
  Linkedin,
  Globe,
  Phone,
  Mail,
  Check,
  Loader2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, profile, persona, isProfileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile form state
  const [formData, setFormData] = useState({
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    company: profile?.company || '',
    job_title: profile?.job_title || '',
    location: profile?.location || '',
    industry: profile?.industry || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || user?.avatarUrl || '',
    skills: profile?.skills?.join(', ') || '',
    interests: profile?.interests?.join(', ') || '',
    networking_goals: profile?.networking_goals?.join(', ') || '',
  });

  // Persona form state
  const [personaData, setPersonaData] = useState({
    persona_name: persona?.persona_name || 'Strategic Networker',
    communication_style: persona?.communication_style || 'Concise & Strategic',
    preferred_people: persona?.preferred_people || 'Founders, Tech Leaders, Mentors, Investors',
    networking_goal: persona?.networking_goal || 'Build meaningful long-term professional relationships',
    confidence: persona?.confidence || 85,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await api.put('/profile', {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map((s) => s.trim()).filter(Boolean),
        networking_goals: formData.networking_goals.split(',').map((s) => s.trim()).filter(Boolean),
      });
      await api.put('/profile/persona', personaData);
      const res = await refreshProfile();
      setSuccessMsg('Profile & AI Persona saved! Redirecting to dashboard...');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Onboarding Notice Banner */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-200 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">Complete Your Profile & Persona to Unlock NexaLink</h3>
            </div>
            <p className="text-xs text-amber-100 max-w-xl">
              To give you personalized AI conversation starters, smart matchmaking, and network insights, please fill in your professional identity below.
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 bg-black/20 rounded-xl text-xs font-bold border border-white/20">
            Step 1 of 1
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Profile & AI Persona</h2>
          <p className="text-xs text-slate-500">Configure your professional identity and tune your AI networking style</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Core Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Public Identity & Background</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                disabled
                value={user?.displayName || ''}
                className="w-full text-xs px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp / NexaLink"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Director of Engineering / Founder"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering Leader | Building High-Scale Enterprise Systems"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, India / San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Technology / SaaS / Venture Capital"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              placeholder="Brief summary of your professional background, passions, and current focus..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="Leadership, React, Node.js, Strategy"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interests (Comma-separated)</label>
              <input
                type="text"
                placeholder="Generative AI, Startups, Angel Investing"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* AI Persona Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Networking Persona Configuration</span>
            </h3>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Confidence {personaData.confidence}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Persona Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Strategic Tech Leader / Product Innovator"
                value={personaData.persona_name}
                onChange={(e) => setPersonaData({ ...personaData, persona_name: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Communication Style <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Concise, high-signal, authentic, direct"
                value={personaData.communication_style}
                onChange={(e) => setPersonaData({ ...personaData, communication_style: e.target.value })}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred People to Meet</label>
            <input
              type="text"
              placeholder="e.g. AI Founders, Seed/Series A VCs, CTOs, Design Leaders"
              value={personaData.preferred_people}
              onChange={(e) => setPersonaData({ ...personaData, preferred_people: e.target.value })}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Networking Goal</label>
            <textarea
              rows={2}
              placeholder="e.g. Build long-term strategic relationships with founders and technical leaders"
              value={personaData.networking_goal}
              onChange={(e) => setPersonaData({ ...personaData, networking_goal: e.target.value })}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Profile & Unlock Dashboard</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ConnectablePerson } from '../types';
import {
  User,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Plus,
  Trash2,
  Save,
  Building,
  Briefcase,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, profile, isProfileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form state matching business-networking-crm exactly
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    linkedin: profile?.linkedin_url || profile?.skills?.linkedin || '',
    twitter: profile?.skills?.twitter || '',
    website: profile?.website || profile?.skills?.website || '',
  });

  // Section A: Which businesses do you want to meet?
  const [targetBusinesses, setTargetBusinesses] = useState<string[]>(() => {
    const raw = profile?.networking_goals;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [''];
  });

  // Section B: Who can you connect people to
  const [connectionsOffered, setConnectionsOffered] = useState<ConnectablePerson[]>(() => {
    const raw = profile?.interests;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any, idx: number) => ({
        id: item.id || `conn-${idx}-${Date.now()}`,
        businessDomain: item.businessDomain || item.domain || '',
        personName: item.personName || item.name || '',
        orgName: item.orgName || item.company || '',
        role: item.role || item.designation || '',
      }));
    }
    return [];
  });

  // State for new connection bridge row entry
  const [newConn, setNewConn] = useState<Omit<ConnectablePerson, 'id'>>({
    businessDomain: '',
    personName: '',
    orgName: '',
    role: '',
  });
  const [showAddConnRow, setShowAddConnRow] = useState(false);

  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        linkedin: profile?.linkedin_url || profile?.skills?.linkedin || '',
        twitter: profile?.skills?.twitter || '',
        website: profile?.website || profile?.skills?.website || '',
      });

      if (Array.isArray(profile?.networking_goals) && profile.networking_goals.length > 0) {
        setTargetBusinesses(profile.networking_goals);
      }

      if (Array.isArray(profile?.interests) && profile.interests.length > 0) {
        setConnectionsOffered(
          profile.interests.map((item: any, idx: number) => ({
            id: item.id || `conn-${idx}-${Date.now()}`,
            businessDomain: item.businessDomain || item.domain || '',
            personName: item.personName || item.name || '',
            orgName: item.orgName || item.company || '',
            role: item.role || item.designation || '',
          }))
        );
      }
    }
  }, [user, profile]);

  const handleAddTargetBusiness = () => {
    setTargetBusinesses([...targetBusinesses, '']);
  };

  const handleUpdateTargetBusiness = (index: number, val: string) => {
    const updated = [...targetBusinesses];
    updated[index] = val;
    setTargetBusinesses(updated);
  };

  const handleRemoveTargetBusiness = (index: number) => {
    if (targetBusinesses.length <= 1) {
      setTargetBusinesses(['']);
      return;
    }
    setTargetBusinesses(targetBusinesses.filter((_, i) => i !== index));
  };

  const handleAddConnectionBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConn.businessDomain.trim() || !newConn.personName.trim()) return;
    const newEntry: ConnectablePerson = {
      ...newConn,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setConnectionsOffered([...connectionsOffered, newEntry]);
    setNewConn({
      businessDomain: '',
      personName: '',
      orgName: '',
      role: '',
    });
    setShowAddConnRow(false);
  };

  const handleRemoveConnectionOffered = (id: string) => {
    setConnectionsOffered(connectionsOffered.filter((c) => c.id !== id));
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const cleanTargets = targetBusinesses.map((t) => t.trim()).filter(Boolean);

      await api.put('/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          website: formData.website,
        },
        targetBusinesses: cleanTargets.length > 0 ? cleanTargets : ['General Business Networking'],
        connectionsOffered,
      });

      await refreshProfile();
      setSavedSuccess(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setSavedSuccess(false);
        if (!isProfileComplete) {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Onboarding Notice Banner */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-200 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">Complete Your Profile Setup to Unlock NexaLink</h3>
            </div>
            <p className="text-xs text-amber-100 max-w-xl">
              Please enter your Phone, Biography, and the Target Businesses you wish to meet below to activate your CRM account.
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 bg-black/20 rounded-xl text-xs font-bold border border-white/20">
            Step 1 of 1
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm text-white">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">Network Profile & Connection Architecture</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            The heart of the CRM. Your profile fields directly drive the Networking Engine, matching the businesses you want to meet with qualified bridges across your network.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile Updated</span>
            </div>
          )}
          <button
            id="btn-save-profile-top"
            type="button"
            disabled={loading}
            onClick={() => handleSaveProfile()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Personal Identity & Bio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-200 space-y-4">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Personal & Professional Identity</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sanjeev Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Professional Biography <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief summary of your background, leadership roles, and core industry focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  required
                />
              </div>

              {/* Social Media Links */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Social & Web Profiles
                </label>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 text-sky-400 rounded-xl shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 text-cyan-400 rounded-xl shrink-0">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://twitter.com/username"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 text-emerald-400 rounded-xl shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Engine Fields a) & b) (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Which businesses do you want to meet? */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    A
                  </span>
                  <h2 className="text-base font-semibold text-white">Which businesses do you want to meet?</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Specify target industry verticals, enterprise types, or niche sectors. Click <strong className="text-indigo-300">+</strong> to add more fields.
                </p>
              </div>

              <button
                id="btn-add-target-business"
                type="button"
                onClick={handleAddTargetBusiness}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target Field</span>
              </button>
            </div>

            {/* List of Target Fields */}
            <div className="space-y-2.5 mt-2">
              {targetBusinesses.map((target, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="e.g. Precision Electronics Manufacturers, Series A VC Funds, Cloud Security..."
                      value={target}
                      onChange={(e) => handleUpdateTargetBusiness(idx, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {targetBusinesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTargetBusiness(idx)}
                      className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                The AutoConnector engine uses these fields to continuously scan your network for matching connectors.
              </span>
            </div>
          </div>

          {/* Section B: Who can you connect people to */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    B
                  </span>
                  <h2 className="text-base font-semibold text-white">Who can you connect people to?</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  List high-value key contacts, industry experts, and organizations you can introduce members to.
                </p>
              </div>

              <button
                id="btn-add-connection-offered"
                type="button"
                onClick={() => setShowAddConnRow(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connection Bridge</span>
              </button>
            </div>

            {/* Inline form to add connection */}
            {showAddConnRow && (
              <form onSubmit={handleAddConnectionBridge} className="bg-slate-950 border border-emerald-500/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-emerald-400">New Connection Bridge</span>
                  <button
                    type="button"
                    onClick={() => setShowAddConnRow(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Business Domain / Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Fintech & Digital Payments"
                      value={newConn.businessDomain}
                      onChange={(e) => setNewConn({ ...newConn, businessDomain: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rohan Mehta"
                      value={newConn.personName}
                      onChange={(e) => setNewConn({ ...newConn, personName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Organization / Company</label>
                    <input
                      type="text"
                      placeholder="e.g. NovaPay Global"
                      value={newConn.orgName}
                      onChange={(e) => setNewConn({ ...newConn, orgName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Role / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. VP of Product Alliances"
                      value={newConn.role}
                      onChange={(e) => setNewConn({ ...newConn, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Save Bridge
                  </button>
                </div>
              </form>
            )}

            {/* List of Connections Offered */}
            <div className="space-y-2.5">
              {connectionsOffered.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                  No connection bridges added yet. Click "+ Add Connection Bridge" above to specify who you can connect peers with.
                </div>
              ) : (
                connectionsOffered.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{conn.personName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-medium">
                          {conn.businessDomain}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {conn.orgName || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          {conn.role || 'Key Contact'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveConnectionOffered(conn.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all"
                      title="Delete bridge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
  Camera,
  Heart,
  Compass,
  Users2,
  Check,
  Upload,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
];

const HOBBY_SUGGESTIONS = ['Golf', 'Marathon Running', 'Chess', 'Podcasting', 'Reading', 'Tennis', 'Scuba Diving', 'Photography', 'Skiing', 'Cooking'];
const INTEREST_SUGGESTIONS = ['AI & Deeptech', 'Angel Investing', 'SaaS Growth', 'Cross-border M&A', 'Clean Energy', 'Real Estate', 'Web3 & Crypto', 'Fintech', 'HealthTech'];

export const ProfilePage: React.FC = () => {
  const { user, profile, isProfileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );

  // Form state matching light mode business network profile
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    linkedin: profile?.linkedin_url || profile?.skills?.linkedin || '',
    twitter: profile?.skills?.twitter || '',
    website: profile?.website || profile?.skills?.website || '',
  });

  // Networking Group Member state
  const [isGroupMember, setIsGroupMember] = useState<boolean>(() => {
    const group = profile?.skills?.networkingGroup;
    return Boolean(group && (group.isMember || (typeof group === 'string' && group.trim().length > 0)));
  });
  const [networkingGroupNames, setNetworkingGroupNames] = useState<string>(() => {
    const group = profile?.skills?.networkingGroup;
    if (typeof group === 'string') return group;
    return group?.groupNames || 'BNI / YPO / EO / TiE / Rotary';
  });

  // 3 Hobbies Cards state
  const [hobbies, setHobbies] = useState<string[]>(() => {
    const raw = profile?.skills?.hobbies;
    if (Array.isArray(raw) && raw.length > 0) {
      const filled = [...raw];
      while (filled.length < 3) filled.push('');
      return filled.slice(0, 3);
    }
    return ['Golf & Business Networking', 'Marathon Running', 'Book Club & Reading'];
  });

  // 3 Interests Cards state
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const raw = profile?.skills?.interests;
    if (Array.isArray(raw) && raw.length > 0) {
      const filled = [...raw];
      while (filled.length < 3) filled.push('');
      return filled.slice(0, 3);
    }
    return ['AI & Deeptech Ventures', 'Angel Investing & Syndicates', 'Enterprise SaaS Scaleups'];
  });

  // Section A: Which businesses do you want to meet?
  const [targetBusinesses, setTargetBusinesses] = useState<string[]>(() => {
    const raw = profile?.networking_goals;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return ['Series A VC Funds & Family Offices', 'Precision Electronics Manufacturers'];
  });

  // Section B: Who can you connect people to
  const [connectionsOffered, setConnectionsOffered] = useState<ConnectablePerson[]>(() => {
    const raw = profile?.interests;
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
      return raw.map((item: any, idx: number) => ({
        id: item.id || `conn-${idx}-${Date.now()}`,
        businessDomain: item.businessDomain || item.domain || '',
        personName: item.personName || item.name || '',
        orgName: item.orgName || item.company || '',
        role: item.role || item.designation || '',
      }));
    }
    return [
      {
        id: 'conn-demo-1',
        businessDomain: 'Fintech & Digital Payments',
        personName: 'Rohan Mehta',
        orgName: 'NovaPay Global',
        role: 'VP of Product Alliances',
      },
    ];
  });

  // New connection bridge form state
  const [newConn, setNewConn] = useState<Omit<ConnectablePerson, 'id'>>({
    businessDomain: '',
    personName: '',
    orgName: '',
    role: '',
  });
  const [showAddConnRow, setShowAddConnRow] = useState(false);

  useEffect(() => {
    if (user || profile) {
      setAvatarUrl(user?.avatarUrl || profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        linkedin: profile?.linkedin_url || profile?.skills?.linkedin || '',
        twitter: profile?.skills?.twitter || '',
        website: profile?.website || profile?.skills?.website || '',
      });

      const group = profile?.skills?.networkingGroup;
      if (group) {
        setIsGroupMember(Boolean(group.isMember || (typeof group === 'string' && group.trim().length > 0)));
        setNetworkingGroupNames(typeof group === 'string' ? group : group.groupNames || '');
      }

      if (Array.isArray(profile?.skills?.hobbies)) {
        const filled = [...profile.skills.hobbies];
        while (filled.length < 3) filled.push('');
        setHobbies(filled.slice(0, 3));
      }

      if (Array.isArray(profile?.skills?.interests)) {
        const filled = [...profile.skills.interests];
        while (filled.length < 3) filled.push('');
        setUserInterests(filled.slice(0, 3));
      }

      if (Array.isArray(profile?.networking_goals) && profile.networking_goals.length > 0) {
        setTargetBusinesses(profile.networking_goals);
      }

      if (Array.isArray(profile?.interests) && profile.interests.length > 0 && typeof profile.interests[0] === 'object') {
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

  // Image Upload Handler (Convert to base64 Data URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image file under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setAvatarUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHobbyChange = (index: number, val: string) => {
    const updated = [...hobbies];
    updated[index] = val;
    setHobbies(updated);
  };

  const handleInterestChange = (index: number, val: string) => {
    const updated = [...userInterests];
    updated[index] = val;
    setUserInterests(updated);
  };

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
      const cleanHobbies = hobbies.map((h) => h.trim()).filter(Boolean);
      const cleanInterests = userInterests.map((i) => i.trim()).filter(Boolean);

      await api.put('/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: avatarUrl,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          website: formData.website,
        },
        networkingGroup: {
          isMember: isGroupMember,
          groupNames: isGroupMember ? networkingGroupNames : '',
        },
        hobbies: cleanHobbies,
        userInterests: cleanInterests,
        targetBusinesses: cleanTargets.length > 0 ? cleanTargets : ['General Business Networking'],
        connectionsOffered,
      });

      await refreshProfile();
      setSavedSuccess(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Onboarding Alert Banner */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">Complete Your Profile & Persona to Unlock NexaLink</h3>
            </div>
            <p className="text-xs text-brand-100 max-w-xl">
              Fill in your photo, phone, biography, and the target businesses you want to meet below to activate your CRM account.
            </p>
          </div>
          <div className="shrink-0 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-extrabold border border-white/30">
            Setup Required
          </div>
        </div>
      )}

      {/* Top Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-7 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-inner shrink-0 border border-brand-100">
            <UserCheck className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Networker Profile & Connection Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              Tailor your professional identity, networking group affiliations, personal interests, and introduction bridges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile Saved!</span>
            </div>
          )}
          <button
            id="btn-save-profile-top"
            type="button"
            disabled={loading}
            onClick={() => handleSaveProfile()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/20 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Personal Photo & Identity Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Photo & Upload Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Profile Photo</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Public Picture
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={formData.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-50 shadow-md transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-md hover:bg-brand-700 transition-transform active:scale-90"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAvatarUrl(
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">PNG, JPG or WebP up to 5MB.</p>

                {/* Preset Avatars */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Or choose a preset profile picture:</p>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="Preset"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-7 h-7 rounded-full object-cover cursor-pointer hover:scale-110 transition-all ${
                          avatarUrl === preset ? 'ring-2 ring-brand-600 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Identity Details Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Personal & Professional Identity</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sanjeev Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-brand-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Biography <span className="text-brand-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief summary of your background, leadership roles, and core industry focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-normal"
                  required
                />
              </div>

              {/* Social Media Links */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Social & Web Profiles
                </label>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-xl shrink-0">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://twitter.com/username"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Networking Groups, Hobbies, Interests, Target Businesses & Bridges (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Networking Group Affiliation Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Networking Group Member</h2>
                  <p className="text-xs text-slate-500">Are you an active member of any professional networking organizations or clubs?</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="isGroupMember"
                    checked={isGroupMember}
                    onChange={() => setIsGroupMember(true)}
                    className="w-4 h-4 text-brand-600 accent-brand-600 focus:ring-brand-500"
                  />
                  <span>Yes, I am a member</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="isGroupMember"
                    checked={!isGroupMember}
                    onChange={() => setIsGroupMember(false)}
                    className="w-4 h-4 text-slate-400 accent-slate-400"
                  />
                  <span>No, independent networker</span>
                </label>
              </div>

              {isGroupMember && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-semibold text-indigo-950">
                    Group / Chapter / Club Names
                  </label>
                  <input
                    type="text"
                    value={networkingGroupNames}
                    onChange={(e) => setNetworkingGroupNames(e.target.value)}
                    placeholder="e.g. BNI Apex Chapter, YPO South Asia, EO Mumbai, TiE Silicon Valley, Rotary Club"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                  <p className="text-[11px] text-indigo-600 font-medium">
                    This helps match you with fellow chapter members and cross-network connectors.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3 Hobbies Cards */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">3 Personal Hobbies</h2>
                  <p className="text-xs text-slate-500">Personal icebreakers and casual conversation starters for warm introductions.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hobbies.map((hobby, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">Hobby {idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={hobby}
                    onChange={(e) => handleHobbyChange(idx, e.target.value)}
                    placeholder={`e.g. ${HOBBY_SUGGESTIONS[idx] || 'Golf'}`}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              ))}
            </div>

            {/* Quick Hobby Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Quick Suggest:</span>
              {HOBBY_SUGGESTIONS.slice(0, 6).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    const emptyIdx = hobbies.findIndex((h) => !h.trim());
                    if (emptyIdx !== -1) {
                      handleHobbyChange(emptyIdx, sug);
                    } else {
                      handleHobbyChange(2, sug);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[11px] font-semibold transition-colors border border-slate-200/60"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Interest Cards */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">3 Core Professional Interests</h2>
                  <p className="text-xs text-slate-500">Key domain themes, technology focus areas, or investment interests.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {userInterests.map((interest, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">Interest {idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) => handleInterestChange(idx, e.target.value)}
                    placeholder={`e.g. ${INTEREST_SUGGESTIONS[idx] || 'AI & SaaS'}`}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>

            {/* Quick Interest Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Quick Suggest:</span>
              {INTEREST_SUGGESTIONS.slice(0, 6).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    const emptyIdx = userInterests.findIndex((i) => !i.trim());
                    if (emptyIdx !== -1) {
                      handleInterestChange(emptyIdx, sug);
                    } else {
                      handleInterestChange(2, sug);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 text-[11px] font-semibold transition-colors border border-slate-200/60"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Section A: Which businesses do you want to meet? */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    A
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Which businesses do you want to meet?</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Specify target industry verticals, enterprise types, or niche sectors.
                </p>
              </div>

              <button
                id="btn-add-target-business"
                type="button"
                onClick={handleAddTargetBusiness}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target Field</span>
              </button>
            </div>

            {/* List of Target Fields */}
            <div className="space-y-2.5">
              {targetBusinesses.map((target, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Precision Electronics Manufacturers, Series A VC Funds..."
                    value={target}
                    onChange={(e) => handleUpdateTargetBusiness(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  {targetBusinesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTargetBusiness(idx)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                The AutoConnector engine uses these fields to continuously scan your network for matching connectors.
              </span>
            </div>
          </div>

          {/* Section B: Who can you connect people to */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    B
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Who can you connect people to?</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  List key contacts, industry experts, and organizations you can introduce peers to.
                </p>
              </div>

              <button
                id="btn-add-connection-offered"
                type="button"
                onClick={() => setShowAddConnRow(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connection Bridge</span>
              </button>
            </div>

            {/* Inline Form to Add Connection Bridge */}
            {showAddConnRow && (
              <form onSubmit={handleAddConnectionBridge} className="bg-emerald-50/40 border border-emerald-200 p-4 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                  <span className="text-xs font-bold text-emerald-800">New Connection Bridge</span>
                  <button
                    type="button"
                    onClick={() => setShowAddConnRow(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Domain / Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Fintech & Digital Payments"
                      value={newConn.businessDomain}
                      onChange={(e) => setNewConn({ ...newConn, businessDomain: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rohan Mehta"
                      value={newConn.personName}
                      onChange={(e) => setNewConn({ ...newConn, personName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / Company</label>
                    <input
                      type="text"
                      placeholder="e.g. NovaPay Global"
                      value={newConn.orgName}
                      onChange={(e) => setNewConn({ ...newConn, orgName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. VP of Product Alliances"
                      value={newConn.role}
                      onChange={(e) => setNewConn({ ...newConn, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Save Bridge
                  </button>
                </div>
              </form>
            )}

            {/* List of Connections Offered */}
            <div className="space-y-2.5">
              {connectionsOffered.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                  No connection bridges added yet. Click "+ Add Connection Bridge" above to specify who you can connect peers with.
                </div>
              ) : (
                connectionsOffered.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{conn.personName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {conn.businessDomain}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {conn.orgName || 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {conn.role || 'Key Contact'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveConnectionOffered(conn.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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

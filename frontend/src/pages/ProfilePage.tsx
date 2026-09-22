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
  CheckCircle2,
  Loader2,
  Zap,
  Camera,
  Heart,
  Compass,
  Users2,
  Upload,
  RotateCcw,
  Search,
  Lightbulb,
  ChevronDown,
  GraduationCap,
  Building2,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, profile, isProfileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatarUrl || profile?.avatar_url || ''
  );

  // Core Identity form state
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    linkedin: profile?.linkedin_url || profile?.skills?.linkedin || '',
    twitter: profile?.skills?.twitter || '',
    website: profile?.website || profile?.skills?.website || '',
  });

  // 1) Networking Group Member state & local input
  const [networkingGroups, setNetworkingGroups] = useState<string[]>(() => {
    const group = profile?.skills?.networkingGroup;
    if (Array.isArray(group) && group.length > 0) return group;
    if (typeof group === 'string' && group.trim()) return [group];
    if (group && typeof group === 'object' && group.groupNames) {
      return group.groupNames.split(',').map((g: string) => g.trim()).filter(Boolean);
    }
    return [];
  });
  const [groupInput, setGroupInput] = useState('');

  // 2) 3 Hobbies state & local input
  const [hobbies, setHobbies] = useState<string[]>(() => {
    const raw = profile?.skills?.hobbies;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [hobbyInput, setHobbyInput] = useState('');

  // 3) 3 Interests state & local input
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const raw = profile?.skills?.interests;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [interestInput, setInterestInput] = useState('');

  // Section A: Which businesses do you want to meet?
  const [targetBusinesses, setTargetBusinesses] = useState<string[]>(() => {
    const raw = profile?.networking_goals;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [targetInput, setTargetInput] = useState('');

  // Section B: Who can you connect people to?
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
    return [];
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
      setAvatarUrl(user?.avatarUrl || profile?.avatar_url || '');
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
      if (Array.isArray(group) && group.length > 0) {
        setNetworkingGroups(group);
      } else if (typeof group === 'string' && group.trim()) {
        setNetworkingGroups([group]);
      } else if (group && typeof group === 'object' && group.groupNames) {
        const parsed = group.groupNames.split(',').map((g: string) => g.trim()).filter(Boolean);
        setNetworkingGroups(parsed);
      }

      if (Array.isArray(profile?.skills?.hobbies) && profile.skills.hobbies.length > 0) {
        setHobbies(profile.skills.hobbies);
      }

      if (Array.isArray(profile?.skills?.interests) && profile.skills.interests.length > 0) {
        setUserInterests(profile.skills.interests);
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

  // File upload converter
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

  const handleResetAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Group Handlers
  const handleAddGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!groupInput.trim()) return;
    setNetworkingGroups([...networkingGroups, groupInput.trim()]);
    setGroupInput('');
  };
  const handleRemoveGroup = (index: number) => {
    setNetworkingGroups(networkingGroups.filter((_, i) => i !== index));
  };

  // Hobby Handlers
  const handleAddHobby = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hobbyInput.trim()) return;
    setHobbies([...hobbies, hobbyInput.trim()]);
    setHobbyInput('');
  };
  const handleRemoveHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  // Interest Handlers
  const handleAddInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interestInput.trim()) return;
    setUserInterests([...userInterests, interestInput.trim()]);
    setInterestInput('');
  };
  const handleRemoveInterest = (index: number) => {
    setUserInterests(userInterests.filter((_, i) => i !== index));
  };

  // Target Business Handlers
  const handleAddTargetBusiness = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetInput.trim()) return;
    setTargetBusinesses([...targetBusinesses, targetInput.trim()]);
    setTargetInput('');
  };
  const handleRemoveTargetBusiness = (index: number) => {
    setTargetBusinesses(targetBusinesses.filter((_, i) => i !== index));
  };

  // Connection Bridge Handlers
  const handleAddConnectionBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConn.businessDomain.trim() || !newConn.personName.trim()) return;
    const newEntry: ConnectablePerson = {
      ...newConn,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setConnectionsOffered([...connectionsOffered, newEntry]);
    setNewConn({ businessDomain: '', personName: '', orgName: '', role: '' });
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
      const cleanGroups = networkingGroups.map((g) => g.trim()).filter(Boolean);

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
        networkingGroup: cleanGroups,
        hobbies: cleanHobbies,
        userInterests: cleanInterests,
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Onboarding Alert Banner if incomplete */}
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base">Complete Your Profile Setup</h3>
            </div>
            <p className="text-xs text-brand-100 max-w-xl">
              Please enter your Phone, Biography, and Target Businesses below to activate your CRM account.
            </p>
          </div>
          <div className="shrink-0 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-extrabold border border-white/30">
            Setup Required
          </div>
        </div>
      )}

      {/* Page Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-brand-600" />
            <span>User Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal identity, networking group memberships, hobbies, interests, and connection bridges.
          </p>
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
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Profile Photo & Identity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Photo Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Profile Photo</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={formData.name || 'User Profile'}
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                    <User className="w-12 h-12 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="space-y-2.5 text-center sm:text-left flex-1">
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
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Upload a JPG, PNG or WebP image from your device.</p>
              </div>
            </div>
          </div>

          {/* Personal Identity Form Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal & Professional Identity</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
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
                    Phone Number <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Biography <span className="text-indigo-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief summary of your background, experience, and leadership focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-normal"
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Groups, Hobbies, Interests, Target Businesses & Bridges (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1) Networking Group Member Card (Matching Mockup Design) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Networking Group Member</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">List the networking groups, chapters, or clubs you belong to.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddGroup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Group</span>
              </button>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddGroup} className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl flex items-center gap-2">
              <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 flex-1 flex items-center gap-2 font-medium focus-within:ring-2 focus-within:ring-indigo-500">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  placeholder="Enter networking group name..."
                  className="w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-slate-400 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </form>

            {/* Group Count & Sort bar */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-900">Your Groups ({networkingGroups.length})</h3>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>A → Z</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {networkingGroups.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  No networking groups added yet. Type a group name above and click "Add".
                </div>
              ) : (
                networkingGroups.map((grp, idx) => {
                  const iconColors = [
                    'bg-indigo-50 text-indigo-600',
                    'bg-emerald-50 text-emerald-600',
                    'bg-purple-50 text-purple-600',
                    'bg-amber-50 text-amber-600',
                  ];
                  const chosenColor = iconColors[idx % iconColors.length];
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-indigo-200 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${chosenColor} flex items-center justify-center shrink-0`}>
                          <Users2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{grp}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate">Professional Network • Active Member</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(idx)}
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
                        title="Remove group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Tip Card */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs font-medium text-indigo-950 leading-relaxed">
                <strong className="text-indigo-700 font-bold">Tip:</strong> Join relevant groups to expand your network and get better opportunities!
              </p>
            </div>
          </div>


          {/* 2) 3 Hobbies Card (Matching Mockup Design) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">3 Hobbies</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">List your favorite personal hobbies and activities.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddHobby}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hobby</span>
              </button>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddHobby} className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl flex items-center gap-2">
              <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 flex-1 flex items-center gap-2 font-medium focus-within:ring-2 focus-within:ring-rose-500">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  placeholder="Enter hobby name..."
                  className="w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-slate-400 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </form>

            {/* Hobby Count Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-900">Your Hobbies ({hobbies.length})</h3>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>A → Z</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {hobbies.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  No hobbies added yet. Type a hobby name above and click "Add".
                </div>
              ) : (
                hobbies.map((hb, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-rose-200 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{hb}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">Personal Interest</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveHobby(idx)}
                      className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
                      title="Remove hobby"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* 3) 3 Interests Card (Matching Mockup Design) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">3 Interests</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">List your professional focus areas and key domain interests.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddInterest}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Interest</span>
              </button>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddInterest} className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl flex items-center gap-2">
              <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 flex-1 flex items-center gap-2 font-medium focus-within:ring-2 focus-within:ring-purple-500">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Enter interest name..."
                  className="w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-slate-400 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </form>

            {/* Interest Count Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-900">Your Interests ({userInterests.length})</h3>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>A → Z</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {userInterests.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  No interests added yet. Type an interest above and click "Add".
                </div>
              ) : (
                userInterests.map((interest, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-purple-200 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{interest}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">Professional Domain</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(idx)}
                      className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
                      title="Remove interest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* Section A: Which businesses do you want to meet? (Matching Mockup Design) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Target Businesses</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Specify target industry verticals, enterprise types, or niche sectors you want to meet.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTargetBusiness}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target</span>
              </button>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddTargetBusiness} className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-2xl flex items-center gap-2">
              <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 flex-1 flex items-center gap-2 font-medium focus-within:ring-2 focus-within:ring-indigo-500">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter target business vertical or industry..."
                  className="w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-slate-400 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </form>

            {/* List Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-900">Your Target Fields ({targetBusinesses.length})</h3>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>A → Z</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {targetBusinesses.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  No target business verticals added yet. Type a target industry above and click "Add".
                </div>
              ) : (
                targetBusinesses.map((target, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-indigo-200 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{target}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">Target Industry Vertical</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTargetBusiness(idx)}
                      className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section B: Who can you connect people to? */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Who can you connect people to?</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">List key contacts, industry experts, and organizations you can introduce peers to.</p>
                </div>
              </div>

              <button
                id="btn-add-connection-offered"
                type="button"
                onClick={() => setShowAddConnRow(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
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
                      placeholder="e.g. Industry vertical"
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
                      placeholder="e.g. Full Name"
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
                      placeholder="e.g. Company Name"
                      value={newConn.orgName}
                      onChange={(e) => setNewConn({ ...newConn, orgName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Role or Designation"
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

            {/* List Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-sm font-bold text-slate-900">Your Connection Bridges ({connectionsOffered.length})</h3>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
                <span>A → Z</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* List of Connections Offered */}
            <div className="space-y-3">
              {connectionsOffered.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  No connection bridges added yet. Click "+ Add Connection Bridge" above to specify who you can connect peers with.
                </div>
              ) : (
                connectionsOffered.map((conn) => (
                  <div
                    key={conn.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-emerald-200 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{conn.personName}</h4>
                          {conn.businessDomain && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0">
                              {conn.businessDomain}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {conn.orgName ? `${conn.orgName}` : ''} {conn.orgName && conn.role ? '•' : ''} {conn.role ? `${conn.role}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveConnectionOffered(conn.id)}
                      className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0"
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

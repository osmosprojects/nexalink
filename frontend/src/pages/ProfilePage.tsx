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
  UserCheck,
  CheckCircle2,
  Loader2,
  Camera,
  Heart,
  Compass,
  Users2,
  Upload,
  RotateCcw,
  Search,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Building2,
  Target,
  Zap,
  X,
  Link2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const { user, profile, isProfileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationSummary, setValidationSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Global event listener for external save triggers (e.g. BottomNav / Sidebar "Complete Profile Setup" button)
  const saveProfileRef = useRef<() => void>();
  useEffect(() => {
    const handleTrigger = () => {
      if (saveProfileRef.current) {
        saveProfileRef.current();
      }
    };
    window.addEventListener('trigger-save-profile', handleTrigger);
    return () => window.removeEventListener('trigger-save-profile', handleTrigger);
  }, []);

  // Collapsible section state
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlock = (blockKey: string) => {
    setCollapsedBlocks((prev) => ({
      ...prev,
      [blockKey]: !prev[blockKey],
    }));
  };

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

  // 2) Hobbies state & local input
  const [hobbies, setHobbies] = useState<string[]>(() => {
    const raw = profile?.skills?.hobbies;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [hobbyInput, setHobbyInput] = useState('');

  // 3) Interests state & local input
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    const raw = profile?.skills?.interests;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [interestInput, setInterestInput] = useState('');

  // 4) Networking Objectives state & local input
  const [userGoals, setUserGoals] = useState<string[]>(() => {
    const raw = profile?.skills?.goals;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [goalInput, setGoalInput] = useState('');

  // 5) Networking Goals Target state
  const [networkingTargetMeets, setNetworkingTargetMeets] = useState<number>(() => {
    const raw = profile?.skills?.networkingTargetMeets;
    if (typeof raw === 'number' && raw >= 0) return raw;
    return 5;
  });
  const [networkingTargetPeriod, setNetworkingTargetPeriod] = useState<'week' | 'month'>(() => {
    const raw = profile?.skills?.networkingTargetPeriod;
    if (raw === 'month' || raw === 'week') return raw;
    return 'week';
  });
  const [networkingNewConnections, setNetworkingNewConnections] = useState<number>(() => {
    const raw = profile?.skills?.networkingNewConnections;
    if (typeof raw === 'number' && raw >= 0) return raw;
    return 10;
  });

  // Target Businesses
  const [targetBusinesses, setTargetBusinesses] = useState<string[]>(() => {
    const raw = profile?.networking_goals;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [];
  });
  const [targetInput, setTargetInput] = useState('');

  // Connection Bridges (Who can you connect people to?)
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

      if (Array.isArray(profile?.skills?.goals) && profile.skills.goals.length > 0) {
        setUserGoals(profile.skills.goals);
      }

      if (typeof profile?.skills?.networkingTargetMeets === 'number' && profile.skills.networkingTargetMeets >= 0) {
        setNetworkingTargetMeets(profile.skills.networkingTargetMeets);
      }

      if (profile?.skills?.networkingTargetPeriod === 'week' || profile?.skills?.networkingTargetPeriod === 'month') {
        setNetworkingTargetPeriod(profile.skills.networkingTargetPeriod);
      }

      if (typeof profile?.skills?.networkingNewConnections === 'number' && profile.skills.networkingNewConnections >= 0) {
        setNetworkingNewConnections(profile.skills.networkingNewConnections);
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
    if (networkingGroups.length >= 10) return;
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
    if (hobbies.length >= 5) return;
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
    if (userInterests.length >= 10) return;
    setUserInterests([...userInterests, interestInput.trim()]);
    setInterestInput('');
  };
  const handleRemoveInterest = (index: number) => {
    setUserInterests(userInterests.filter((_, i) => i !== index));
  };

  // Objective Handlers
  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;
    if (userGoals.length >= 5) return;
    setUserGoals([...userGoals, goalInput.trim()]);
    setGoalInput('');
  };
  const handleRemoveGoal = (index: number) => {
    setUserGoals(userGoals.filter((_, i) => i !== index));
  };

  // Target Business Handlers
  const handleAddTargetBusiness = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetInput.trim()) return;
    if (targetBusinesses.length >= 10) return;
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
    if (connectionsOffered.length >= 10) return;
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
    setValidationSummary(null);

    const errors: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Full Name is required.';
    }
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone Number is required.';
    }
    if (!formData.bio || !formData.bio.trim()) {
      errors.bio = 'Professional Biography is required.';
    }

    const cleanGroups = networkingGroups.map((g) => g.trim()).filter(Boolean);
    if (cleanGroups.length === 0) {
      errors.groups = 'At least 1 Networking Group is required.';
    }

    const cleanHobbies = hobbies.map((h) => h.trim()).filter(Boolean);
    if (cleanHobbies.length === 0) {
      errors.hobbies = 'At least 1 Hobby is required.';
    }

    const cleanInterests = userInterests.map((i) => i.trim()).filter(Boolean);
    if (cleanInterests.length === 0) {
      errors.interests = 'At least 1 Professional Interest is required.';
    }

    const cleanGoals = userGoals.map((g) => g.trim()).filter(Boolean);
    if (cleanGoals.length === 0) {
      errors.objectives = 'At least 1 Networking Objective is required.';
    }

    const cleanTargets = targetBusinesses.map((t) => t.trim()).filter(Boolean);
    if (cleanTargets.length === 0) {
      errors.targets = 'At least 1 Target Industry or Business is required.';
    }

    if (connectionsOffered.length === 0) {
      errors.bridges = 'At least 1 Connection Bridge is required.';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Auto-expand any collapsed cards that have validation errors
      setCollapsedBlocks((prev) => {
        const updated = { ...prev };
        if (errors.name || errors.phone || errors.bio) updated['identity'] = false;
        if (errors.groups) updated['groups'] = false;
        if (errors.hobbies) updated['hobbies'] = false;
        if (errors.interests) updated['interests'] = false;
        if (errors.objectives) updated['objectives'] = false;
        if (errors.targets) updated['targets'] = false;
        if (errors.bridges) updated['bridges'] = false;
        return updated;
      });

      setValidationSummary('Please complete all required profile fields highlighted in red below.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLoading(false);
      return;
    }

    try {
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
        goals: cleanGoals,
        networkingTargetMeets,
        networkingTargetPeriod,
        networkingNewConnections,
        targetBusinesses: cleanTargets,
        connectionsOffered,
      });

      const { isComplete } = await refreshProfile();
      setSavedSuccess(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setSavedSuccess(false);
        if (isComplete) {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setValidationSummary(err.message || 'Failed to save profile. Please check your data and try again.');
    } finally {
      setLoading(false);
    }
  };
  saveProfileRef.current = handleSaveProfile;

  // Helper calculation for profile completion
  const calcCompletionScore = () => {
    let score = 0;
    if (formData.name) score += 10;
    if (formData.email) score += 10;
    if (formData.phone) score += 10;
    if (formData.bio) score += 10;
    if (avatarUrl) score += 10;
    if (networkingGroups.length > 0) score += 10;
    if (hobbies.length > 0) score += 10;
    if (userInterests.length > 0) score += 10;
    if (userGoals.length > 0) score += 10;
    if (targetBusinesses.length > 0 && connectionsOffered.length > 0) score += 10;
    return Math.min(100, score);
  };
  const completionPercentage = calcCompletionScore();
  const completionScoreText = `${Math.round(completionPercentage / 10)}/10`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 overflow-x-hidden">
      
      {/* 1. TOP BLUE GRADIENT BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight">Networking Profile</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">Complete your identity to unlock all CRM modules</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 backdrop-blur-md text-white border border-emerald-400/40 rounded-xl text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Profile saved</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-blue-700" />
                <span>Save Profile & Complete Setup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VALIDATION ERROR SUMMARY BANNER */}
      {validationSummary && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 animate-fadeIn shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900">Incomplete Profile Setup</h4>
            <p className="text-xs text-rose-700 font-medium mt-0.5">{validationSummary}</p>
            {Object.keys(validationErrors).length > 0 && (
              <ul className="list-disc list-inside text-xs text-rose-700 mt-2 space-y-0.5 font-medium">
                {Object.values(validationErrors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 2. COMPLETION & QUICK TIPS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Profile Completion Card */}
        <div className="md:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full border-4 border-blue-600 flex items-center justify-center font-black text-sm text-blue-700 bg-blue-50 shrink-0">
            {completionScoreText}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-900">Profile Completion</span>
              <span className="text-xs font-bold text-slate-500">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="md:col-span-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Quick Tips</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              A complete profile helps you get better matches, recommendations and more relevant networking opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Profile Photo & Identity */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* BLOCK 1: Profile Photo (Collapsible) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            {/* Header */}
            <div
              onClick={() => toggleBlock('photo')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Profile Photo</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Add a clear photo of yourself.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['photo'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['photo'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={formData.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleResetAvatar}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      JPG, PNG or WEBP • Max 5 MB • 300x300px (min)
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* BLOCK 2: Personal & Professional Identity (Collapsible) */}
          <div className={`bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
            (validationErrors.name || validationErrors.phone || validationErrors.bio)
              ? 'border-rose-300 ring-2 ring-rose-100'
              : 'border-slate-200/90'
          }`}>
            {/* Header */}
            <div
              onClick={() => toggleBlock('identity')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                    <span>Personal & Professional Identity</span>
                    {(validationErrors.name || validationErrors.phone || validationErrors.bio) && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>Action Required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">Tell us about yourself and your professional background.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['identity'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['identity'] && (
              <form onSubmit={handleSaveProfile} className="p-5 space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (validationErrors.name) {
                        setValidationErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Abhishek Tiwari"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden ${
                      validationErrors.name
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 cursor-not-allowed"
                      />
                      {formData.email && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="84544986"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (validationErrors.phone) {
                            setValidationErrors((prev) => ({ ...prev, phone: '' }));
                          }
                        }}
                        className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden ${
                          validationErrors.phone
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                      {formData.phone && !validationErrors.phone && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {validationErrors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Professional Biography <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.bio.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    required
                    value={formData.bio}
                    onChange={(e) => {
                      setFormData({ ...formData, bio: e.target.value });
                      if (validationErrors.bio) {
                        setValidationErrors((prev) => ({ ...prev, bio: '' }));
                      }
                    }}
                    placeholder="Experienced technology professional with a passion for building innovative solutions and creating meaningful connections in the industry."
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden leading-relaxed ${
                      validationErrors.bio
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.bio && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.bio}</span>
                    </p>
                  )}
                </div>

                {/* Social Links */}
                <div className="pt-2 space-y-2.5 border-t border-slate-100">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    SOCIAL & WEB PROFILES
                  </label>

                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-blue-600">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/abhishek-tiwari"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      {formData.linkedin && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-sky-500">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://twitter.com/abhishek_tiwari"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      {formData.twitter && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-emerald-600">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://nexalink.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      {formData.website && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Groups, Hobbies, Interests, Objectives */}
        <div className="lg:col-span-7 space-y-6">

          {/* BLOCK 3: Networking Groups (Collapsible) */}
          <div className={`bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
            validationErrors.groups ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
          }`}>
            {/* Header */}
            <div
              onClick={() => toggleBlock('groups')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                    <span>Networking Groups</span>
                    {validationErrors.groups && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>At least 1 required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">Manage your networking group memberships, chapters, or clubs.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['groups'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['groups'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                {validationErrors.groups && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationErrors.groups}</span>
                  </div>
                )}

                <form onSubmit={handleAddGroup} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={groupInput}
                      onChange={(e) => setGroupInput(e.target.value)}
                      placeholder="enter group name..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-slate-900">Your Networking Groups ({networkingGroups.length})</h3>
                  <span className="text-[10px] font-bold text-slate-400">Max 10</span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {networkingGroups.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No networking groups added yet.</div>
                  ) : (
                    networkingGroups.map((grp, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-fadeIn"
                      >
                        <span>{grp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(idx)}
                          className="hover:text-blue-900 transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BLOCK 4: Hobbies (Collapsible) */}
          <div className={`bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
            validationErrors.hobbies ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
          }`}>
            {/* Header */}
            <div
              onClick={() => toggleBlock('hobbies')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                    <span>Hobbies</span>
                    {validationErrors.hobbies && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>At least 1 required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">List your favorite personal hobbies and activities.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['hobbies'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['hobbies'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                {validationErrors.hobbies && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationErrors.hobbies}</span>
                  </div>
                )}

                <form onSubmit={handleAddHobby} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                      placeholder="enter hobby name..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-slate-900">Your Hobbies ({hobbies.length})</h3>
                  <span className="text-[10px] font-bold text-slate-400">Max 5</span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {hobbies.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No hobbies added yet.</div>
                  ) : (
                    hobbies.map((hb, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-fadeIn"
                      >
                        <span>{hb}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHobby(idx)}
                          className="hover:text-blue-900 transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BLOCK 5: Professional Interests (Collapsible) */}
          <div className={`bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
            validationErrors.interests ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
          }`}>
            {/* Header */}
            <div
              onClick={() => toggleBlock('interests')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                    <span>Professional Interests</span>
                    {validationErrors.interests && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>At least 1 required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">List your professional focus areas and key domain interests.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['interests'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['interests'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                {validationErrors.interests && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationErrors.interests}</span>
                  </div>
                )}

                <form onSubmit={handleAddInterest} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="enter interest name..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-slate-900">Your Interests ({userInterests.length})</h3>
                  <span className="text-[10px] font-bold text-slate-400">Max 10</span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {userInterests.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No interests added yet.</div>
                  ) : (
                    userInterests.map((interest, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-fadeIn"
                      >
                        <span>{interest}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(idx)}
                          className="hover:text-blue-900 transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BLOCK 6: Networking Objectives (Collapsible) */}
          <div className={`bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
            validationErrors.objectives ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
          }`}>
            {/* Header */}
            <div
              onClick={() => toggleBlock('objectives')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                    <span>Networking Objectives</span>
                    {validationErrors.objectives && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>At least 1 required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">What are you trying to achieve through networking?</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['objectives'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['objectives'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                {validationErrors.objectives && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{validationErrors.objectives}</span>
                  </div>
                )}

                <form onSubmit={handleAddGoal} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="enter objective..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-slate-900">Your Objectives ({userGoals.length})</h3>
                  <span className="text-[10px] font-bold text-slate-400">Max 5</span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {userGoals.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No objectives added yet.</div>
                  ) : (
                    userGoals.map((goal, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-fadeIn"
                      >
                        <span>{goal}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="hover:text-blue-900 transition-colors p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM 3-COLUMN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* BLOCK 7: Networking Goals (Collapsible) */}
        <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div
            onClick={() => toggleBlock('goals')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">Networking Goals</h2>
                <p className="text-[11px] text-slate-500 font-medium">Set your networking targets and frequency.</p>
              </div>
            </div>
            <div className="text-slate-400 hover:text-slate-600 p-1">
              {collapsedBlocks['goals'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* Body */}
          {!collapsedBlocks['goals'] && (
            <div className="p-5 space-y-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                <select
                  value={networkingTargetPeriod}
                  onChange={(e) => setNetworkingTargetPeriod(e.target.value as 'week' | 'month')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meetings per week</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={networkingTargetMeets}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setNetworkingTargetMeets(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New connections per month</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={networkingNewConnections}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setNetworkingNewConnections(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 8: Target Industries & Businesses (Collapsible) */}
        <div className={`md:col-span-4 bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
          validationErrors.targets ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
        }`}>
          {/* Header */}
          <div
            onClick={() => toggleBlock('targets')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span>Target Industries & Businesses</span>
                  {validationErrors.targets && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>At least 1 required</span>
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Specify industries, company types, or business segments you want to connect with.</p>
              </div>
            </div>
            <div className="text-slate-400 hover:text-slate-600 p-1">
              {collapsedBlocks['targets'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* Body */}
          {!collapsedBlocks['targets'] && (
            <div className="p-5 space-y-4 animate-fadeIn">
              {validationErrors.targets && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationErrors.targets}</span>
                </div>
              )}

              <form onSubmit={handleAddTargetBusiness} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="enter target industry..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Add
                </button>
              </form>

              <div className="flex items-center justify-between pt-1">
                <h3 className="text-xs font-bold text-slate-900">Your Target Fields ({targetBusinesses.length})</h3>
                <span className="text-[10px] font-bold text-slate-400">Max 10</span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {targetBusinesses.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">No target fields added yet.</div>
                ) : (
                  targetBusinesses.map((target, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-fadeIn"
                    >
                      <span>{target}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTargetBusiness(idx)}
                        className="hover:text-blue-900 transition-colors p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 9: Connection Bridges (Collapsible) */}
        <div className={`md:col-span-4 bg-white border rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition-all ${
          validationErrors.bridges ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
        }`}>
          {/* Header */}
          <div
            onClick={() => toggleBlock('bridges')}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span>Connection Bridges</span>
                  {validationErrors.bridges && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200 shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      <span>At least 1 required</span>
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  Who can you connect people to? Add key contacts and domains.
                </p>
              </div>
            </div>

            <div className="text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-2">
              {collapsedBlocks['bridges'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* Body */}
          {!collapsedBlocks['bridges'] && (
            <div className="p-5 space-y-4 animate-fadeIn">
              {validationErrors.bridges && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationErrors.bridges}</span>
                </div>
              )}

              {/* Add Bridge Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-xs font-bold text-slate-900">Your Bridges ({connectionsOffered.length})</h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-slate-400">Max 10</span>
                  <button
                    type="button"
                    onClick={() => setShowAddConnRow(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bridge</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Bridge Form */}
              {showAddConnRow && (
                <form onSubmit={handleAddConnectionBridge} className="bg-indigo-50/50 border border-indigo-200 p-3.5 rounded-2xl space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                    <span className="text-xs font-bold text-indigo-900">New Connection Bridge</span>
                    <button
                      type="button"
                      onClick={() => setShowAddConnRow(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      placeholder="Person Name (e.g. John Doe)"
                      value={newConn.personName}
                      onChange={(e) => setNewConn({ ...newConn, personName: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role & Company (e.g. CTO • TechCorp)"
                      value={newConn.role}
                      onChange={(e) => setNewConn({ ...newConn, role: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Business Domain (e.g. AI / SaaS)"
                      value={newConn.businessDomain}
                      onChange={(e) => setNewConn({ ...newConn, businessDomain: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Reason for connection / Notes"
                      value={newConn.orgName}
                      onChange={(e) => setNewConn({ ...newConn, orgName: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs text-center"
                  >
                    Save Bridge
                  </button>
                </form>
              )}

              {/* Bridges List Cards */}
              <div className="space-y-2.5">
                {connectionsOffered.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">No bridges added yet. Click "+ Add Bridge" to add one.</div>
                ) : (
                  connectionsOffered.map((conn) => {
                    const initials = conn.personName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'JD';
                    return (
                      <div
                        key={conn.id}
                        className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 flex items-start justify-between gap-3 animate-fadeIn"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{conn.personName}</h4>
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {conn.role || 'Contact'} {conn.businessDomain ? `• ${conn.businessDomain}` : ''}
                            </p>
                            {conn.orgName && (
                              <p className="text-[10px] font-normal text-slate-400 leading-tight">
                                {conn.orgName}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveConnectionOffered(conn.id)}
                          className="text-rose-400 hover:text-rose-600 p-1 shrink-0 transition-colors"
                          title="Remove bridge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

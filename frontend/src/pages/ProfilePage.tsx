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
  Instagram,
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
  AlertCircle,
  MapPin,
  Eye,
  Briefcase,
  Info,
  Pencil,
  Lock
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
    company: profile?.company || profile?.skills?.company || '',
    role: profile?.job_title || profile?.skills?.role || '',
    domain: profile?.industry || profile?.skills?.domain || '',
    bio: profile?.bio || profile?.skills?.servicesOffered || '',
    linkedin: profile?.linkedin_url || profile?.skills?.socialLinks?.linkedin || profile?.skills?.linkedin || '',
    instagram: profile?.skills?.socialLinks?.instagram || profile?.skills?.instagram || '',
    website: profile?.website || profile?.skills?.socialLinks?.website || profile?.skills?.website || '',
  });

  // Networking Locations state
  const [currentCity, setCurrentCity] = useState<string>(() => {
    return profile?.skills?.currentCity || profile?.location || '';
  });
  const [targetCities, setTargetCities] = useState<string[]>(() => {
    const raw = profile?.skills?.targetCities;
    if (Array.isArray(raw)) return raw;
    return [];
  });
  const [targetCityInput, setTargetCityInput] = useState('');

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

  // 5) Networking Goals Target state (Frequency & Connections)
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
        city: item.city || '',
        relationship: item.relationship || item.orgName || '',
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
    city: '',
    relationship: '',
  });
  const [showAddConnRow, setShowAddConnRow] = useState(false);

  // Card Auto-Saving States & View Bridge Modal State
  const [cardSaving, setCardSaving] = useState<Record<string, boolean>>({});
  const [cardError, setCardError] = useState<Record<string, string>>({});
  const [viewBridgeModal, setViewBridgeModal] = useState<ConnectablePerson | null>(null);
  const [editingBridge, setEditingBridge] = useState<ConnectablePerson | null>(null);

  useEffect(() => {
    if (user || profile) {
      setAvatarUrl(user?.avatarUrl || profile?.avatar_url || '');
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: profile?.phone || '',
        company: profile?.company || profile?.skills?.company || '',
        role: profile?.job_title || profile?.skills?.role || '',
        domain: profile?.industry || profile?.skills?.domain || '',
        bio: profile?.bio || profile?.skills?.servicesOffered || '',
        linkedin: profile?.linkedin_url || profile?.skills?.socialLinks?.linkedin || profile?.skills?.linkedin || '',
        instagram: profile?.skills?.socialLinks?.instagram || profile?.skills?.instagram || '',
        website: profile?.website || profile?.skills?.socialLinks?.website || profile?.skills?.website || '',
      });

      if (profile?.skills?.currentCity || profile?.location) {
        setCurrentCity(profile.skills?.currentCity || profile.location || '');
      }

      if (Array.isArray(profile?.skills?.targetCities)) {
        setTargetCities(profile.skills.targetCities);
      }

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
            city: item.city || '',
            relationship: item.relationship || item.orgName || '',
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
    reader.onload = async (uploadEvent) => {
      if (uploadEvent.target?.result) {
        const rawBase64 = uploadEvent.target.result as string;
        try {
          const res = await api.post<{ avatarUrl: string }>('/upload/avatar', { imageBase64: rawBase64 });
          const finalUrl = res.avatarUrl || rawBase64;
          setAvatarUrl(finalUrl);
          await api.put('/profile', { avatar_url: finalUrl });
          await refreshProfile();
        } catch {
          setAvatarUrl(rawBase64);
          await api.put('/profile', { avatar_url: rawBase64 });
          await refreshProfile();
        }
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

  // Central Helper to Auto-Save Profile State to Backend
  const saveProfileStateToBackend = async (overrideData?: Partial<{
    targetCities: string[];
    networkingGroups: string[];
    hobbies: string[];
    userInterests: string[];
    userGoals: string[];
    targetBusinesses: string[];
    connectionsOffered: ConnectablePerson[];
  }>) => {
    const cleanTargetCities = (overrideData?.targetCities ?? targetCities).map((c) => c.trim()).filter(Boolean);
    const cleanGroups = (overrideData?.networkingGroups ?? networkingGroups).map((g) => g.trim()).filter(Boolean);
    const cleanHobbies = (overrideData?.hobbies ?? hobbies).map((h) => h.trim()).filter(Boolean);
    const cleanInterests = (overrideData?.userInterests ?? userInterests).map((i) => i.trim()).filter(Boolean);
    const cleanGoals = (overrideData?.userGoals ?? userGoals).map((g) => g.trim()).filter(Boolean);
    const cleanTargets = (overrideData?.targetBusinesses ?? targetBusinesses).map((t) => t.trim()).filter(Boolean);
    const bridgesToSave = overrideData?.connectionsOffered ?? connectionsOffered;

    const res = await api.put('/profile', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      job_title: formData.role,
      role: formData.role,
      industry: formData.domain,
      domain: formData.domain,
      bio: formData.bio,
      servicesOffered: formData.bio,
      avatar_url: avatarUrl,
      linkedin: formData.linkedin,
      instagram: formData.instagram,
      website: formData.website,
      socialLinks: {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        website: formData.website,
      },
      currentCity,
      targetCities: cleanTargetCities,
      networkingGroup: cleanGroups,
      hobbies: cleanHobbies,
      userInterests: cleanInterests,
      goals: cleanGoals,
      networkingTargetPeriod,
      networkingNewConnections,
      targetBusinesses: cleanTargets,
      connectionsOffered: bridgesToSave,
    });

    await refreshProfile();
    return res;
  };

  // Location Handlers (Auto-Saving)
  const handleAddTargetCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = targetCityInput.trim();
    if (!val) return;
    if (targetCities.length >= 10) return;
    const nextList = [...targetCities, val];

    try {
      setCardSaving((prev) => ({ ...prev, cities: true }));
      setCardError((prev) => ({ ...prev, cities: '' }));
      await saveProfileStateToBackend({ targetCities: nextList });
      setTargetCities(nextList);
      setTargetCityInput('');
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, cities: err.message || 'Failed to save target city. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, cities: false }));
    }
  };

  const handleRemoveTargetCity = async (index: number) => {
    const nextList = targetCities.filter((_, i) => i !== index);
    setTargetCities(nextList);
    try {
      await saveProfileStateToBackend({ targetCities: nextList });
    } catch (err) {
      console.error('Failed to auto-save target city removal', err);
    }
  };

  // Group Handlers (Auto-Saving)
  const handleAddGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = groupInput.trim();
    if (!val) return;
    if (networkingGroups.length >= 10) return;
    const nextList = [...networkingGroups, val];

    try {
      setCardSaving((prev) => ({ ...prev, groups: true }));
      setCardError((prev) => ({ ...prev, groups: '' }));
      await saveProfileStateToBackend({ networkingGroups: nextList });
      setNetworkingGroups(nextList);
      setGroupInput('');
      if (validationErrors.groups) setValidationErrors((prev) => ({ ...prev, groups: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, groups: err.message || 'Failed to save group. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, groups: false }));
    }
  };

  const handleRemoveGroup = async (index: number) => {
    const nextList = networkingGroups.filter((_, i) => i !== index);
    setNetworkingGroups(nextList);
    try {
      await saveProfileStateToBackend({ networkingGroups: nextList });
    } catch (err) {
      console.error('Failed to auto-save group removal', err);
    }
  };

  // Hobby Handlers (Auto-Saving)
  const handleAddHobby = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = hobbyInput.trim();
    if (!val) return;
    if (hobbies.length >= 5) return;
    const nextList = [...hobbies, val];

    try {
      setCardSaving((prev) => ({ ...prev, hobbies: true }));
      setCardError((prev) => ({ ...prev, hobbies: '' }));
      await saveProfileStateToBackend({ hobbies: nextList });
      setHobbies(nextList);
      setHobbyInput('');
      if (validationErrors.hobbies) setValidationErrors((prev) => ({ ...prev, hobbies: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, hobbies: err.message || 'Failed to save hobby. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, hobbies: false }));
    }
  };

  const handleRemoveHobby = async (index: number) => {
    const nextList = hobbies.filter((_, i) => i !== index);
    setHobbies(nextList);
    try {
      await saveProfileStateToBackend({ hobbies: nextList });
    } catch (err) {
      console.error('Failed to auto-save hobby removal', err);
    }
  };

  // Interest Handlers (Auto-Saving)
  const handleAddInterest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = interestInput.trim();
    if (!val) return;
    if (userInterests.length >= 10) return;
    const nextList = [...userInterests, val];

    try {
      setCardSaving((prev) => ({ ...prev, interests: true }));
      setCardError((prev) => ({ ...prev, interests: '' }));
      await saveProfileStateToBackend({ userInterests: nextList });
      setUserInterests(nextList);
      setInterestInput('');
      if (validationErrors.interests) setValidationErrors((prev) => ({ ...prev, interests: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, interests: err.message || 'Failed to save interest. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, interests: false }));
    }
  };

  const handleRemoveInterest = async (index: number) => {
    const nextList = userInterests.filter((_, i) => i !== index);
    setUserInterests(nextList);
    try {
      await saveProfileStateToBackend({ userInterests: nextList });
    } catch (err) {
      console.error('Failed to auto-save interest removal', err);
    }
  };

  // Objective Handlers (Auto-Saving)
  const handleAddGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = goalInput.trim();
    if (!val) return;
    if (userGoals.length >= 5) return;
    const nextList = [...userGoals, val];

    try {
      setCardSaving((prev) => ({ ...prev, objectives: true }));
      setCardError((prev) => ({ ...prev, objectives: '' }));
      await saveProfileStateToBackend({ userGoals: nextList });
      setUserGoals(nextList);
      setGoalInput('');
      if (validationErrors.objectives) setValidationErrors((prev) => ({ ...prev, objectives: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, objectives: err.message || 'Failed to save objective. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, objectives: false }));
    }
  };

  const handleRemoveGoal = async (index: number) => {
    const nextList = userGoals.filter((_, i) => i !== index);
    setUserGoals(nextList);
    try {
      await saveProfileStateToBackend({ userGoals: nextList });
    } catch (err) {
      console.error('Failed to auto-save objective removal', err);
    }
  };

  // Target Business Handlers (Auto-Saving)
  const handleAddTargetBusiness = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = targetInput.trim();
    if (!val) return;
    if (targetBusinesses.length >= 10) return;
    const nextList = [...targetBusinesses, val];

    try {
      setCardSaving((prev) => ({ ...prev, targets: true }));
      setCardError((prev) => ({ ...prev, targets: '' }));
      await saveProfileStateToBackend({ targetBusinesses: nextList });
      setTargetBusinesses(nextList);
      setTargetInput('');
      if (validationErrors.targets) setValidationErrors((prev) => ({ ...prev, targets: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, targets: err.message || 'Failed to save target business. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, targets: false }));
    }
  };

  const handleRemoveTargetBusiness = async (index: number) => {
    const nextList = targetBusinesses.filter((_, i) => i !== index);
    setTargetBusinesses(nextList);
    try {
      await saveProfileStateToBackend({ targetBusinesses: nextList });
    } catch (err) {
      console.error('Failed to auto-save target business removal', err);
    }
  };

  // Connection Bridge Handlers (Auto-Saving)
  const handleAddConnectionBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConn.businessDomain.trim() || !newConn.personName.trim()) return;
    if (connectionsOffered.length >= 10) return;
    const newEntry: ConnectablePerson = {
      ...newConn,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const nextBridges = [...connectionsOffered, newEntry];

    try {
      setCardSaving((prev) => ({ ...prev, bridges: true }));
      setCardError((prev) => ({ ...prev, bridges: '' }));
      await saveProfileStateToBackend({ connectionsOffered: nextBridges });
      setConnectionsOffered(nextBridges);
      setNewConn({ businessDomain: '', personName: '', orgName: '', role: '', city: '', relationship: '' });
      setShowAddConnRow(false);
      if (validationErrors.bridges) setValidationErrors((prev) => ({ ...prev, bridges: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, bridges: err.message || 'Failed to save connection bridge. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, bridges: false }));
    }
  };

  const handleRemoveConnectionOffered = async (id: string) => {
    const nextBridges = connectionsOffered.filter((c) => c.id !== id);
    setConnectionsOffered(nextBridges);
    try {
      await saveProfileStateToBackend({ connectionsOffered: nextBridges });
    } catch (err) {
      console.error('Failed to auto-save bridge removal', err);
    }
  };

  const handleSaveEditBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBridge || !editingBridge.businessDomain.trim() || !editingBridge.personName.trim()) return;

    const nextBridges = connectionsOffered.map((c) =>
      c.id === editingBridge.id ? editingBridge : c
    );

    try {
      setCardSaving((prev) => ({ ...prev, bridges: true }));
      setCardError((prev) => ({ ...prev, bridges: '' }));
      await saveProfileStateToBackend({ connectionsOffered: nextBridges });
      setConnectionsOffered(nextBridges);
      if (viewBridgeModal && viewBridgeModal.id === editingBridge.id) {
        setViewBridgeModal(editingBridge);
      }
      setEditingBridge(null);
      if (validationErrors.bridges) setValidationErrors((prev) => ({ ...prev, bridges: '' }));
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, bridges: err.message || 'Failed to update connection bridge. Please try again.' }));
    } finally {
      setCardSaving((prev) => ({ ...prev, bridges: false }));
    }
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
    if (!formData.company || !formData.company.trim()) {
      errors.company = 'Brand/Company Name is required.';
    }
    if (!formData.role || !formData.role.trim()) {
      errors.role = 'Role is required.';
    }
    if (!formData.domain || !formData.domain.trim()) {
      errors.domain = 'Domain is required.';
    }
    if (!formData.bio || !formData.bio.trim()) {
      errors.bio = 'Services We Offer is required.';
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
      errors.interests = 'At least 1 Interest is required.';
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
        if (errors.name || errors.phone || errors.company || errors.role || errors.domain || errors.bio) updated['identity'] = false;
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
      const cleanTargetCities = targetCities.map((c) => c.trim()).filter(Boolean);

      await api.put('/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        job_title: formData.role,
        role: formData.role,
        industry: formData.domain,
        domain: formData.domain,
        bio: formData.bio,
        servicesOffered: formData.bio,
        avatar_url: avatarUrl,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          website: formData.website,
        },
        currentCity,
        targetCities: cleanTargetCities,
        networkingGroup: cleanGroups,
        hobbies: cleanHobbies,
        userInterests: cleanInterests,
        goals: cleanGoals,
        networkingTargetPeriod,
        networkingNewConnections,
        targetBusinesses: cleanTargets,
        connectionsOffered,
      });

      const wasCompleteBeforeSave = isProfileComplete;
      const { isComplete } = await refreshProfile();
      setSavedSuccess(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setSavedSuccess(false);
        if (!wasCompleteBeforeSave && isComplete) {
          navigate('/feed');
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
    if (formData.company && formData.role && formData.domain) score += 10;
    if (formData.bio) score += 10;
    if (avatarUrl) score += 10;
    if (networkingGroups.length > 0) score += 10;
    if (hobbies.length > 0) score += 10;
    if (userInterests.length > 0) score += 10;
    if (userGoals.length > 0) score += 5;
    if (targetBusinesses.length > 0 && connectionsOffered.length > 0) score += 5;
    return Math.min(100, score);
  };
  const completionPercentage = calcCompletionScore();
  const completionScoreText = `${Math.round(completionPercentage / 10)}/10`;

  const isCompletedUser = isProfileComplete || completionPercentage === 100;

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
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              {isCompletedUser
                ? 'Your networking identity & preferences are active and synced'
                : 'Complete your identity to unlock all CRM modules'}
            </p>
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
                {isCompletedUser ? (
                  <Save className="w-4 h-4 text-blue-700" />
                ) : (
                  <UserCheck className="w-4 h-4 text-blue-700" />
                )}
                <span>{isCompletedUser ? 'Save Profile Changes' : 'Complete Profile Setup'}</span>
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
        
        {/* LEFT COLUMN: Profile Photo, Identity & Locations */}
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
            (validationErrors.name || validationErrors.phone || validationErrors.company || validationErrors.role || validationErrors.domain || validationErrors.bio)
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
                    {(validationErrors.name || validationErrors.phone || validationErrors.company || validationErrors.role || validationErrors.domain || validationErrors.bio) && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>Action Required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">Tell us about your brand, role, domain, and services offered.</p>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Pre-fetched (Non-editable)</span>
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      disabled
                      value={formData.name || user?.displayName || ''}
                      placeholder="Your Full Name"
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-not-allowed"
                    />
                    {(formData.name || user?.displayName) && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Pre-fetched (Verified)</span>
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={formData.email || user?.email || ''}
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-not-allowed"
                      />
                      {(formData.email || user?.email) && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
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
                        placeholder="e.g. +91 9876543210"
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

                {/* Brand/Company Name & Role & Domain Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Brand/Company Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. NexaCorp / Acme Inc"
                        value={formData.company}
                        onChange={(e) => {
                          setFormData({ ...formData, company: e.target.value });
                          if (validationErrors.company) {
                            setValidationErrors((prev) => ({ ...prev, company: '' }));
                          }
                        }}
                        className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden ${
                          validationErrors.company
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                      {formData.company && !validationErrors.company && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {validationErrors.company && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.company}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Founder & CEO / VP Marketing"
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({ ...formData, role: e.target.value });
                          if (validationErrors.role) {
                            setValidationErrors((prev) => ({ ...prev, role: '' }));
                          }
                        }}
                        className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden ${
                          validationErrors.role
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                      {formData.role && !validationErrors.role && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {validationErrors.role && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.role}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Domain <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Compass className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. SaaS / HealthTech / FinTech"
                        value={formData.domain}
                        onChange={(e) => {
                          setFormData({ ...formData, domain: e.target.value });
                          if (validationErrors.domain) {
                            setValidationErrors((prev) => ({ ...prev, domain: '' }));
                          }
                        }}
                        className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:outline-hidden ${
                          validationErrors.domain
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                      />
                      {formData.domain && !validationErrors.domain && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {validationErrors.domain && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.domain}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Services We Offer <span className="text-rose-500">*</span>
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
                    placeholder="Describe the key services, solutions, or products your brand or company offers..."
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
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      {formData.linkedin && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-pink-600">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://instagram.com/username"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      {formData.instagram && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5" />}
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-emerald-600">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com"
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

          {/* BLOCK 3: Networking Locations (Collapsible) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
            {/* Header */}
            <div
              onClick={() => toggleBlock('locations')}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Networking Locations</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Manage your current location and target cities for networking.</p>
                </div>
              </div>
              <div className="text-slate-400 hover:text-slate-600 p-1">
                {collapsedBlocks['locations'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Body */}
            {!collapsedBlocks['locations'] && (
              <div className="p-5 space-y-4 animate-fadeIn">
                {/* Field 1: Current City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    I am in city
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={currentCity}
                      onChange={(e) => setCurrentCity(e.target.value)}
                      placeholder="enter your city (e.g. Mumbai)..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Field 2: Target Cities */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    I am looking to network with people in
                  </label>
                  {cardError['cities'] && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{cardError['cities']}</span>
                    </div>
                  )}
                  <form onSubmit={handleAddTargetCity} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={targetCityInput}
                        onChange={(e) => setTargetCityInput(e.target.value)}
                        placeholder="enter city name..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={cardSaving['cities']}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                    >
                      {cardSaving['cities'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '+ Add'}
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {targetCities.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No target cities added yet.</div>
                    ) : (
                      targetCities.map((city, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-fadeIn"
                        >
                          <span>📍 {city}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTargetCity(idx)}
                            className="hover:text-emerald-900 transition-colors p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Groups, Hobbies, Interests, Objectives */}
        <div className="lg:col-span-7 space-y-6">

          {/* BLOCK 4: Networking Groups (Collapsible) */}
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
                {cardError['groups'] && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cardError['groups']}</span>
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
                    disabled={cardSaving['groups']}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    {cardSaving['groups'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
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

          {/* BLOCK 5: Hobbies (Collapsible) */}
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
                {cardError['hobbies'] && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cardError['hobbies']}</span>
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
                    disabled={cardSaving['hobbies']}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    {cardSaving['hobbies'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
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

          {/* BLOCK 6: Interests (Collapsible) */}
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
                    <span>Interests</span>
                    {validationErrors.interests && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>At least 1 required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">List your favorite interests and focus areas.</p>
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
                {cardError['interests'] && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cardError['interests']}</span>
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
                    disabled={cardSaving['interests']}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    {cardSaving['interests'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
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

          {/* BLOCK 7: Networking Objectives (Collapsible) */}
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
                {cardError['objectives'] && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{cardError['objectives']}</span>
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
                    disabled={cardSaving['objectives']}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    {cardSaving['objectives'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
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
        
        {/* BLOCK 8: Networking Goals (Collapsible - Frequency & Connections) */}
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
                <p className="text-[11px] text-slate-500 font-medium">Set your networking target frequency and connections.</p>
              </div>
            </div>
            <div className="text-slate-400 hover:text-slate-600 p-1">
              {collapsedBlocks['goals'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* Body */}
          {!collapsedBlocks['goals'] && (
            <div className="p-5 space-y-4 animate-fadeIn">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Connections</label>
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

              <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider block">Target Goal</span>
                  <p className="text-xs font-bold text-slate-900">
                    {networkingNewConnections} connections per {networkingTargetPeriod}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 9: Target Industries & Businesses (Collapsible) */}
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
              {cardError['targets'] && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{cardError['targets']}</span>
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
                  disabled={cardSaving['targets']}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 disabled:opacity-50"
                >
                  {cardSaving['targets'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
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

        {/* BLOCK 10: Connection Bridges (Collapsible) */}
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
                  Who can you connect people to? Add key contacts and relationship details.
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
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">Business Domain / Industry</label>
                      <input
                        type="text"
                        placeholder="Business Domain / Industry (e.g. AI / SaaS, Finance)"
                        value={newConn.businessDomain}
                        onChange={(e) => setNewConn({ ...newConn, businessDomain: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="City / Location (e.g. Mumbai, New York)"
                      value={newConn.city || ''}
                      onChange={(e) => setNewConn({ ...newConn, city: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Relationship with you (e.g. Friend, College Alumni, Family)"
                      value={newConn.relationship || ''}
                      onChange={(e) => setNewConn({ ...newConn, relationship: e.target.value, orgName: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cardSaving['bridges']}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {cardSaving['bridges'] ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Bridge...</span>
                      </>
                    ) : (
                      <span>Save Bridge</span>
                    )}
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
                        className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 flex items-start justify-between gap-3 animate-fadeIn hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{conn.personName}</h4>
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {conn.role || 'Contact'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap pt-0.5">
                              {conn.businessDomain && (
                                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-700 flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-indigo-500" />
                                  <span>Domain/Industry: {conn.businessDomain}</span>
                                </span>
                              )}
                              {conn.city && (
                                <span className="px-2 py-0.5 rounded bg-slate-200/70 font-semibold text-slate-700">
                                  📍 {conn.city}
                                </span>
                              )}
                              {(conn.relationship || conn.orgName) && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200/60 font-semibold text-purple-700">
                                  🤝 {conn.relationship || conn.orgName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewBridgeModal(conn)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                            title="View Complete Bridge Details"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBridge(conn)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Bridge Details"
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveConnectionOffered(conn.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Remove bridge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW BRIDGE DETAILS MODAL */}
      {viewBridgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setViewBridgeModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0 border border-indigo-200">
                {viewBridgeModal.personName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewBridgeModal.personName}</h3>
                <p className="text-xs text-slate-500 font-medium">{viewBridgeModal.role || 'Connection Bridge Contact'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 text-xs">
              <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Business Domain / Industry</span>
                <div className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>{viewBridgeModal.businessDomain || 'Not specified'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Organization / Company</span>
                  <div className="font-bold text-slate-800">{viewBridgeModal.orgName || viewBridgeModal.role || 'N/A'}</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location / City</span>
                  <div className="font-bold text-slate-800">{viewBridgeModal.city || 'Not specified'}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relationship with You</span>
                <div className="font-bold text-slate-800">{viewBridgeModal.relationship || 'Direct Contact'}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingBridge(viewBridgeModal);
                  setViewBridgeModal(null);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Bridge</span>
              </button>
              <button
                onClick={() => setViewBridgeModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BRIDGE MODAL */}
      {editingBridge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setEditingBridge(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Pencil className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Connection Bridge</h3>
                <p className="text-xs text-slate-500 font-medium">Update relationship & contact details for this bridge.</p>
              </div>
            </div>

            {cardError['bridges'] && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{cardError['bridges']}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditBridge} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingBridge.personName}
                  onChange={(e) => setEditingBridge({ ...editingBridge, personName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role & Company
                </label>
                <input
                  type="text"
                  value={editingBridge.role}
                  onChange={(e) => setEditingBridge({ ...editingBridge, role: e.target.value })}
                  placeholder="e.g. CTO • TechCorp"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Domain / Industry <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingBridge.businessDomain}
                  onChange={(e) => setEditingBridge({ ...editingBridge, businessDomain: e.target.value })}
                  placeholder="e.g. AI / SaaS, Finance"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editingBridge.city || ''}
                    onChange={(e) => setEditingBridge({ ...editingBridge, city: e.target.value })}
                    placeholder="e.g. Mumbai, New York"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship with You
                  </label>
                  <input
                    type="text"
                    value={editingBridge.relationship || ''}
                    onChange={(e) => setEditingBridge({ ...editingBridge, relationship: e.target.value, orgName: e.target.value })}
                    placeholder="e.g. Friend, College Alumni"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBridge(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cardSaving['bridges']}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {cardSaving['bridges'] ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

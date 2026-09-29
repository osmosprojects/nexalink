import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  UserPlus,
  Heart,
  Users,
  Briefcase,
  Sparkles,
  Calendar,
  MessageSquare,
  Target,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

interface ConnectableRow {
  id: string;
  name: string;
  company: string;
  domain: string;
  role: string;
}

interface MilestoneRow {
  id: string;
  type: 'Birthday' | 'Anniversary / Founding' | 'Other Special Milestone';
  date: string;
  note: string;
}

interface DetailRow {
  id: string;
  value: string;
}

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contactId?: number) => void;
}

const NETWORK_PRESETS = [
  'Alumni Network',
  'Business Association',
  'Industry Association',
  'Founder Community',
  'Startup Network',
  'Professional Association',
  'Chamber of Commerce',
  'Investor Network',
  'Local Business Network',
  'TiE Mumbai',
  'IIT Alumni',
  'SaaS Founders',
  'Other',
];

export const AddConnectionModal: React.FC<AddConnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();

  // Form State
  const [relationship, setRelationship] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [businessFocus, setBusinessFocus] = useState('');
  const [whereMet, setWhereMet] = useState('');

  // Networks State
  const [networks, setNetworks] = useState<string[]>([]);
  const [networkInput, setNetworkInput] = useState('');
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [networkDuplicateWarning, setNetworkDuplicateWarning] = useState(false);

  // Repeatable Rows
  const [connectableRows, setConnectableRows] = useState<ConnectableRow[]>([]);
  const [personalDetails, setPersonalDetails] = useState<DetailRow[]>([]);
  const [hobbies, setHobbies] = useState<DetailRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);

  // Meeting & Followup
  const [meetingIntelligence, setMeetingIntelligence] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTask, setFollowUpTask] = useState('');

  const { user } = useAuth();

  // Feed Posting State
  const [isPostingToFeed, setIsPostingToFeed] = useState(false);
  const [hasPostedToFeed, setHasPostedToFeed] = useState(false);

  // UI States
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [possibleDuplicate, setPossibleDuplicate] = useState<any | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [savedContact, setSavedContact] = useState<any | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRelationship('warm');
      setFullName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setRole('');
      setBusinessFocus('');
      setWhereMet('');
      setNetworks([]);
      setNetworkInput('');
      setConnectableRows([]);
      setPersonalDetails([]);
      setHobbies([]);
      setMilestones([]);
      setMeetingIntelligence('');
      setFollowUpDate('');
      setFollowUpTask('');
      setErrors({});
      setIsSaving(false);
      setPossibleDuplicate(null);
      setShowDiscardConfirm(false);
      setSavedContact(null);
      setIsPostingToFeed(false);
      setHasPostedToFeed(false);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else if (possibleDuplicate) {
          setPossibleDuplicate(null);
        } else if (savedContact) {
          handleDone();
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDiscardConfirm, possibleDuplicate, savedContact, fullName, email, phone, company, role]);

  if (!isOpen) return null;

  // Check if form has unsaved edits
  const isDirty = () => {
    return (
      fullName.trim() !== '' ||
      phone.trim() !== '' ||
      email.trim() !== '' ||
      company.trim() !== '' ||
      role.trim() !== '' ||
      businessFocus.trim() !== '' ||
      whereMet.trim() !== '' ||
      networks.length > 0 ||
      connectableRows.some((r) => r.name || r.company || r.domain || r.role) ||
      personalDetails.some((d) => d.value) ||
      hobbies.some((h) => h.value) ||
      milestones.some((m) => m.date || m.note) ||
      meetingIntelligence.trim() !== '' ||
      followUpDate !== '' ||
      followUpTask.trim() !== ''
    );
  };

  const handleAttemptClose = () => {
    if (savedContact) {
      handleDone();
      return;
    }
    if (isDirty()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDone = () => {
    onClose();
    if (onSuccess && savedContact?.contact_id) {
      onSuccess(savedContact.contact_id);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Enter a valid email address.';
      }
    }

    if (phone.trim()) {
      const cleanPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
      if (cleanPhone.length > 0 && (!/^\d+$/.test(cleanPhone) || cleanPhone.length < 5)) {
        newErrors.phone = 'Enter a valid phone number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Network tag management
  const addNetworkTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (!clean) return;

    if (networks.some((n) => n.toLowerCase() === clean.toLowerCase())) {
      setNetworkDuplicateWarning(true);
      setTimeout(() => setNetworkDuplicateWarning(false), 2500);
      return;
    }

    setNetworks([...networks, clean]);
    setNetworkInput('');
    setIsNetworkDropdownOpen(false);
  };

  const removeNetworkTag = (tagToRemove: string) => {
    setNetworks(networks.filter((n) => n !== tagToRemove));
  };

  // Repeatable rows handlers
  const addConnectableRow = () => {
    setConnectableRows([
      ...connectableRows,
      { id: String(Date.now()), name: '', company: '', domain: '', role: '' },
    ]);
  };

  const updateConnectableRow = (id: string, field: keyof ConnectableRow, val: string) => {
    setConnectableRows(
      connectableRows.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeConnectableRow = (id: string) => {
    setConnectableRows(connectableRows.filter((r) => r.id !== id));
  };

  const addPersonalDetail = () => {
    setPersonalDetails([...personalDetails, { id: String(Date.now()), value: '' }]);
  };

  const addHobby = () => {
    setHobbies([...hobbies, { id: String(Date.now()), value: '' }]);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: String(Date.now()),
        type: 'Birthday',
        date: '',
        note: '',
      },
    ]);
  };

  // Check for duplicates before submit
  const checkDuplicateAndSave = async (bypassDuplicateCheck = false) => {
    if (!validateForm()) {
      if (errors.fullName) {
        nameInputRef.current?.focus();
      }
      return;
    }

    setIsSaving(true);

    try {
      if (!bypassDuplicateCheck) {
        // Query existing contacts for duplicate check
        const contactsRes = await api.get<any>('/contacts?limit=100');
        const existingList = Array.isArray(contactsRes?.items)
          ? contactsRes.items
          : Array.isArray(contactsRes)
          ? contactsRes
          : [];

        const cleanName = fullName.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim().replace(/[\s\-\+\(\)]/g, '');
        const cleanComp = company.trim().toLowerCase();

        const match = existingList.find((c: any) => {
          const cName = `${c.first_name || ''} ${c.last_name || ''}`.trim().toLowerCase();
          const cEmail = (c.email || '').trim().toLowerCase();
          const cPhone = (c.phone || '').trim().replace(/[\s\-\+\(\)]/g, '');
          const cComp = (c.company || '').trim().toLowerCase();

          if (cleanEmail && cEmail && cleanEmail === cEmail) return true;
          if (cleanPhone && cPhone && cleanPhone === cPhone) return true;
          if (cleanName && cName && cleanName === cName && cleanComp && cComp && cleanComp === cComp) return true;
          return false;
        });

        if (match) {
          setIsSaving(false);
          setPossibleDuplicate(match);
          return;
        }
      }

      await executeSave();
    } catch (err: any) {
      console.error('Failed to check duplicate or save contact:', err);
      setIsSaving(false);
    }
  };

  // Save execution
  const executeSave = async () => {
    setIsSaving(true);
    try {
      const nameParts = fullName.trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      // Clean repeatable rows
      const validConnectables = connectableRows
        .filter((r) => r.name.trim() || r.company.trim() || r.domain.trim() || r.role.trim())
        .map((r) => ({
          personName: r.name.trim(),
          company: r.company.trim(),
          businessDomain: r.domain.trim(),
          role: r.role.trim(),
        }));

      const validDetails = personalDetails
        .map((d) => d.value.trim())
        .filter(Boolean);

      const validHobbies = hobbies
        .map((h) => h.value.trim())
        .filter(Boolean);

      const validMilestones = milestones
        .filter((m) => m.date.trim() || m.note.trim())
        .map((m) => ({
          type: m.type || 'Other Special Milestone',
          date: m.date.trim(),
          note: m.note.trim(),
        }));

      // Combine extended structured intelligence into notes string
      const extendedNotesObject = {
        whereMet: whereMet.trim() || null,
        businessFocus: businessFocus.trim() || null,
        otherNetworks: networks,
        connectablePersons: validConnectables,
        personalDetails: validDetails,
        hobbies: validHobbies,
        milestones: validMilestones,
        meetingIntelligence: meetingIntelligence.trim() || null,
        followUpTask: followUpTask.trim() || null,
      };

      const notesText = [
        meetingIntelligence.trim() ? `[Meeting Intelligence]: ${meetingIntelligence.trim()}` : null,
        whereMet.trim() ? `[Where Met]: ${whereMet.trim()}` : null,
        businessFocus.trim() ? `[Business Focus]: ${businessFocus.trim()}` : null,
        validDetails.length > 0 ? `[Personal Details]: ${validDetails.join('; ')}` : null,
        validHobbies.length > 0 ? `[Hobbies]: ${validHobbies.join(', ')}` : null,
        JSON.stringify(extendedNotesObject),
      ]
        .filter(Boolean)
        .join('\n\n');

      const strengthMap = { hot: 90, warm: 60, cold: 30 };

      const payload = {
        first_name,
        last_name,
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        job_title: role.trim() || null,
        relationship_type: relationship,
        relationship_strength: strengthMap[relationship],
        next_follow_up_at: followUpDate || null,
        notes: notesText,
        tagNames: networks,
      };

      const res = await api.post<any>('/contacts', payload);

      setIsSaving(false);
      setSavedContact(res);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti error
      }
    } catch (err: any) {
      console.error('Failed to save contact:', err);
      setIsSaving(false);
      setErrors({ fullName: err?.message || 'Failed to save contact. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 animate-fadeIn">
      {/* Main Modal Container */}
      <div
        ref={modalRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp text-slate-900"
      >
        {/* HEADER */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                Add New Connection
              </h2>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Capture a new relationship and all important details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS VIEW & FEED SHARE PROMPT */}
        {savedContact ? (
          <div className="p-6 sm:p-10 text-center space-y-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-bounce shrink-0">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-xl font-black text-slate-900">✓ Connection Added</h3>
              <p className="text-sm font-bold text-slate-800">
                {fullName}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {role ? `${role} · ` : ''}{company || 'Personal Connection'}
              </p>
            </div>

            {/* FEED SHARE PROMPT BOX */}
            <div className="w-full max-w-lg bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/80 border border-indigo-200/80 p-5 rounded-2xl space-y-4 text-left shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    Share on Network Feed?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Would you like to post this connection to notify your network?
                  </p>
                </div>
              </div>

              {/* Feed Post Preview Card */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">{user?.displayName || 'Abhishek Tiwari'}</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px] flex items-center gap-1 border border-amber-200">
                    <span>🌟</span>
                    <span>can connect you to</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 pl-1">
                  {fullName}{role ? `, ${role}` : ''}{company ? `, ${company}` : ''}
                </p>
              </div>

              {/* Share Actions */}
              {hasPostedToFeed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>✓ Posted to Network Feed successfully!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPostingToFeed}
                    onClick={async () => {
                      setIsPostingToFeed(true);
                      try {
                        const targetDetails = `${fullName}${role ? `, ${role}` : ''}${company ? `, ${company}` : ''}`;
                        const postContent = `[can connect you to] ${targetDetails}`;
                        await api.post('/feed', { content: postContent, tags: null });
                        setHasPostedToFeed(true);
                        try {
                          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                        } catch {}
                      } catch (feedErr) {
                        console.error('Failed to post to feed:', feedErr);
                      } finally {
                        setIsPostingToFeed(false);
                      }
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isPostingToFeed ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Yes, Post to Feed</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isPostingToFeed}
                    onClick={() => setHasPostedToFeed(false)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    No, Thanks
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (savedContact?.contact_id) {
                    navigate(`/connections/${savedContact.contact_id}`);
                  }
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                View Connection
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/feed');
                }}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                View Network Feed
              </button>
              <button
                type="button"
                onClick={() => {
                  setSavedContact(null);
                  setHasPostedToFeed(false);
                  setFullName('');
                  setPhone('');
                  setEmail('');
                  setCompany('');
                  setRole('');
                  setBusinessFocus('');
                  setWhereMet('');
                  setNetworks([]);
                  setNetworkInput('');
                  setConnectableRows([]);
                  setPersonalDetails([]);
                  setHobbies([]);
                  setMilestones([]);
                  setMeetingIntelligence('');
                  setFollowUpDate('');
                  setFollowUpTask('');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Add Another Person
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM BODY */
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50/50 flex-1">
            {/* ROW 1: Relationship & Network Membership */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* SECTION 1 — RELATIONSHIP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">1. Relationship</h3>
                    <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                      Set your relationship temperature with this person
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {/* Hot */}
                  <button
                    type="button"
                    onClick={() => setRelationship('hot')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'hot'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400/20 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>🔥</span>
                      <span>Hot</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                      Active & close
                    </span>
                  </button>

                  {/* Warm */}
                  <button
                    type="button"
                    onClick={() => setRelationship('warm')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'warm'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/20 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:border-amber-200 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>☀️</span>
                      <span>Warm</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                      Regular contact
                    </span>
                  </button>

                  {/* Cold */}
                  <button
                    type="button"
                    onClick={() => setRelationship('cold')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'cold'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-400/20 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>❄️</span>
                      <span>Cold</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                      Needs touch
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION 2 — NETWORK MEMBERSHIP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">2. Network Membership</h3>
                    <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                      Are they part of any other network/community?
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Text Input + Add Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={networkInput}
                      onChange={(e) => setNetworkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (networkInput.trim()) {
                            addNetworkTag(networkInput);
                          }
                        }
                      }}
                      placeholder="Type network name (e.g. TiE Mumbai, IIT Alumni)..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (networkInput.trim()) {
                          addNetworkTag(networkInput);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {networkDuplicateWarning && (
                    <p className="text-[11px] font-bold text-amber-600 animate-fadeIn">
                      Network already added.
                    </p>
                  )}

                  {/* Added Network Chips Display Below Text Input */}
                  <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
                    {networks.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No networks added yet.</p>
                    ) : (
                      networks.map((net) => (
                        <span
                          key={net}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-xl text-xs font-bold text-blue-800 shadow-2xs animate-fadeIn"
                        >
                          <span>{net}</span>
                          <button
                            type="button"
                            onClick={() => removeNetworkTag(net)}
                            className="text-blue-400 hover:text-rose-600 p-0.5 hover:bg-blue-100/80 rounded transition-colors"
                            title="Remove network"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Person & Professional Information */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">3. Person & Professional Information</h3>
                  <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                    Basic details about this person
                  </p>
                </div>
              </div>

              {/* Grid 1: Full Name, Phone, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="e.g. Priya Sharma"
                    aria-invalid={!!errors.fullName}
                    className={`w-full px-3 py-2 bg-slate-50 border text-xs text-slate-900 rounded-xl outline-none transition-all ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/20'
                        : 'border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="e.g. +91 98765 43210"
                    aria-invalid={!!errors.phone}
                    className={`w-full px-3 py-2 bg-slate-50 border text-xs text-slate-900 rounded-xl outline-none transition-all ${
                      errors.phone
                        ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/20'
                        : 'border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="e.g. priya@company.com"
                    aria-invalid={!!errors.email}
                    className={`w-full px-3 py-2 bg-slate-50 border text-xs text-slate-900 rounded-xl outline-none transition-all ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/20'
                        : 'border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Grid 2: Company, Role, Business Focus */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Organisation
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role / Job Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Director of AI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    What they do / Core Business Focus
                  </label>
                  <input
                    type="text"
                    value={businessFocus}
                    onChange={(e) => setBusinessFocus(e.target.value)}
                    placeholder="e.g. AI research, product development"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Full Width: Where Met */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Where did you meet them?
                </label>
                <input
                  type="text"
                  value={whereMet}
                  onChange={(e) => setWhereMet(e.target.value)}
                  placeholder="e.g. Conference, Event, Introduced by someone, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* ROW 3: People They Can Connect You With */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">4. People They Can Connect You With</h3>
                    <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                      Add people they can introduce you to
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addConnectableRow}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Person</span>
                </button>
              </div>

              {connectableRows.length === 0 ? (
                <div className="text-center py-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No introduction paths added yet. Click "+ Add Person" to map who this connection knows.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Desktop Column Header */}
                  <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 px-1">
                    <span className="col-span-3">Person Name</span>
                    <span className="col-span-3">Company / Organization</span>
                    <span className="col-span-3">Business Domain / Sector</span>
                    <span className="col-span-2">Role / Title</span>
                    <span className="col-span-1 text-center">Delete</span>
                  </div>

                  {connectableRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 md:p-1.5 bg-slate-50 md:bg-white rounded-xl border border-slate-200/80 items-center animate-fadeIn"
                    >
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateConnectableRow(row.id, 'name', e.target.value)}
                        placeholder="e.g. Rahul Mehta"
                        className="col-span-1 md:col-span-3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={row.company}
                        onChange={(e) => updateConnectableRow(row.id, 'company', e.target.value)}
                        placeholder="e.g. Microsoft"
                        className="col-span-1 md:col-span-3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={row.domain}
                        onChange={(e) => updateConnectableRow(row.id, 'domain', e.target.value)}
                        placeholder="e.g. AI, FinTech"
                        className="col-span-1 md:col-span-3 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={row.role}
                        onChange={(e) => updateConnectableRow(row.id, 'role', e.target.value)}
                        placeholder="e.g. CTO"
                        className="col-span-1 md:col-span-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                      />
                      <div className="col-span-1 flex justify-center pt-1 md:pt-0">
                        <button
                          type="button"
                          onClick={() => removeConnectableRow(row.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ROW 4: Personal Details & Hobbies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* SECTION 5 — PERSONAL DETAILS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">5. Personal Details</h3>
                      <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                        Notes about their personal life, family, preferences, etc.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addPersonalDetail}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Detail</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {personalDetails.map((detail) => (
                    <div key={detail.id} className="flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={detail.value}
                        onChange={(e) =>
                          setPersonalDetails(
                            personalDetails.map((d) =>
                              d.id === detail.id ? { ...d, value: e.target.value } : d
                            )
                          )
                        }
                        placeholder="e.g. Loves Ethiopian coffee, Son plays competitive tennis"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPersonalDetails(personalDetails.filter((d) => d.id !== detail.id))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {personalDetails.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No personal details added yet.</p>
                  )}
                </div>
              </div>

              {/* SECTION 6 — INTERESTS / HOBBIES */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">6. Interests / Hobbies</h3>
                      <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                        Their interests and hobbies to build a personal connection
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addHobby}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hobby</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {hobbies.map((hobby) => (
                    <div key={hobby.id} className="flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={hobby.value}
                        onChange={(e) =>
                          setHobbies(
                            hobbies.map((h) =>
                              h.id === hobby.id ? { ...h, value: e.target.value } : h
                            )
                          )
                        }
                        placeholder="e.g. Golf, Photography, Marathon running"
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setHobbies(hobbies.filter((h) => h.id !== hobby.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {hobbies.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No hobbies added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 5: Milestones & Meeting Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* SECTION 7 — IMPORTANT DATES */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">7. Important Dates / Milestones</h3>
                      <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                        Birthdays, anniversaries, or other important milestones
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80 items-center animate-fadeIn"
                    >
                      <select
                        value={m.type}
                        onChange={(e) =>
                          setMilestones(
                            milestones.map((item) =>
                              item.id === m.id ? { ...item, type: e.target.value as any } : item
                            )
                          )
                        }
                        className="sm:col-span-4 px-2 py-1.5 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg outline-none font-medium"
                      >
                        <option value="Birthday">🎂 Birthday</option>
                        <option value="Anniversary / Founding">💍 Anniversary / Founding</option>
                        <option value="Other Special Milestone">🌟 Other Special Milestone</option>
                      </select>

                      <input
                        type="date"
                        value={m.date}
                        onChange={(e) =>
                          setMilestones(
                            milestones.map((item) =>
                              item.id === m.id ? { ...item, date: e.target.value } : item
                            )
                          )
                        }
                        className="sm:col-span-4 px-2 py-1.5 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg outline-none"
                      />

                      <input
                        type="text"
                        value={m.note}
                        onChange={(e) =>
                          setMilestones(
                            milestones.map((item) =>
                              item.id === m.id ? { ...item, note: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. Send a card / plan a wish"
                        className="sm:col-span-3 px-2 py-1.5 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setMilestones(milestones.filter((item) => item.id !== m.id))}
                        className="sm:col-span-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No milestones added yet.</p>
                  )}
                </div>
              </div>

              {/* SECTION 8 — MEETING INTELLIGENCE */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">8. Meeting Intelligence</h3>
                    <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                      Key points from your conversations and meetings
                    </p>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={meetingIntelligence}
                  onChange={(e) => setMeetingIntelligence(e.target.value)}
                  placeholder="Discussed partnership opportunity, mutual synergies, pricing, timing, next steps..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* ROW 6: SECTION 9 — NEXT ACTION / FOLLOW-UP */}
            <div className="bg-rose-50/40 border border-rose-200/80 p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 border-b border-rose-100 pb-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">9. Next Action / Follow-up</h3>
                  <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                    Set a reminder for your next follow-up
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Follow-up Task
                  </label>
                  <input
                    type="text"
                    value={followUpTask}
                    onChange={(e) => setFollowUpTask(e.target.value)}
                    placeholder="e.g. Send proposal, Introduce to team, Schedule call, etc."
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STICKY FOOTER */}
        {!savedContact && (
          <div className="px-6 py-4 sm:px-8 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
            <button
              type="button"
              onClick={handleAttemptClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => checkDuplicateAndSave(false)}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* DISCARD CONFIRMATION DIALOG */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Discard this connection?</h4>
              <p className="text-xs text-slate-500">
                Your entered information will be lost.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POSSIBLE DUPLICATE CONFIRMATION DIALOG */}
      {possibleDuplicate && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Possible Existing Connection</h4>
                <p className="text-xs text-slate-500">This person may already exist in your network.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-xs font-bold text-slate-900">
                {possibleDuplicate.first_name} {possibleDuplicate.last_name}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                {possibleDuplicate.job_title ? `${possibleDuplicate.job_title} · ` : ''}
                {possibleDuplicate.company || 'Personal Contact'}
              </p>
              {possibleDuplicate.email && (
                <p className="text-[11px] text-slate-500">{possibleDuplicate.email}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPossibleDuplicate(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = possibleDuplicate.contact_id;
                  setPossibleDuplicate(null);
                  onClose();
                  if (id) navigate(`/connections/${id}`);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                View Existing
              </button>
              <button
                type="button"
                onClick={() => {
                  setPossibleDuplicate(null);
                  checkDuplicateAndSave(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Create Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddConnectionModal;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Sparkles,
  MessageSquareShare,
  Calendar,
  FileText,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Building,
  Trash2,
  Edit3,
  Check,
  Loader2,
  Users,
  Globe,
  Target
} from 'lucide-react';
import { api } from '../lib/api';
import { Contact, Interaction, Meeting, Task, Note } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { formatDate, getRelationshipTypeBadge, formatFullName, parseContactNotes } from '../lib/utils';
import { AddConnectionModal } from '../components/ui/AddConnectionModal';
import { QuickAddModal } from '../components/ui/QuickAddModal';
import confetti from 'canvas-confetti';

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'engagement' | 'notes'>('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'meeting' | 'task' | 'note'>('meeting');

  // Connection Type Private -> Public Flow state
  const [showPublicConfirmModal, setShowPublicConfirmModal] = useState(false);
  const [isPostingFeed, setIsPostingFeed] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  // Fetch full contact details
  const { data, isLoading, error } = useQuery<{
    contact: Contact;
    interactions: Interaction[];
    meetings: Meeting[];
    tasks: Task[];
    notes: Note[];
  }>({
    queryKey: ['contact', id],
    queryFn: () => api.get(`/contacts/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      navigate('/connections');
    },
  });

  const updateWarmthMutation = useMutation({
    mutationFn: (warmthTag: '🔥 Hot' | '☀️ Warm' | '❄️ Cold') =>
      api.put(`/contacts/${id}`, { warmthTag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (privacyTag: '🌐 Public Connection' | '🔒 Private Network') =>
      api.put(`/contacts/${id}`, { privacyTag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const handleConnectionTypeChange = (targetType: 'public' | 'private', isCurrentlyPublic: boolean) => {
    if (targetType === 'public' && !isCurrentlyPublic) {
      setShowPublicConfirmModal(true);
    } else if (targetType === 'private' && isCurrentlyPublic) {
      updatePrivacyMutation.mutate('🔒 Private Network', {
        onSuccess: () => {
          setSuccessToast('✓ Connection changed to Private Connection');
          setTimeout(() => setSuccessToast(null), 3000);
        },
      });
    }
  };

  const handleConfirmPublicShare = async (shareOnFeed: boolean) => {
    setIsPostingFeed(true);
    try {
      await api.put(`/contacts/${id}`, { privacyTag: '🌐 Public Connection', shareOnFeed });

      if (shareOnFeed) {
        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }

      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });

      setSuccessToast(
        shareOnFeed
          ? '✓ Changed to Public Connection & shared on Feed!'
          : '✓ Changed to Public Connection'
      );
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error('Failed to update connection type:', err);
    } finally {
      setIsPostingFeed(false);
      setShowPublicConfirmModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !data?.contact) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
        <h3 className="text-base font-bold text-slate-900">Contact not found</h3>
        <button
          onClick={() => navigate('/connections')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Connections
        </button>
      </div>
    );
  }

  const { contact, interactions, meetings, tasks, notes } = data;
  const badge = getRelationshipTypeBadge(contact.relationship_type);
  const { cleanNotes, extendedData } = parseContactNotes(contact.notes);
  const interactionHistory = [
    ...interactions.map((interaction) => ({
      ...interaction,
      key: `interaction-${interaction.interaction_id}`,
    })),
    {
      key: `contact-added-${contact.contact_id}`,
      title: 'Added to Network',
      interaction_type: 'Networking',
      interaction_date: contact.created_at,
      summary: extendedData?.meetingIntelligence,
      outcome: null,
    },
  ].sort((a, b) => (Date.parse(b.interaction_date) || 0) - (Date.parse(a.interaction_date) || 0));

  const followUpTask = extendedData?.followUpTask?.trim();
  const followUps = followUpTask || contact.next_follow_up_at
    ? [{
      key: `contact-follow-up-${contact.contact_id}`,
      kind: 'Follow-up',
      title: followUpTask || 'Follow up with this contact',
      date: contact.next_follow_up_at,
      label: null,
      agenda: null,
    }]
    : [];

  const engagements = [
    ...followUps,
    ...meetings.map((meeting) => ({
      key: `meeting-${meeting.meeting_id}`,
      kind: 'Meeting',
      title: meeting.title,
      date: meeting.start_at,
      label: meeting.meeting_type,
      agenda: meeting.agenda,
    })),
    ...tasks.map((task) => ({
      key: `task-${task.task_id}`,
      kind: 'Task',
      title: task.title,
      date: task.due_date,
      label: task.priority,
      agenda: null,
    })),
  ].sort((a, b) => {
    const timeA = a.date ? Date.parse(a.date) : Infinity;
    const timeB = b.date ? Date.parse(b.date) : Infinity;
    return timeA - timeB;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/connections')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Connections</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar
              src={contact.avatar_url}
              name={formatFullName(contact.first_name, contact.last_name)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ring-4 ring-brand-50 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatFullName(contact.first_name, contact.last_name)}
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${badge.bg}`}>
                  {badge.label}
                </span>

                {/* Privacy Network Badge Toggle / Selector */}
                {(() => {
                  const isPublic = (contact.tags || []).some((t) => t.name.includes('Public'));
                  return (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleConnectionTypeChange('private', isPublic)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                          !isPublic
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Set as Private Connection"
                      >
                        <span>🔒 Private Connection</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConnectionTypeChange('public', isPublic)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                          isPublic
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Set as Public Connection"
                      >
                        <span>🌐 Public Connection</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{contact.job_title || 'Leader'} at <span className="text-slate-900">{contact.company || 'Network'}</span></span>
              </p>
              {contact.location && (
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contact.location}</span>
                </p>
              )}

              {/* Network Memberships & Tag Pills */}
              {(() => {
                const isSpecialTag = (name: string) =>
                  name.includes('Hot') || name.includes('Warm') || name.includes('Cold') || name.includes('🔥') || name.includes('☀️') || name.includes('❄️') || name.includes('Public') || name.includes('Private');

                const rawNetworkList = Array.from(
                  new Set([
                    ...(extendedData?.otherNetworks || []),
                    ...(contact.tags || [])
                      .filter((t) => !isSpecialTag(t.name))
                      .map((t) => t.name),
                  ])
                ).filter(Boolean);

                if (rawNetworkList.length === 0) return null;

                return (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-indigo-500" />
                      <span>Networks:</span>
                    </span>
                    {rawNetworkList.map((net, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900 border border-indigo-200 shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{net}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setContactToEdit(contact)}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Relationship Status & Interactive Warmth Selector Row */}
        {(() => {
          const isWarmthTagName = (name: string) =>
            name.includes('Hot') || name.includes('Warm') || name.includes('Cold') || name.includes('🔥') || name.includes('☀️') || name.includes('❄️');

          const warmthTagObj = (contact.tags || []).find((t) => isWarmthTagName(t.name));
          const currentWarmthName = warmthTagObj
            ? warmthTagObj.name
            : contact.relationship_strength >= 80
            ? '🔥 Hot'
            : contact.relationship_strength >= 50
            ? '☀️ Warm'
            : '❄️ Cold';

          return (
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Connection Warmth Rating
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: '🔥 Hot', label: '🔥 Hot', color: 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20' },
                  { name: '☀️ Warm', label: '☀️ Warm', color: 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20' },
                  { name: '❄️ Cold', label: '❄️ Cold', color: 'bg-blue-500 text-white border-blue-600 shadow-blue-500/20' },
                ].map((w) => {
                  const isActive = currentWarmthName.includes(w.name.replace(/[^a-zA-Z]/g, '')) || currentWarmthName === w.name;
                  return (
                    <button
                      key={w.name}
                      onClick={() => updateWarmthMutation.mutate(w.name as any)}
                      disabled={updateWarmthMutation.isPending}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? `${w.color} shadow-sm scale-105 ring-2 ring-offset-1 ring-slate-400`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{w.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
                {updateWarmthMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-1" />}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        {([
          { id: 'overview', label: 'Overview', icon: FileText, count: undefined },
          { id: 'interactions', label: 'Interactions', icon: MessageSquareShare, count: interactionHistory.length },
          { id: 'engagement', label: 'Upcoming Engagement', icon: Calendar, count: engagements.length },
          { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (() => {
        const isWarmthTagName = (name: string) =>
          name.includes('Hot') || name.includes('Warm') || name.includes('Cold') || name.includes('🔥') || name.includes('☀️') || name.includes('❄️');

        const rawNetworkList = Array.from(
          new Set([
            ...(extendedData?.otherNetworks || []),
            ...(contact.tags || [])
              .filter((t) => !isWarmthTagName(t.name))
              .map((t) => t.name),
          ])
        ).filter(Boolean);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Network & Community Memberships Card */}
              {rawNetworkList.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Network & Community Memberships ({rawNetworkList.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">Active networks, communities, and organizations this connection belongs to</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {rawNetworkList.map((net, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 font-bold text-xs shadow-xs"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        <span>{net}</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-white/80 text-indigo-700 font-extrabold border border-indigo-100">
                          Active Member
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relationship Notes & Context</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {cleanNotes || 'No additional plain text notes added. See structured context below.'}
                </p>
              </div>

              {/* Extended Structured Intelligence Sections */}
              {extendedData && (
                <div className="space-y-6">
                  {/* 1. People They Can Connect You With */}
                  {extendedData.connectablePersons && extendedData.connectablePersons.length > 0 && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            People They Can Connect You With ({extendedData.connectablePersons.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">Valuable warm introductions available via this contact</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {extendedData.connectablePersons.map((p, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between space-y-2">
                            <div>
                              <span className="text-xs font-bold text-purple-950">{p.personName || 'Connection Candidate'}</span>
                              {p.role && <p className="text-[11px] text-slate-600 font-medium">{p.role}</p>}
                              {p.company && <p className="text-[11px] text-purple-700 font-semibold">{p.company}</p>}
                            </div>
                            {p.businessDomain && (
                              <div className="pt-1">
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                                  {p.businessDomain}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. People They Want to Meet */}
                  {extendedData.wantToMeetPersons && extendedData.wantToMeetPersons.length > 0 && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            People They Want to Meet ({extendedData.wantToMeetPersons.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">People or target profiles this contact is looking to connect with</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {extendedData.wantToMeetPersons.map((p, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between space-y-2">
                            <div>
                              <span className="text-xs font-bold text-amber-950">{p.personName || 'Target Person'}</span>
                              {p.role && <p className="text-[11px] text-slate-600 font-medium">{p.role}</p>}
                              {p.company && <p className="text-[11px] text-amber-800 font-semibold">{p.company}</p>}
                            </div>
                            {p.businessDomain && (
                              <div className="pt-1">
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                                  {p.businessDomain}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Personal Details & Hobbies */}
                  {((extendedData.personalDetails && extendedData.personalDetails.length > 0) ||
                    (extendedData.hobbies && extendedData.hobbies.length > 0)) && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Details & Hobbies</h4>
                      
                      {extendedData.personalDetails && extendedData.personalDetails.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Personal Background & Notes:</span>
                          <div className="flex flex-wrap gap-2">
                            {extendedData.personalDetails.map((detail, idx) => (
                              <span key={idx} className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-medium border border-slate-200/70">
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extendedData.hobbies && extendedData.hobbies.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">Interests & Hobbies:</span>
                          <div className="flex flex-wrap gap-2">
                            {extendedData.hobbies.map((hobby, idx) => (
                              <span key={idx} className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-semibold border border-amber-200/70">
                                ⚽ {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Important Dates & Milestones */}
                  {extendedData.milestones && extendedData.milestones.length > 0 && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important Dates & Milestones</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {extendedData.milestones.map((m, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900">{m.type}</span>
                              {m.date && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{m.date}</span>}
                            </div>
                            {m.note && <p className="text-xs text-slate-700 font-medium">{m.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Where Met & Business Focus */}
                  {(extendedData.whereMet || extendedData.businessFocus) && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Context</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {extendedData.whereMet && (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Where You Met</span>
                            <span className="font-semibold text-slate-900">{extendedData.whereMet}</span>
                          </div>
                        )}
                        {extendedData.businessFocus && (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Focus</span>
                            <span className="font-semibold text-slate-900">{extendedData.businessFocus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Timeline Preview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Interactions</h4>
                  <button
                    onClick={() => setActiveTab('interactions')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    View all interactions →
                  </button>
                </div>

                <div className="space-y-3">
                  {interactionHistory.slice(0, 3).map((inter) => (
                    <div key={inter.key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{inter.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {inter.interaction_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{formatDate(inter.interaction_date, 'long')}</p>
                      {inter.outcome && <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Outcome:</span> {inter.outcome}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Details Side card */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
                <div className="space-y-3 text-xs">
                  {contact.email && (
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${contact.email}`} className="text-brand-600 hover:underline truncate">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.linkedin_url && (
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <Linkedin className="w-4 h-4 text-brand-600 shrink-0" />
                      <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline truncate">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => deleteMutation.mutate()}
                    className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'interactions' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <h4 className="text-sm font-bold text-slate-900">Interactions</h4>

          <div className="relative pl-6 border-l-2 border-brand-200 space-y-6">
            {interactionHistory.map((inter) => (
              <div key={inter.key} className="relative space-y-2 group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{inter.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                    {inter.interaction_type}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto">{formatDate(inter.interaction_date, 'long')}</span>
                </div>
                {inter.summary && (
                  <p className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    {inter.summary}
                  </p>
                )}
                {inter.outcome && (
                  <p className="text-xs text-emerald-800 font-semibold">
                    Outcome: {inter.outcome}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-900">Upcoming Engagement</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickAddTab('meeting');
                  setIsQuickAddOpen(true);
                }}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                + Schedule Meeting
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickAddTab('task');
                  setIsQuickAddOpen(true);
                }}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                + Add Task
              </button>
            </div>
          </div>

          {engagements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No meetings, tasks, or follow-ups yet.</p>
          ) : (
            <div className="space-y-3">
              {engagements.map((item) => (
                <div key={item.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.kind === 'Follow-up' ? 'bg-emerald-100 text-emerald-800' : item.kind === 'Meeting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.kind}{item.label && ` · ${item.label}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.date ? formatDate(item.date, item.kind === 'Meeting' ? 'long' : 'short') : 'No due date'}
                  </p>
                  {item.agenda && <p className="text-xs text-slate-600 whitespace-pre-wrap">{item.agenda}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Notes on {contact.first_name}</h4>
            <button
              onClick={() => {
                setQuickAddTab('note');
                setIsQuickAddOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              + Add Note
            </button>
          </div>
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.note_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Private -> Public Connection Feed Share Prompt Modal */}
      {showPublicConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 p-6 space-y-5 animate-scaleUp text-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Would you like to share this connection on your Feed?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connection type will be set to Public Connection.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Feed Post Preview */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Post Preview</span>
              <p className="text-xs font-bold text-slate-800">
                [can connect you to] {formatFullName(contact.first_name, contact.last_name)}{contact.job_title ? `, ${contact.job_title}` : ''}{contact.company ? `, ${contact.company}` : ''}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isPostingFeed}
                onClick={() => handleConfirmPublicShare(true)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isPostingFeed ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Yes, Share on Feed</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isPostingFeed}
                onClick={() => handleConfirmPublicShare(false)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                No, Don't Share
              </button>
            </div>
          </div>
        </div>
      )}

      {contactToEdit && (
        <AddConnectionModal
          isOpen
          contactToEdit={contactToEdit}
          onClose={() => setContactToEdit(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['contact', id] });
          }}
        />
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        defaultContactId={Number(id)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['contact', id] });
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }}
      />
    </div>
  );
};

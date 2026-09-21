import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Sparkles,
  MessageSquareShare,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Building,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { Contact, Interaction, Meeting, Task, Note } from '../types';
import { formatDate, getRelationshipTypeBadge } from '../lib/utils';
import { QuickAddModal } from '../components/ui/QuickAddModal';
import confetti from 'canvas-confetti';

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'interactions' | 'meetings' | 'tasks' | 'notes'>('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'interaction' | 'meeting' | 'task' | 'note'>('interaction');

  // AI Assistant Modal state
  const [aiModalMode, setAiModalMode] = useState<'conversation' | 'draft' | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleAISuggestions = async () => {
    setAiModalMode('conversation');
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await api.post('/ai/conversation/suggestions', { contact_id: id });
      setAiSuggestions(res);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIDraft = async (purpose = 'follow_up', tone = 'professional') => {
    setAiModalMode('draft');
    setAiLoading(true);
    setAiDraft(null);
    try {
      const res = await api.post('/ai/message/draft', {
        contact_id: id,
        purpose,
        tone,
      });
      setAiDraft(res);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-6">
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
            <img
              src={contact.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={contact.first_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-brand-50 shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {contact.first_name} {contact.last_name}
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${badge.bg}`}>
                  {badge.label}
                </span>
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

              {/* Tag Pills */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {contact.tags.map((t) => (
                    <span
                      key={t.tag_id}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <button
              onClick={handleAISuggestions}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prepare Conversation</span>
            </button>
            <button
              onClick={() => handleAIDraft('follow_up')}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              <span>Draft Message</span>
            </button>
            <button
              onClick={() => {
                setQuickAddTab('interaction');
                setIsQuickAddOpen(true);
              }}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Interaction</span>
            </button>
          </div>
        </div>

        {/* Relationship Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Relationship Strength</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${contact.relationship_strength}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-800">{contact.relationship_strength}/100</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Interaction</span>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(contact.last_interaction_at, 'relative')}</span>
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Follow-up</span>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(contact.next_follow_up_at, 'short')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: FileText, count: undefined },
          { id: 'timeline', label: 'Timeline', icon: Clock, count: interactions.length },
          { id: 'interactions', label: 'Interactions', icon: MessageSquareShare, count: interactions.length },
          { id: 'meetings', label: 'Meetings', icon: Calendar, count: meetings.length },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
          { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Notes & Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relationship Notes & Context</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {contact.notes || 'No notes added yet. Use the note tab to record background and context.'}
              </p>
            </div>

            {/* Recent Timeline Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Interactions</h4>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  View full timeline →
                </button>
              </div>

              {interactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No interactions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {interactions.slice(0, 3).map((inter) => (
                    <div key={inter.interaction_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/50 space-y-1">
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
              )}
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
      )}

      {/* 2. TIMELINE TAB (Guide Section 18) */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Interaction History & Chronology</h4>
            <button
              onClick={() => {
                setQuickAddTab('interaction');
                setIsQuickAddOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              + Add Interaction
            </button>
          </div>

          {interactions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No timeline entries yet.</p>
          ) : (
            <div className="relative pl-6 border-l-2 border-brand-200 space-y-6">
              {interactions.map((inter) => (
                <div key={inter.interaction_id} className="relative space-y-2 group">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{inter.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                      {inter.interaction_type}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto">{formatDate(inter.interaction_date, 'long')}</span>
                  </div>
                  {inter.summary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
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
          )}
        </div>
      )}

      {/* 3. INTERACTIONS TAB */}
      {activeTab === 'interactions' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Logged Interactions</h4>
            <button
              onClick={() => {
                setQuickAddTab('interaction');
                setIsQuickAddOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              + Log Interaction
            </button>
          </div>
          <div className="space-y-3">
            {interactions.map((i) => (
              <div key={i.interaction_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{i.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 uppercase">{i.interaction_type}</span>
                </div>
                <p className="text-xs text-slate-600">{i.summary}</p>
                {i.outcome && <p className="text-xs font-semibold text-purple-700">Outcome: {i.outcome}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MEETINGS TAB */}
      {activeTab === 'meetings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Scheduled Meetings</h4>
            <button
              onClick={() => {
                setQuickAddTab('meeting');
                setIsQuickAddOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              + Schedule Meeting
            </button>
          </div>
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.meeting_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{m.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">{m.meeting_type}</span>
                </div>
                <p className="text-xs text-slate-500">{formatDate(m.start_at, 'long')}</p>
                {m.agenda && <p className="text-xs text-slate-600 whitespace-pre-wrap mt-1">{m.agenda}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Linked Tasks & Follow-ups</h4>
            <button
              onClick={() => {
                setQuickAddTab('task');
                setIsQuickAddOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              + Add Task
            </button>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.task_id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{t.title}</p>
                  <p className="text-[11px] text-slate-500">Due: {formatDate(t.due_date, 'short')}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. NOTES TAB */}
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

      {/* AI ASSISTANT MODAL / SLIDEOUT */}
      {aiModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-slideUp">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-950 text-white">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    {aiModalMode === 'conversation' ? 'Conversation Intelligence' : 'AI Message Drafting Studio'}
                  </h3>
                  <p className="text-[11px] text-purple-200">Tailored context for {contact.first_name} {contact.last_name}</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalMode(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {aiLoading && (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Analyzing relationship context & historical interactions...</p>
                </div>
              )}

              {/* Conversation Suggestion Content */}
              {!aiLoading && aiModalMode === 'conversation' && aiSuggestions && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Suggested Opener</h5>
                    <p className="mt-1 p-3 bg-purple-50 text-purple-950 rounded-xl font-medium leading-relaxed border border-purple-100">
                      "{aiSuggestions.opener}"
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">High-Signal Discussion Questions</h5>
                    <ul className="mt-1.5 space-y-2">
                      {aiSuggestions.discussion_questions.map((q: string, i: number) => (
                        <li key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 font-medium text-slate-800">
                          {i + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Strategic Next Step</h5>
                    <p className="mt-1 text-slate-700 font-medium">
                      {aiSuggestions.suggested_follow_up}
                    </p>
                  </div>
                </div>
              )}

              {/* Message Drafting Content */}
              {!aiLoading && aiModalMode === 'draft' && aiDraft && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {['professional', 'warm', 'concise'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => handleAIDraft('follow_up', tone as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                          aiDraft.tone === tone ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>

                  {aiDraft.subject && (
                    <div>
                      <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Subject</h5>
                      <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 font-semibold text-slate-800 mt-1">
                        {aiDraft.subject}
                      </p>
                    </div>
                  )}

                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Draft Content</h5>
                    <textarea
                      rows={6}
                      value={aiDraft.draft}
                      onChange={(e) => setAiDraft({ ...aiDraft, draft: e.target.value })}
                      className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => copyToClipboard(aiDraft.draft)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['contact', id] });
        }}
      />
    </div>
  );
};

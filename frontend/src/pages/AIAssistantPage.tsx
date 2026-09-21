import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  MessageSquareShare,
  Mail,
  FileText,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  Users,
  Send,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { Contact } from '../types';
import confetti from 'canvas-confetti';

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'draft' | 'summary' | 'insights'>('conversation');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Results
  const [conversationResult, setConversationResult] = useState<any>(null);
  const [draftResult, setDraftResult] = useState<any>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);

  // Draft form
  const [draftPurpose, setDraftPurpose] = useState<'follow_up' | 'intro' | 'thank_you' | 'meeting_request' | 'reconnect'>('follow_up');
  const [draftTone, setDraftTone] = useState<'professional' | 'warm' | 'concise'>('professional');
  const [draftContext, setDraftContext] = useState('');

  // Summary form
  const [rawNotes, setRawNotes] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');

  // Fetch contacts for dropdowns
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['contacts-dropdown'],
    queryFn: () => api.get<Contact[]>('/contacts?limit=100'),
  });

  // Fetch Insights
  const { data: insights = [] } = useQuery<any[]>({
    queryKey: ['ai-insights'],
    queryFn: () => api.get<any[]>('/ai/insights'),
  });

  const handleGenerateConversation = async () => {
    if (!selectedContactId) return;
    setLoading(true);
    setConversationResult(null);
    try {
      const res = await api.post('/ai/conversation/suggestions', {
        contact_id: parseInt(selectedContactId, 10),
        goal: customGoal,
      });
      setConversationResult(res);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedContactId) return;
    setLoading(true);
    setDraftResult(null);
    try {
      const res = await api.post('/ai/message/draft', {
        contact_id: parseInt(selectedContactId, 10),
        purpose: draftPurpose,
        tone: draftTone,
        context: draftContext,
      });
      setDraftResult(res);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!rawNotes) return;
    setLoading(true);
    setSummaryResult(null);
    try {
      const res = await api.post('/ai/meeting/summarize', {
        meeting_title: meetingTitle,
        notes: rawNotes,
      });
      setSummaryResult(res);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to summarize notes');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* AI Studio Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NexaLink Intelligence Engine</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black">AI Networking Studio</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
          Context-aware AI assistance designed to prepare high-signal conversations, draft authentic outreach, and summarize meeting outcomes without ever acting autonomously.
        </p>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'conversation', label: 'Conversation Prep', icon: MessageSquareShare },
            { id: 'draft', label: 'Message Composer', icon: Mail },
            { id: 'summary', label: 'Meeting Summarizer', icon: FileText },
            { id: 'insights', label: 'Relationship Insights', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white text-purple-950 shadow-md scale-105'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE 1: CONVERSATION PREPARATION */}
      {activeTab === 'conversation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Prepare for Conversation</h3>
            <p className="text-xs text-slate-500">Select a contact to generate tailored talking points and questions</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Contact *</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="">Select a contact...</option>
                {contacts.map((c) => (
                  <option key={c.contact_id} value={c.contact_id}>
                    {c.first_name} {c.last_name} ({c.job_title || 'Leader'} @ {c.company || 'Network'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Goal / Topic (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Discuss Seed round or AI agent schemas"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleGenerateConversation}
              disabled={!selectedContactId || loading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Strategy</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            {!conversationResult ? (
              <div className="h-full min-h-[300px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Sparkles className="w-10 h-10 text-purple-300" />
                <h4 className="text-sm font-bold text-slate-700">No strategy generated yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">Select a contact on the left and click "Generate Strategy" to build customized talking points.</p>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-card space-y-5 animate-slideUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Strategy for {conversationResult.contact_name}
                  </h4>
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    AI Suggestion
                  </span>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Conversation Starter</h5>
                  <p className="mt-1 p-3.5 bg-purple-50 text-purple-950 rounded-2xl border border-purple-100 font-medium text-xs leading-relaxed">
                    "{conversationResult.opener}"
                  </p>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High-Signal Discussion Questions</h5>
                  <div className="mt-2 space-y-2">
                    {conversationResult.discussion_questions.map((q: string, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs font-semibold text-slate-800">
                        {i + 1}. {q}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h5 className="text-[10px] font-bold text-emerald-800 uppercase">Suggested Next Step</h5>
                    <p className="text-xs text-emerald-900 mt-1 font-medium">{conversationResult.suggested_follow_up}</p>
                  </div>

                  <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
                    <h5 className="text-[10px] font-bold text-rose-800 uppercase">Topics to Avoid</h5>
                    <ul className="text-xs text-rose-900 mt-1 list-disc list-inside font-medium">
                      {conversationResult.topics_to_avoid.map((t: string, idx: number) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: MESSAGE DRAFTING COMPOSER */}
      {activeTab === 'draft' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Compose Message</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient *</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="">Select recipient...</option>
                {contacts.map((c) => (
                  <option key={c.contact_id} value={c.contact_id}>
                    {c.first_name} {c.last_name} ({c.company || 'Network'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Purpose</label>
              <select
                value={draftPurpose}
                onChange={(e) => setDraftPurpose(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="follow_up">Follow-up Message</option>
                <option value="meeting_request">Meeting Request / Coffee</option>
                <option value="thank_you">Thank-You Note</option>
                <option value="reconnect">Reconnect / Check-in</option>
                <option value="intro">Introduction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['professional', 'warm', 'concise'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraftTone(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      draftTone === t
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Extra Context (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. We met at SF Demo Night, discussed multimodal agents"
                value={draftContext}
                onChange={(e) => setDraftContext(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleGenerateDraft}
              disabled={!selectedContactId || loading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Draft Message</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            {!draftResult ? (
              <div className="h-full min-h-[300px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Mail className="w-10 h-10 text-purple-300" />
                <h4 className="text-sm font-bold text-slate-700">No draft generated</h4>
                <p className="text-xs text-slate-500 max-w-sm">Configure your message criteria and click "Draft Message" to create a personalized note.</p>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-card space-y-4 animate-slideUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Generated Message Draft</h4>
                    <p className="text-xs text-slate-500">Edit freely before sending</p>
                  </div>
                  <button
                    onClick={() => copyText(draftResult.draft)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {draftResult.subject && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                    <input
                      type="text"
                      value={draftResult.subject}
                      onChange={(e) => setDraftResult({ ...draftResult, subject: e.target.value })}
                      className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Body</label>
                  <textarea
                    rows={8}
                    value={draftResult.draft}
                    onChange={(e) => setDraftResult({ ...draftResult, draft: e.target.value })}
                    className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: MEETING SUMMARIZER */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Summarize Meeting Notes</h3>
            <p className="text-xs text-slate-500">Paste unformatted notes to extract structured takeaways & action items</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 Roadmap Review"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Notes / Transcript *</label>
              <textarea
                rows={7}
                placeholder="Paste your quick raw notes here..."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={!rawNotes || loading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Extract Takeaways</span>
            </button>
          </div>

          <div className="lg:col-span-2">
            {!summaryResult ? (
              <div className="h-full min-h-[300px] bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 text-purple-300" />
                <h4 className="text-sm font-bold text-slate-700">No summary extracted</h4>
                <p className="text-xs text-slate-500 max-w-sm">Paste notes on the left and click "Extract Takeaways".</p>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200 shadow-card space-y-5 animate-slideUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Structured Meeting Summary</h4>
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Follow-up: {summaryResult.suggested_follow_up_date}
                  </span>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executive Summary</h5>
                  <p className="text-xs text-slate-700 mt-1 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {summaryResult.summary}
                  </p>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Takeaways</h5>
                  <ul className="mt-1 space-y-1.5 text-xs text-slate-800 font-semibold list-disc list-inside">
                    {summaryResult.key_takeaways.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Items</h5>
                  <div className="mt-2 space-y-2">
                    {summaryResult.action_items.map((act: any, i: number) => (
                      <div key={i} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-950">{act.task}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                          Due in {act.due_days} days
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 4: RELATIONSHIP INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
            <h3 className="text-sm font-bold text-slate-900">Automated Relationship Intelligence & Stale Connection Nudges</h3>
            <p className="text-xs text-slate-500">Continuous health checks on connection touchpoint frequency and goal progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {ins.insight_type}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${ins.urgency === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {ins.urgency} priority
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{ins.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{ins.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('conversation')}
                    className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{ins.suggested_action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

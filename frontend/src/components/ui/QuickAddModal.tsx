import React, { useState } from 'react';
import {
  X,
  UserPlus,
  MessageSquareShare,
  Calendar,
  CheckSquare,
  Target,
  FileText,
  Loader2,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'contact' | 'interaction' | 'meeting' | 'task' | 'goal' | 'note';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'contact',
}) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'interaction' | 'meeting' | 'task' | 'goal' | 'note'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    relationship_type: 'colleague',
    tags: '',
  });

  const [interactionForm, setInteractionForm] = useState({
    contact_id: '',
    interaction_type: 'coffee',
    title: '',
    summary: '',
    outcome: '',
    follow_up_required: false,
    follow_up_date: '',
    sentiment: 'positive',
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    contact_id: '',
    meeting_type: 'video',
    start_at: '',
    end_at: '',
    location: '',
    agenda: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    contact_id: '',
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    goal_type: 'connections',
    target_value: 10,
    unit: 'people',
    end_date: '',
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    contact_id: '',
    is_pinned: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'contact') {
        if (!contactForm.first_name || !contactForm.last_name) {
          throw new Error('Please enter first and last name');
        }
        await api.post('/contacts', {
          ...contactForm,
          tagNames: contactForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
      } else if (activeTab === 'interaction') {
        if (!interactionForm.contact_id || !interactionForm.title) {
          throw new Error('Please enter Contact ID and Title');
        }
        await api.post('/interactions', interactionForm);
      } else if (activeTab === 'meeting') {
        if (!meetingForm.title || !meetingForm.start_at || !meetingForm.end_at) {
          throw new Error('Please provide title, start time, and end time');
        }
        await api.post('/meetings', meetingForm);
      } else if (activeTab === 'task') {
        if (!taskForm.title) throw new Error('Task title is required');
        await api.post('/tasks', taskForm);
      } else if (activeTab === 'goal') {
        if (!goalForm.title) throw new Error('Goal title is required');
        await api.post('/goals', goalForm);
      } else if (activeTab === 'note') {
        if (!noteForm.title || !noteForm.content) throw new Error('Title and content are required');
        await api.post('/notes', noteForm);
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'contact', label: 'Contact', icon: UserPlus },
    { id: 'interaction', label: 'Interaction', icon: MessageSquareShare },
    { id: 'meeting', label: 'Meeting', icon: Calendar },
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'goal', label: 'Goal', icon: Target },
    { id: 'note', label: 'Note', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-slideUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Add Record</h3>
            <p className="text-xs text-slate-500">Capture contacts, interactions, or actions instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 px-5 pt-3 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* CONTACT FORM */}
          {activeTab === 'contact' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya"
                    value={contactForm.first_name}
                    onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={contactForm.last_name}
                    onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Director of AI"
                    value={contactForm.job_title}
                    onChange={(e) => setContactForm({ ...contactForm, job_title: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Type</label>
                  <select
                    value={contactForm.relationship_type}
                    onChange={(e) => setContactForm({ ...contactForm, relationship_type: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="colleague">Colleague</option>
                    <option value="founder">Founder</option>
                    <option value="mentor">Mentor</option>
                    <option value="mentee">Mentee</option>
                    <option value="investor">Investor / VC</option>
                    <option value="client">Client</option>
                    <option value="prospect">Prospect</option>
                    <option value="friend">Friend</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="AI Founder, High Priority, SF Tech"
                  value={contactForm.tags}
                  onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* INTERACTION FORM */}
          {activeTab === 'interaction' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact ID *</label>
                  <input
                    type="number"
                    required
                    placeholder="1"
                    value={interactionForm.contact_id}
                    onChange={(e) => setInteractionForm({ ...interactionForm, contact_id: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={interactionForm.interaction_type}
                    onChange={(e) => setInteractionForm({ ...interactionForm, interaction_type: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="coffee">Coffee Chat</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="message">Direct Message</option>
                    <option value="event">Event / Conference</option>
                    <option value="introduction">Introduction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed AI agent architecture"
                  value={interactionForm.title}
                  onChange={(e) => setInteractionForm({ ...interactionForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Notes</label>
                <textarea
                  rows={2}
                  placeholder="High-signal key takeaways from conversation..."
                  value={interactionForm.summary}
                  onChange={(e) => setInteractionForm({ ...interactionForm, summary: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interactionForm.follow_up_required}
                    onChange={(e) => setInteractionForm({ ...interactionForm, follow_up_required: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Follow-up Required?</span>
                </label>
                {interactionForm.follow_up_required && (
                  <input
                    type="date"
                    value={interactionForm.follow_up_date}
                    onChange={(e) => setInteractionForm({ ...interactionForm, follow_up_date: e.target.value })}
                    className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                )}
              </div>
            </div>
          )}

          {/* MEETING FORM */}
          {activeTab === 'meeting' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Strategy Sync"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.start_at}
                    onChange={(e) => setMeetingForm({ ...meetingForm, start_at: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.end_at}
                    onChange={(e) => setMeetingForm({ ...meetingForm, end_at: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda / Meeting Link</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/... or Blue Bottle SF"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TASK FORM */}
          {activeTab === 'task' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send demo invite to Vikram"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GOAL FORM */}
          {activeTab === 'goal' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connect with 20 AI Founders"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={goalForm.target_value}
                    onChange={(e) => setGoalForm({ ...goalForm, target_value: parseInt(e.target.value, 10) || 1 })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="founders, coffee chats"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTE FORM */}
          {activeTab === 'note' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Key Takeaways from AI Demo"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your note content here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

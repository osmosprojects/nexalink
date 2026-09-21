import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  MessageSquareShare,
  Calendar,
  CheckSquare,
  Target,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    contacts: any[];
    interactions: any[];
    meetings: any[];
    tasks: any[];
    goals: any[];
    notes: any[];
  }>({
    contacts: [],
    interactions: [],
    meetings: [],
    tasks: [],
    goals: [],
    notes: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ contacts: [], interactions: [], meetings: [], tasks: [], goals: [], notes: [] });
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ contacts: [], interactions: [], meetings: [], tasks: [], goals: [], notes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get<any>(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.contacts.length > 0 ||
    results.interactions.length > 0 ||
    results.meetings.length > 0 ||
    results.tasks.length > 0 ||
    results.goals.length > 0 ||
    results.notes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-slideUp flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-brand-600" />
          <input
            type="text"
            autoFocus
            placeholder="Search people, companies, notes, tasks, meetings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5">
          {query.trim().length < 2 && (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-medium">Type at least 2 characters to search across all CRM data</p>
            </div>
          )}

          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-xs font-medium">No records matching "{query}"</p>
            </div>
          )}

          {/* CONTACTS */}
          {results.contacts.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <Users className="w-3.5 h-3.5" />
                <span>Contacts ({results.contacts.length})</span>
              </div>
              <div className="space-y-1">
                {results.contacts.map((c) => (
                  <div
                    key={c.contact_id}
                    onClick={() => {
                      onClose();
                      navigate(`/connections/${c.contact_id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-brand-50/70 cursor-pointer border border-transparent hover:border-brand-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={c.first_name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-brand-700">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {c.job_title ? `${c.job_title} · ` : ''}{c.company || 'Personal Contact'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTIONS */}
          {results.interactions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <MessageSquareShare className="w-3.5 h-3.5" />
                <span>Interactions ({results.interactions.length})</span>
              </div>
              <div className="space-y-1">
                {results.interactions.map((i) => (
                  <div
                    key={i.interaction_id}
                    onClick={() => {
                      onClose();
                      navigate('/interactions');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50/70 cursor-pointer border border-transparent hover:border-purple-100 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-700">{i.title}</p>
                      <p className="text-[11px] text-slate-500">With {i.contact_name} · {i.interaction_type}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {results.tasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks ({results.tasks.length})</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <div
                    key={t.task_id}
                    onClick={() => {
                      onClose();
                      navigate('/tasks');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${t.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES */}
          {results.notes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Notes ({results.notes.length})</span>
              </div>
              <div className="space-y-1">
                {results.notes.map((n) => (
                  <div
                    key={n.note_id}
                    onClick={() => {
                      onClose();
                      navigate('/notes');
                    }}
                    className="p-2.5 rounded-2xl hover:bg-amber-50/70 cursor-pointer border border-transparent hover:border-amber-100 transition-all"
                  >
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

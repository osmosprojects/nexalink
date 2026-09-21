import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Plus,
  Pin,
  Search,
  Trash2,
  Edit3,
  User,
  Check
} from 'lucide-react';
import { api } from '../lib/api';
import { Note } from '../types';
import { formatDate } from '../lib/utils';

export const NotesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', search],
    queryFn: () => api.get<Note[]>(`/notes?search=${encodeURIComponent(search)}`),
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ noteId, isPinned }: { noteId: number; isPinned: boolean }) =>
      api.put(`/notes/${noteId}`, { is_pinned: isPinned ? 0 : 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => api.delete(`/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notes & Relationship Context</h2>
          <p className="text-xs text-slate-500">Capture strategic takeaways, background dossiers, and conversation memos</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => openQuickAdd?.()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No notes found</h3>
          <p className="text-xs text-slate-500">Add meeting debriefs or relationship notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note.note_id}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                note.is_pinned
                  ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                  : 'bg-white border-slate-200/80 shadow-card hover:shadow-soft'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{note.title}</h4>
                  <button
                    onClick={() => togglePinMutation.mutate({ noteId: note.note_id, isPinned: !!note.is_pinned })}
                    className={`p-1 rounded-lg transition-colors ${note.is_pinned ? 'text-amber-600' : 'text-slate-300 hover:text-slate-600'}`}
                    title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap line-clamp-4">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                {note.contact_name ? (
                  <button
                    onClick={() => navigate(`/connections/${note.contact_id}`)}
                    className="font-semibold text-brand-600 hover:underline truncate max-w-[150px]"
                  >
                    @{note.contact_name}
                  </button>
                ) : (
                  <span>General Note</span>
                )}

                <div className="flex items-center gap-2">
                  <span>{formatDate(note.updated_at, 'short')}</span>
                  <button
                    onClick={() => deleteNoteMutation.mutate(note.note_id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

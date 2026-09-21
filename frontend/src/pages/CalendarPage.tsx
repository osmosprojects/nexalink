import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Video,
  CheckSquare,
  Target,
  HeartHandshake
} from 'lucide-react';
import { api } from '../lib/api';
import { Meeting, Task, Goal, Contact } from '../types';
import { formatDate } from '../lib/utils';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'agenda' | 'month'>('agenda');
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => api.get<Meeting[]>('/meetings'),
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get<Task[]>('/tasks'),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => api.get<Goal[]>('/goals'),
  });

  // Aggregate all events
  const allEvents = [
    ...meetings.map((m) => ({
      id: `m-${m.meeting_id}`,
      title: m.title,
      date: m.start_at,
      type: 'meeting',
      category: m.meeting_type,
      contact: m.contact_name,
      contact_id: m.contact_id,
      color: 'bg-brand-100 text-brand-800 border-brand-200',
    })),
    ...tasks.filter((t) => t.due_date).map((t) => ({
      id: `t-${t.task_id}`,
      title: t.title,
      date: t.due_date!,
      type: 'task',
      category: t.priority,
      contact: t.contact_name,
      contact_id: t.contact_id,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    })),
    ...goals.filter((g) => g.end_date).map((g) => ({
      id: `g-${g.goal_id}`,
      title: `Goal Deadline: ${g.title}`,
      date: g.end_date!,
      type: 'goal',
      category: 'target',
      contact: undefined,
      contact_id: undefined,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Networking & Agenda Calendar</h2>
          <p className="text-xs text-slate-500">Aggregated view of meetings, tasks, follow-ups, and goal deadlines</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50 text-xs font-semibold">
            <button
              onClick={() => setView('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${view === 'agenda' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600'}`}
            >
              Agenda View
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${view === 'month' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600'}`}
            >
              Month View
            </button>
          </div>

          <button
            onClick={() => openQuickAdd?.()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* AGENDA VIEW */}
      {view === 'agenda' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" />
            <span>Chronological Agenda</span>
          </h3>

          <div className="space-y-4">
            {allEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-brand-50/40 transition-colors gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${evt.color}`}>
                    {evt.type === 'meeting' ? <CalendarIcon className="w-4 h-4" /> :
                     evt.type === 'task' ? <CheckSquare className="w-4 h-4" /> :
                     <Target className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                    {evt.contact && (
                      <p className="text-[11px] text-slate-500">
                        Linked Contact:{' '}
                        <button
                          onClick={() => navigate(`/connections/${evt.contact_id}`)}
                          className="font-semibold text-brand-600 hover:underline"
                        >
                          {evt.contact}
                        </button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pl-12 sm:pl-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{formatDate(evt.date, 'long')}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ml-2 ${evt.color}`}>
                    {evt.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW */}
      {view === 'month' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="text-center py-10 space-y-2">
            <CalendarIcon className="w-12 h-12 text-brand-600 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-slate-900">Month Grid Loaded</h4>
            <p className="text-xs text-slate-500">You have {allEvents.length} scheduled items in your calendar pipeline.</p>
          </div>
        </div>
      )}
    </div>
  );
};

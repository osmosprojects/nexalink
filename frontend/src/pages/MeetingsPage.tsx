import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';
import { Meeting } from '../types';
import { formatDate } from '../lib/utils';

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => api.get<Meeting[]>('/meetings'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Meetings & Strategy Syncs</h2>
          <p className="text-xs text-slate-500">Upcoming and past scheduled sessions with contacts</p>
        </div>

        <button
          onClick={() => openQuickAdd?.()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Meetings List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No scheduled meetings</h3>
          <p className="text-xs text-slate-500">Schedule your next virtual or in-person sync.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meetings.map((m) => (
            <div
              key={m.meeting_id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    {m.contact_name && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        With{' '}
                        <button
                          onClick={() => navigate(`/connections/${m.contact_id}`)}
                          className="font-bold text-brand-600 hover:underline"
                        >
                          {m.contact_name}
                        </button>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                    {m.meeting_type}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(m.start_at, 'long')}</span>
                  </div>
                  {m.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{m.location}</span>
                    </div>
                  )}
                </div>

                {m.agenda && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-slate-700 block mb-1">Agenda:</span>
                    {m.agenda}
                  </div>
                )}
              </div>

              {m.meeting_url && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={m.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join Meeting Link</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

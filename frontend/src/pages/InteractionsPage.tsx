import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  MessageSquareShare,
  Coffee,
  Calendar,
  Phone,
  Mail,
  Plus,
  Clock,
  Filter,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { Interaction } from '../types';
import { formatDate } from '../lib/utils';

export const InteractionsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: interactions = [], isLoading } = useQuery<Interaction[]>({
    queryKey: ['interactions', typeFilter],
    queryFn: () => api.get<Interaction[]>(`/interactions?type=${typeFilter}&limit=50`),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coffee': return Coffee;
      case 'meeting': return Calendar;
      case 'call': return Phone;
      case 'email': return Mail;
      default: return MessageSquareShare;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Interactions & Touchpoints</h2>
          <p className="text-xs text-slate-500">Every coffee chat, meeting, phone call, and email in chronological order</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-semibold text-slate-700"
          >
            <option value="all">All Interaction Types</option>
            <option value="coffee">Coffee Chats</option>
            <option value="meeting">Meetings</option>
            <option value="call">Phone Calls</option>
            <option value="email">Emails</option>
            <option value="event">Events / Conferences</option>
          </select>

          <button
            onClick={() => openQuickAdd?.()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Interaction</span>
          </button>
        </div>
      </div>

      {/* Interactions Timeline List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : interactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <MessageSquareShare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No interactions recorded</h3>
          <p className="text-xs text-slate-500">Log a coffee chat, meeting, or email to start tracking your relationship timeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interactions.map((inter) => {
            const Icon = getTypeIcon(inter.interaction_type);
            return (
              <div
                key={inter.interaction_id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{inter.title}</h4>
                      <p className="text-xs text-slate-500">
                        With{' '}
                        <button
                          onClick={() => navigate(`/connections/${inter.contact_id}`)}
                          className="font-bold text-brand-600 hover:underline"
                        >
                          {inter.contact_name}
                        </button>{' '}
                        · {inter.duration_minutes} min duration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(inter.interaction_date, 'long')}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {inter.interaction_type}
                    </span>
                  </div>
                </div>

                {inter.summary && (
                  <p className="text-xs text-slate-600 font-normal leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {inter.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  {inter.outcome ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Outcome: {inter.outcome}</span>
                    </div>
                  ) : <div />}

                  {inter.follow_up_required === 1 && inter.follow_up_date && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Follow-up: {formatDate(inter.follow_up_date, 'short')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

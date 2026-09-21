import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  Clock,
  Calendar,
  Sparkles,
  Target,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { Notification } from '../types';
import { formatDate } from '../lib/utils';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications-page'],
    queryFn: () => api.get<{ notifications: Notification[]; unread_count: number }>('/notifications'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const notifications = data?.notifications || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notifications & Follow-up Reminders</h2>
          <p className="text-xs text-slate-500">Stay on top of follow-up commitments and upcoming scheduled syncs</p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-500">You have zero pending notification alerts.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.notification_id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.is_read ? 'bg-white' : 'bg-brand-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'follow_up_due'
                      ? 'bg-amber-100 text-amber-800'
                      : notif.type === 'meeting_reminder'
                      ? 'bg-brand-100 text-brand-800'
                      : notif.type === 'ai_suggestion'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {notif.type === 'follow_up_due' ? <Clock className="w-4 h-4" /> :
                   notif.type === 'meeting_reminder' ? <Calendar className="w-4 h-4" /> :
                   notif.type === 'ai_suggestion' ? <Sparkles className="w-4 h-4" /> :
                   <Target className="w-4 h-4" />}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 font-medium pt-1">{formatDate(notif.created_at, 'relative')}</p>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => markAsReadMutation.mutate(notif.notification_id)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

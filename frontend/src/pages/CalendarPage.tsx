import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Phone,
  Video,
  Mail,
  Coffee,
  MessageSquareShare,
  User,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Edit3,
  AlertCircle,
  Building,
  CheckSquare
} from 'lucide-react';
import { api } from '../lib/api';
import { Interaction, Meeting, Task, Contact } from '../types';
import { formatDate } from '../lib/utils';
import { QuickAddModal } from '../components/ui/QuickAddModal';

interface UnifiedEvent {
  id: string;
  originalId: number;
  sourceType: 'interaction' | 'meeting' | 'task';
  title: string;
  type: string; // 'call' | 'meeting' | 'email' | 'coffee' | 'whatsapp' | 'follow_up' | 'other'
  date: Date;
  dateStr: string;
  timeStr: string;
  status: 'completed' | 'upcoming' | 'pending';
  contact_id?: number | null;
  contact_name?: string;
  contact_company?: string;
  contact_role?: string;
  summary?: string;
  outcome?: string;
  follow_up_date?: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed' | 'calls' | 'meetings' | 'follow_ups'>('all');
  const [selectedContactId, setSelectedContactId] = useState<string>('all');
  
  // Selected Event Modal state
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UnifiedEvent | null>(null);

  // Add Interaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultDate, setAddModalDefaultDate] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  // Fetch Interactions
  const { data: interactions = [] } = useQuery<Interaction[]>({
    queryKey: ['interactions-calendar'],
    queryFn: async () => {
      const res = await api.get<any>('/interactions?limit=100');
      return Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
    },
  });

  // Fetch Meetings
  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['meetings-calendar'],
    queryFn: async () => {
      const res = await api.get<any>('/meetings');
      return Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
    },
  });

  // Fetch Tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks-calendar'],
    queryFn: async () => {
      const res = await api.get<any>('/tasks');
      return Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
    },
  });

  // Fetch Contacts for contact filter dropdown
  const { data: contactsData } = useQuery<any>({
    queryKey: ['contacts-calendar-list'],
    queryFn: () => api.get<any>('/contacts?limit=100'),
  });

  const contactsList: Contact[] = Array.isArray(contactsData?.items)
    ? contactsData.items
    : Array.isArray(contactsData)
    ? contactsData
    : [];

  const contactsMap = useMemo(() => {
    const map = new Map<number, Contact>();
    contactsList.forEach((c) => map.set(c.contact_id, c));
    return map;
  }, [contactsList]);

  // Aggregate and normalize all networking events
  const allEvents: UnifiedEvent[] = useMemo(() => {
    const events: UnifiedEvent[] = [];

    // 1. Process Interactions
    interactions.forEach((i) => {
      const d = new Date(i.interaction_date);
      const isPast = d.getTime() <= Date.now();
      const contactObj = i.contact_id ? contactsMap.get(i.contact_id) : undefined;
      const typeLower = (i.interaction_type || 'other').toLowerCase();

      let colorBg = 'bg-blue-50';
      let colorText = 'text-blue-700';
      let colorBorder = 'border-blue-200';

      if (typeLower.includes('meeting')) {
        colorBg = 'bg-purple-50';
        colorText = 'text-purple-700';
        colorBorder = 'border-purple-200';
      } else if (typeLower.includes('coffee')) {
        colorBg = 'bg-amber-50';
        colorText = 'text-amber-800';
        colorBorder = 'border-amber-200';
      } else if (typeLower.includes('email')) {
        colorBg = 'bg-emerald-50';
        colorText = 'text-emerald-700';
        colorBorder = 'border-emerald-200';
      } else if (typeLower.includes('follow')) {
        colorBg = 'bg-rose-50';
        colorText = 'text-rose-700';
        colorBorder = 'border-rose-200';
      }

      events.push({
        id: `interaction-${i.interaction_id}`,
        originalId: i.interaction_id,
        sourceType: 'interaction',
        title: i.title || 'Networking Interaction',
        type: i.interaction_type || 'call',
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isPast ? 'completed' : 'upcoming',
        contact_id: i.contact_id,
        contact_name: i.contact_name || (contactObj ? `${contactObj.first_name} ${contactObj.last_name}` : 'Networking Person'),
        contact_company: contactObj?.company || '',
        contact_role: contactObj?.job_title || '',
        summary: i.summary || '',
        outcome: i.outcome || '',
        follow_up_date: i.follow_up_date || undefined,
        colorBg,
        colorText,
        colorBorder,
      });
    });

    // 2. Process Meetings
    meetings.forEach((m) => {
      const d = new Date(m.start_at);
      const isPast = d.getTime() <= Date.now();
      const contactObj = m.contact_id ? contactsMap.get(m.contact_id) : undefined;

      events.push({
        id: `meeting-${m.meeting_id}`,
        originalId: m.meeting_id,
        sourceType: 'meeting',
        title: m.title || 'Scheduled Meeting',
        type: 'meeting',
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isPast ? 'completed' : 'upcoming',
        contact_id: m.contact_id,
        contact_name: m.contact_name || (contactObj ? `${contactObj.first_name} ${contactObj.last_name}` : ''),
        contact_company: contactObj?.company || '',
        contact_role: contactObj?.job_title || '',
        summary: m.notes || m.agenda || '',
        outcome: m.outcome || '',
        follow_up_date: m.follow_up_date || undefined,
        colorBg: 'bg-purple-50',
        colorText: 'text-purple-700',
        colorBorder: 'border-purple-200',
      });
    });

    // 3. Process Scheduled Follow-up Tasks
    tasks.filter((t) => t.due_date).forEach((t) => {
      const d = new Date(t.due_date!);
      const isDone = t.status === 'done';
      const contactObj = t.contact_id ? contactsMap.get(t.contact_id) : undefined;

      events.push({
        id: `task-${t.task_id}`,
        originalId: t.task_id,
        sourceType: 'task',
        title: t.title || 'Follow-up Task',
        type: 'follow_up',
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        timeStr: 'All Day',
        status: isDone ? 'completed' : 'upcoming',
        contact_id: t.contact_id,
        contact_name: t.contact_name || (contactObj ? `${contactObj.first_name} ${contactObj.last_name}` : ''),
        contact_company: contactObj?.company || '',
        contact_role: contactObj?.job_title || '',
        summary: t.description || '',
        colorBg: 'bg-rose-50',
        colorText: 'text-rose-700',
        colorBorder: 'border-rose-200',
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [interactions, meetings, tasks, contactsMap]);

  // Apply Filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      // Contact Filter
      if (selectedContactId !== 'all' && String(evt.contact_id) !== selectedContactId) {
        return false;
      }

      // Type / Status Filter
      if (selectedFilter === 'upcoming') return evt.status === 'upcoming';
      if (selectedFilter === 'completed') return evt.status === 'completed';
      if (selectedFilter === 'calls') return evt.type.toLowerCase().includes('call');
      if (selectedFilter === 'meetings') return evt.type.toLowerCase().includes('meeting');
      if (selectedFilter === 'follow_ups') return evt.type.toLowerCase().includes('follow') || evt.type.toLowerCase().includes('task');

      return true;
    });
  }, [allEvents, selectedFilter, selectedContactId]);

  // Calendar Month Matrix Generation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0, Sun = 6
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: UnifiedEvent[];
    }> = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        date: prevDate,
        dateStr,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
        events: filteredEvents.filter((e) => e.dateStr === dateStr),
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().slice(0, 10);
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: currDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: filteredEvents.filter((e) => e.dateStr === dateStr),
      });
    }

    // Next month padding days to reach multiple of 7
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let j = 1; j <= remainingCells; j++) {
      const nextDate = new Date(year, month + 1, j);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        date: nextDate,
        dateStr,
        dayNum: j,
        isCurrentMonth: false,
        isToday: false,
        events: filteredEvents.filter((e) => e.dateStr === dateStr),
      });
    }

    return days;
  }, [currentDate, filteredEvents]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get icon for interaction type
  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('call')) return Phone;
    if (t.includes('meeting')) return Video;
    if (t.includes('email')) return Mail;
    if (t.includes('coffee')) return Coffee;
    if (t.includes('follow') || t.includes('task')) return CheckSquare;
    return MessageSquareShare;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Networking Calendar</h2>
            <p className="text-xs text-slate-500">Visual representation of networking interactions, meetings, and follow-ups</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month / Agenda View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50 text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-brand-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white text-brand-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda List
              </button>
            </div>

            <button
              onClick={() => {
                setAddModalDefaultDate(undefined);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Interaction</span>
            </button>
          </div>
        </div>

        {/* Filters and Month Navigation Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 min-w-[140px] pl-1">
              {monthTitle}
            </h3>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter:</span>
            </span>

            {/* Filter Pills */}
            {[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'calls', label: 'Calls' },
              { id: 'meetings', label: 'Meetings' },
              { id: 'follow_ups', label: 'Follow-ups' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`text-xs px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* Contact Selector Filter */}
            {contactsList.length > 0 && (
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden max-w-[160px] truncate"
              >
                <option value="all">All Contacts</option>
                {contactsList.map((c) => (
                  <option key={c.contact_id} value={c.contact_id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-3">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Days Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/30">
            {monthData.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2.5 bg-white transition-colors flex flex-col justify-between ${
                  !day.isCurrentMonth ? 'bg-slate-50/60 opacity-50' : 'hover:bg-slate-50/50'
                } ${day.isToday ? 'ring-2 ring-inset ring-brand-500/80 bg-brand-50/20' : ''}`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      day.isToday
                        ? 'bg-brand-600 text-white shadow-xs'
                        : day.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {day.isCurrentMonth && (
                    <button
                      onClick={() => {
                        setAddModalDefaultDate(day.dateStr);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Add Interaction on this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day Events Stack */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {day.events.slice(0, 3).map((evt) => {
                    const Icon = getTypeIcon(evt.type);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02] flex items-center justify-between gap-1 ${evt.colorBg} ${evt.colorText} ${evt.colorBorder}`}
                        title={`${evt.type.toUpperCase()}: ${evt.contact_name || evt.title} (${evt.timeStr})`}
                      >
                        <div className="min-w-0 flex items-center gap-1">
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate leading-tight">
                            {evt.contact_name || evt.title}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-white/70 font-extrabold shrink-0 border border-black/5">
                          {evt.type.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}

                  {day.events.length > 3 && (
                    <button
                      onClick={() => setSelectedEvent(day.events[3])}
                      className="w-full text-center text-[10px] font-bold text-brand-600 hover:underline py-0.5"
                    >
                      +{day.events.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" />
            <span>Chronological Networking Agenda ({filteredEvents.length} items)</span>
          </h3>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No networking activity scheduled.</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No interactions match your filter criteria. Log a call, meeting, or coffee chat to update your timeline.
              </p>
              <button
                onClick={() => {
                  setAddModalDefaultDate(undefined);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                + Add Interaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => {
                const Icon = getTypeIcon(evt.type);
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${evt.colorBg} ${evt.colorText} ${evt.colorBorder}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {evt.title}
                          </h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${evt.colorBg} ${evt.colorText} ${evt.colorBorder}`}>
                            {evt.type}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${evt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                            {evt.status === 'completed' ? '✓ Completed' : 'Scheduled'}
                          </span>
                        </div>
                        {evt.contact_name && (
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                            Networking Person: <span className="text-slate-900">{evt.contact_name}</span>
                            {evt.contact_role || evt.contact_company ? ` (${evt.contact_role}${evt.contact_company ? ` · ${evt.contact_company}` : ''})` : ''}
                          </p>
                        )}
                        {evt.summary && (
                          <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-1">
                            {evt.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{formatDate(evt.date.toISOString(), 'long')}</span>
                        <span className="text-slate-400 font-medium">({evt.timeStr})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EVENT DETAIL MODAL (PART 9 Requirement) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 p-6 space-y-5 animate-scaleUp text-slate-900">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${selectedEvent.colorBg} ${selectedEvent.colorText} ${selectedEvent.colorBorder}`}>
                  {React.createElement(getTypeIcon(selectedEvent.type), { className: 'w-6 h-6' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${selectedEvent.colorBg} ${selectedEvent.colorText} ${selectedEvent.colorBorder}`}>
                      {selectedEvent.type}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${selectedEvent.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      {selectedEvent.status === 'completed' ? '✓ Completed' : 'Scheduled'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Person Card */}
            {selectedEvent.contact_name && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Networking Person</span>
                <p className="text-sm font-bold text-slate-900">{selectedEvent.contact_name}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedEvent.contact_role || 'Professional'} {selectedEvent.contact_company ? `· ${selectedEvent.contact_company}` : ''}
                </p>
              </div>
            )}

            {/* Interaction Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date</span>
                <span className="font-bold text-slate-900">{formatDate(selectedEvent.date.toISOString(), 'long')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Time</span>
                <span className="font-bold text-slate-900">{selectedEvent.timeStr}</span>
              </div>
            </div>

            {/* Summary & Notes */}
            {selectedEvent.summary && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Notes & Key Takeaways</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 font-normal leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.summary}
                </p>
              </div>
            )}

            {/* Outcome */}
            {selectedEvent.outcome && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong className="font-bold">Outcome:</strong> {selectedEvent.outcome}</span>
              </div>
            )}

            {/* Action Buttons (PART 9 Requirement) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {selectedEvent.contact_id && (
                <button
                  type="button"
                  onClick={() => {
                    const cid = selectedEvent.contact_id;
                    setSelectedEvent(null);
                    navigate(`/connections/${cid}`);
                  }}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>View Person</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingEvent(selectedEvent);
                  setSelectedEvent(null);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Interaction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Interaction Modal */}
      {isEditModalOpen && editingEvent && (
        <QuickAddModal
          isOpen={isEditModalOpen}
          defaultTab="interaction"
          defaultContactId={editingEvent.contact_id}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['interactions-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['meetings-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['contacts-calendar-list'] });
          }}
        />
      )}

      {/* Add Interaction Modal */}
      {isAddModalOpen && (
        <QuickAddModal
          isOpen={isAddModalOpen}
          defaultTab="interaction"
          onClose={() => {
            setIsAddModalOpen(false);
            setAddModalDefaultDate(undefined);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['interactions-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['meetings-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['contacts-calendar-list'] });
          }}
        />
      )}
    </div>
  );
};

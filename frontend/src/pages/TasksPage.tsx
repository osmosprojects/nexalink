import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  User,
  Trash2,
  Filter
} from 'lucide-react';
import { api } from '../lib/api';
import { Task } from '../types';
import { formatDate } from '../lib/utils';
import confetti from 'canvas-confetti';

export const TasksPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', { statusFilter, priorityFilter }],
    queryFn: () => api.get<Task[]>(`/tasks?status=${statusFilter}&priority=${priorityFilter}`),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      api.patch(`/tasks/${taskId}`, { status: status === 'done' ? 'todo' : 'done' }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (vars.status !== 'done') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Task Management</h2>
          <p className="text-xs text-slate-500">Track and fulfill all action items linked to your connections</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-semibold text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => openQuickAdd?.()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-500">Create a new task to stay organized.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
          {tasks.map((task) => (
            <div
              key={task.task_id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleTaskMutation.mutate({ taskId: task.task_id, status: task.status })}
                  className="text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className={`text-xs sm:text-sm font-bold truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                  )}
                  {task.contact_name && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Linked to{' '}
                      <button
                        onClick={() => navigate(`/connections/${task.contact_id}`)}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {task.contact_name}
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(task.due_date, 'short')}</span>
                </span>
                <span
                  className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                    task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                    task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTaskMutation.mutate(task.task_id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

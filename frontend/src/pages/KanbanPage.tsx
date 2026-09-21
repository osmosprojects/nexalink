import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  KanbanSquare,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  User,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { api } from '../lib/api';
import { Task } from '../types';
import { formatDate } from '../lib/utils';
import confetti from 'canvas-confetti';

export const KanbanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get<Task[]>('/tasks'),
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      api.patch(`/tasks/${taskId}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (variables.status === 'done') {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      }
    },
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-slate-300 bg-slate-100 text-slate-700' },
    { id: 'in_progress', title: 'In Progress', color: 'border-amber-300 bg-amber-100 text-amber-800' },
    { id: 'done', title: 'Done', color: 'border-emerald-300 bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Productivity Kanban Board</h2>
          <p className="text-xs text-slate-500">Track and advance relationship follow-ups, outreach, and tasks</p>
        </div>

        <button
          onClick={() => openQuickAdd?.()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Columns (Horizontally scrollable on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/70 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{colTasks.length}</span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                        <span
                          className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                            task.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {task.description}
                        </p>
                      )}

                      {task.contact_name && (
                        <div
                          onClick={() => navigate(`/connections/${task.contact_id}`)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
                        >
                          <User className="w-3 h-3" />
                          <span>{task.contact_name}</span>
                        </div>
                      )}

                      {/* Footer & Status Changer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(task.due_date, 'short')}</span>
                        </span>

                        {/* Accessible Quick Status Selector */}
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatusMutation.mutate({
                              taskId: task.task_id,
                              status: e.target.value,
                            })
                          }
                          className="text-[10px] font-bold py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

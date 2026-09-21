import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../lib/api';
import { Goal } from '../types';
import { formatDate } from '../lib/utils';
import confetti from 'canvas-confetti';

export const GoalsPage: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressNotes, setProgressNotes] = useState('');
  const [incrementVal, setIncrementVal] = useState(1);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: () => void }>() || {};

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => api.get<Goal[]>('/goals'),
  });

  const progressMutation = useMutation({
    mutationFn: ({ goalId, increment_value, notes }: { goalId: number; increment_value: number; notes: string }) =>
      api.post(`/goals/${goalId}/progress`, { increment_value, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setIsLogOpen(false);
      setProgressNotes('');
    },
  });

  const handleOpenLog = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsLogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Networking Goal Engine</h2>
          <p className="text-xs text-slate-500">Transform your networking intentions into measurable, trackable milestones</p>
        </div>

        <button
          onClick={() => openQuickAdd?.()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Target className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active goals</h3>
          <p className="text-xs text-slate-500">Set a target like "Connect with 20 AI Founders this month" to stay accountable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const isDone = goal.current_value >= goal.target_value;
            return (
              <div
                key={goal.goal_id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-soft transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-600'}`}>
                        {isDone ? <Award className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{goal.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {goal.goal_type}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-black ${isDone ? 'text-emerald-600' : 'text-brand-600'}`}>
                      {goal.progress_percentage}%
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar & Target */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-900">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isDone
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-brand-500 to-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Deadline: {formatDate(goal.end_date, 'short')}
                  </span>
                  <button
                    onClick={() => handleOpenLog(goal)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Milestone</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Progress Modal */}
      {isLogOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100 animate-slideUp space-y-4">
            <h3 className="text-base font-bold text-slate-900">Log Goal Progress</h3>
            <p className="text-xs text-slate-500">"{selectedGoal.title}"</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Increment Count (+ {selectedGoal.unit})
              </label>
              <input
                type="number"
                min="1"
                value={incrementVal}
                onChange={(e) => setIncrementVal(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Milestone Context</label>
              <textarea
                rows={3}
                placeholder="What connection or event contributed to this milestone?"
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsLogOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => progressMutation.mutate({
                  goalId: selectedGoal.goal_id,
                  increment_value: incrementVal,
                  notes: progressNotes,
                })}
                disabled={progressMutation.isPending}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

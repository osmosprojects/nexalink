import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Sparkles,
  UserCheck,
  Compass,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { CanConnectPerson } from '../../types';

interface CanConnectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  targetPersonName: string;
  onSelectPerson: (person: CanConnectPerson) => void;
  onExploreNetwork?: () => void;
}

export const CanConnectDrawer: React.FC<CanConnectDrawerProps> = ({
  isOpen,
  onClose,
  postId,
  targetPersonName,
  onSelectPerson,
  onExploreNetwork,
}) => {
  const [people, setPeople] = useState<CanConnectPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchPaths = async () => {
    if (!postId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await api.get<CanConnectPerson[]>(`/feed/${postId}/can-connect`);
      setPeople(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch introduction paths:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      fetchPaths();
    }
  }, [isOpen, postId]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-end animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-md h-[85vh] md:h-full shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between rounded-t-3xl md:rounded-none animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              People who can help you reach {targetPersonName}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              People in your network who may be able to introduce you.
            </p>
            {!isLoading && !isError && people.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                <Users className="w-3 h-3" />
                {people.length} {people.length === 1 ? 'person can help you connect' : 'people can help you connect'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="my-4 flex-1 overflow-y-auto pr-0.5 space-y-4">
          {isLoading ? (
            <div className="space-y-4 py-2">
              <p className="text-xs font-semibold text-slate-500 animate-pulse flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
                Finding people who can help you reach {targetPersonName}...
              </p>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded-md w-2/3" />
                      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 space-y-3 bg-rose-50/60 rounded-3xl p-6 border border-rose-100 my-auto">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Couldn't load connection paths</h4>
              <p className="text-xs text-slate-500">There was an issue fetching connection paths.</p>
              <button
                type="button"
                onClick={fetchPaths}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-12 space-y-4 bg-slate-50/90 rounded-3xl p-6 border border-slate-200/80 my-auto">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">No direct introduction path found</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  We couldn't find someone in your current network who can help you reach {targetPersonName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onExploreNetwork) onExploreNetwork();
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Network</span>
              </button>
            </div>
          ) : (
            people.map((person) => (
              <div
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-brand-400 hover:shadow-soft bg-white transition-all space-y-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={person.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={person.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-brand-500 transition-all shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                        {person.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {person.role} {person.company ? `at ${person.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPerson(person);
                    }}
                    className="px-3 py-1.5 bg-slate-100 group-hover:bg-brand-600 group-hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    View Profile
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    <Users className="w-3 h-3" />
                    {person.mutualConnectionsCount} mutual connection{person.mutualConnectionsCount === 1 ? '' : 's'}
                  </span>

                  {person.networkingContext && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles className="w-3 h-3" />
                      {person.networkingContext}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

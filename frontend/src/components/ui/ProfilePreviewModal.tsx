import React, { useEffect } from 'react';
import {
  X,
  Users,
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
  UserPlus,
  Building2
} from 'lucide-react';
import { CanConnectPerson } from '../../types';

interface ProfilePreviewModalProps {
  person: CanConnectPerson | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile: (person: CanConnectPerson) => void;
  onConnect: (person: CanConnectPerson) => void;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  person,
  isOpen,
  onClose,
  onViewFullProfile,
  onConnect,
}) => {
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

  if (!isOpen || !person) return null;

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
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Profile Preview
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="my-4 flex-1 overflow-y-auto space-y-5">
          {/* Main Info Header */}
          <div className="flex items-start gap-4">
            <img
              src={person.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={person.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-100 shadow-md shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-snug truncate">
                {person.name}
              </h3>
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{person.role}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{person.company}</span>
              </p>
              {person.location && (
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{person.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Networking Relationship Context Badges */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Connection Context
            </h4>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{person.mutualConnectionsCount} mutual connection{person.mutualConnectionsCount === 1 ? '' : 's'}</span>
              </div>

              {person.networkingContext && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{person.networkingContext}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / Details */}
          {person.bio && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                About & Overview
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                {person.bio}
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onViewFullProfile(person)}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Full Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onConnect(person)}
            className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>✨ Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};

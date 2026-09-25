import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Building,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { Recommendation } from '../../types';
import confetti from 'canvas-confetti';

interface WarmIntroModalProps {
  user: Recommendation | any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WarmIntroModal: React.FC<WarmIntroModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [bridgeContact, setBridgeContact] = useState(
    user?.reason?.match(/connection to ([^(\n]+)/)?.[1]?.trim() || 'Mutual Connection'
  );
  const [customNote, setCustomNote] = useState(
    `Hi ${bridgeContact},\n\nI hope you're having a great week!\n\nI noticed in your network that you have a warm connection with ${user.recommended_name} (${user.recommended_role} at ${user.recommended_company}).\n\nI am currently expanding strategic connections in ${user.industry || 'the tech ecosystem'} and would be very grateful for a warm intro whenever convenient!\n\nBest regards,`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendRequest = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 relative text-slate-900 animate-slideUp overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Warm Intro Facilitator</span>
            </div>
            <h3 className="text-xl font-black">Request Warm Intro</h3>
            <p className="text-xs text-slate-300">
              Ask your mutual bridge contact for an introduction to {user.recommended_name}.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSent ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Intro Request Sent!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                Your warm introduction request has been dispatched to {bridgeContact}. We'll notify you as soon as they respond!
              </p>
            </div>
          ) : (
            <>
              {/* Bridge Target Box */}
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.recommended_name)}&background=3b82f6&color=fff`}
                  alt={user.recommended_name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase tracking-wide">
                    Target Lead
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{user.recommended_name}</h4>
                  <p className="text-xs text-slate-500 truncate">{user.recommended_role} at {user.recommended_company}</p>
                </div>
              </div>

              {/* Message Draft Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Intro Context Note</span>
                  <span className="text-[10px] text-slate-400 font-normal">Editable</span>
                </label>
                <textarea
                  rows={6}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isSending}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending Request...' : 'Send Intro Request'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

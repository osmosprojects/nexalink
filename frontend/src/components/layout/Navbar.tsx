import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Sparkles, User, UserPlus, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenQuickAdd?: () => void;
  onOpenAddPerson?: () => void;
  onOpenAddGoal?: () => void;
  onOpenSearch: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Dashboard',
  subtitle,
  onOpenQuickAdd,
  onOpenAddPerson,
  onOpenAddGoal,
  onOpenSearch,
  unreadCount = 0,
}) => {
  const { user, profile, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-3 flex items-center justify-between transition-all w-full max-w-full">
      {/* Page Title & Mobile Logo */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <div className="lg:hidden shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
          N
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-slate-500 font-medium truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {isProfileComplete ? (
          <>
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 rounded-xl text-xs font-medium transition-colors border border-slate-200/50 group w-auto sm:w-48 lg:w-64"
              title="Search CRM"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              <span className="hidden sm:inline truncate">Search CRM...</span>
              <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-semibold shadow-xs">
                ⌘K
              </kbd>
            </button>



            {/* Header Actions: Add to Network & Add Goal */}
            <button
              onClick={onOpenAddPerson || onOpenQuickAdd}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 sm:px-3.5 rounded-xl shadow-xs hover:shadow-md hover:shadow-blue-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Add New Connection"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Add to Network</span>
            </button>

            <button
              onClick={onOpenAddGoal || onOpenQuickAdd}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 sm:px-3.5 rounded-xl shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Add Goal"
            >
              <Target className="w-4 h-4 shrink-0 text-blue-400" />
              <span className="hidden sm:inline">Add Goal</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              Onboarding Required
            </span>
          </div>
        )}

        {/* User Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="cursor-pointer pl-1 shrink-0"
        >
          <Avatar
            src={user?.avatarUrl || profile?.avatar_url}
            name={user?.displayName}
            className="w-8 h-8 rounded-full ring-2 ring-slate-200/80 hover:ring-brand-500 transition-all cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};

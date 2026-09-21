import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Dashboard',
  subtitle,
  onOpenQuickAdd,
  onOpenSearch,
  unreadCount = 0,
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
          N
        </div>
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Global Search & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 rounded-xl text-xs font-medium transition-colors border border-slate-200/50 group w-36 sm:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          <span className="truncate">Search CRM...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-semibold shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* AI Assistant Quick Nudge */}
        <button
          onClick={() => navigate('/ai')}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 rounded-xl text-xs font-semibold transition-all hover:shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Studio</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Record</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User Avatar */}
        <div 
          onClick={() => navigate('/profile')}
          className="cursor-pointer hover:ring-2 hover:ring-brand-500/40 rounded-full transition-all"
        >
          <img
            src={user?.avatarUrl || profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.displayName || 'Profile'}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
        </div>
      </div>
    </header>
  );
};

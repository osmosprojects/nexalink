import brandMark from '../../assets/login/blue-mark.webp';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  MessageSquareShare,
  Target,
  KanbanSquare,
  Calendar,
  CheckSquare,
  FileText,
  Sparkles,
  Rss,
  Settings,
  UserCheck,
  UserPlus,
  LogOut,
  X,
  Plus,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  onOpenQuickAdd: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd, onClose }) => {
  const { user, profile, isProfileComplete, logout } = useAuth();
  const navigate = useNavigate();

  const networkingNav = [
    { to: '/connections', label: 'My Networks', icon: Users },
    { to: '/calendar', label: 'My Networking Calendar', icon: Calendar },
  ];

  const mainNav = [
    { to: '/feed', label: 'Home / Feed', icon: Rss },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interactions', label: 'Interactions', icon: MessageSquareShare },
    { to: '/goals', label: 'Goals', icon: Target },
  ];

  const productivityNav = [
    { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/notes', label: 'Notes', icon: FileText },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!isProfileComplete && path !== '/profile') {
      e.preventDefault();
      navigate('/profile');
    }
  };

  return (
    <aside
      aria-label="Sidebar"
      className="flex h-dvh w-full flex-col overflow-y-auto bg-slate-900 text-slate-300 border-r border-slate-800 select-none"
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a') &&
            !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          onClose?.();
        }
      }}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <NavLink
          to={isProfileComplete ? '/feed' : '/profile'}
          className="flex min-w-0 items-center gap-3"
        >
          <img src={brandMark} alt="" className="w-9 h-9 rounded-xl shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-white tracking-tight text-lg leading-tight">
              SansNetworks
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">Relationship Intel</p>
          </div>
        </NavLink>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {!isProfileComplete && (
        <div className="p-4 m-3 rounded-2xl bg-brand-950/80 border border-brand-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>Step 1: Setup Profile</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            Complete your profile to unlock all CRM modules.
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-500 h-full w-2/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3 py-2 space-y-4">
        {!isProfileComplete ? (
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-400">Required Setup</p>
            <button
              type="button"
              onClick={() => {
                if (window.location.pathname === '/profile') {
                  window.dispatchEvent(new CustomEvent('trigger-save-profile'));
                } else {
                  navigate('/profile');
                }
                onClose?.();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white shadow-md shadow-brand-600/30 cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Complete Profile Setup</span>
              </div>
              <span className="text-[9px] font-extrabold bg-white/20 text-white px-1.5 py-0.5 rounded">
                Save
              </span>
            </button>

            <div className="p-3.5 mt-4 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Locked Modules</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Dashboard, Contacts, Tasks, Meetings, Goals, and AI Studio will automatically unlock after you save your profile.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Networking Core Section */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-400">Networking</p>
              <button
                type="button"
                onClick={onOpenQuickAdd}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-brand-400" />
                  <span>Add Networking Record</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-500" />
              </button>
              {networkingNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Core CRM */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Core CRM</p>
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Productivity Workspace */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Productivity</p>
              {productivityNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
        <div className="space-y-0.5">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-brand-400" />
              <span>My Profile</span>
            </div>
            {!isProfileComplete && (
              <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                Action Required
              </span>
            )}
          </NavLink>

          <NavLink
            to="/settings"
            onClick={(e) => handleNavClick(e, '/settings')}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive && isProfileComplete
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : !isProfileComplete
                  ? 'text-slate-500 hover:bg-slate-800/40 cursor-not-allowed opacity-60'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
            {!isProfileComplete && <Lock className="w-3 h-3 text-slate-600" />}
          </NavLink>
        </div>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={user?.avatarUrl || profile?.avatar_url}
              name={user?.displayName}
              className="w-8 h-8 rounded-full ring-1 ring-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

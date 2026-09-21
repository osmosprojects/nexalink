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
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  ChevronRight,
  Plus,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd }) => {
  const { user, profile, isProfileComplete, logout } = useAuth();
  const navigate = useNavigate();

  const mainNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/connections', label: 'Connections', icon: Users },
    { to: '/interactions', label: 'Interactions', icon: MessageSquareShare },
    { to: '/goals', label: 'Goals', icon: Target },
  ];

  const productivityNav = [
    { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/notes', label: 'Notes', icon: FileText },
  ];

  const secondaryNav = [
    { to: '/ai', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { to: '/feed', label: 'Feed', icon: Rss },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!isProfileComplete && path !== '/profile') {
      e.preventDefault();
      navigate('/profile');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div 
          onClick={() => navigate(isProfileComplete ? '/dashboard' : '/profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-lg leading-tight flex items-center gap-1.5">
              NexaLink
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">CRM</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">Relationship Intel</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      {isProfileComplete ? (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenQuickAdd}
            className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-medium text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 transition-all hover:shadow-brand-600/30 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>
      ) : (
        <div className="p-4 m-3 rounded-2xl bg-brand-950/80 border border-brand-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>Step 1: Setup Profile</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            Complete your profile and AI persona to unlock all CRM modules.
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-500 h-full w-2/5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {!isProfileComplete ? (
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-400">Required Setup</p>
            <NavLink
              to="/profile"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white shadow-md shadow-brand-600/30"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Profile & Persona Setup</span>
              </div>
              <span className="text-[9px] font-extrabold bg-white/20 text-white px-1.5 py-0.5 rounded">
                Required
              </span>
            </NavLink>

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

            {/* Intelligence & Feed */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Intelligence & Network</p>
              {secondaryNav.map((item) => {
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
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
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
              <span>Profile & Persona</span>
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
            {user?.avatarUrl || profile?.avatar_url ? (
              <img
                src={user?.avatarUrl || profile?.avatar_url || ''}
                alt={user?.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <UserCheck className="w-4 h-4 text-slate-400" />
              </div>
            )}
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

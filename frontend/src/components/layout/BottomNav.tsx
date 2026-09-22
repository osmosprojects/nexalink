import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  CheckSquare,
  Menu,
  X,
  Target,
  KanbanSquare,
  Calendar,
  FileText,
  Sparkles,
  Rss,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  MessageSquareShare,
  Plus,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickAdd }) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const { user, profile, isProfileComplete, logout } = useAuth();
  const navigate = useNavigate();

  const primaryTabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/connections', label: 'People', icon: Users },
    { to: '/profile', label: 'Profile', icon: UserCheck, highlight: !isProfileComplete },
  ];

  const moreItems = [
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/interactions', label: 'Interactions', icon: MessageSquareShare },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/kanban', label: 'Kanban Board', icon: KanbanSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/ai', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { to: '/feed', label: 'Feed', icon: Rss },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!isProfileComplete && path !== '/profile') {
      e.preventDefault();
      navigate('/profile');
    }
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 z-40 flex items-center justify-around shadow-lg">
        {!isProfileComplete ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (window.location.pathname === '/profile') {
                  window.dispatchEvent(new CustomEvent('trigger-save-profile'));
                } else {
                  navigate('/profile');
                }
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-md shadow-brand-600/30 active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Complete Profile Setup</span>
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                      isActive
                        ? 'text-brand-600 font-semibold scale-105'
                        : 'text-slate-500 hover:text-slate-800'
                    }`
                  }
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-0.5" />
                  </div>
                  <span className="text-[10px]">{tab.label}</span>
                </NavLink>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setShowMoreDrawer(true)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                showMoreDrawer ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Menu className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </>
        )}
      </div>

      {/* More Bottom Sheet / Drawer */}
      {showMoreDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setShowMoreDrawer(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {user?.avatarUrl || profile?.avatar_url ? (
                  <img
                    src={user?.avatarUrl || profile?.avatar_url || ''}
                    alt={user?.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
                    <UserCheck className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{user?.displayName || 'User'}</h4>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add In Mobile Drawer */}
            <button
              onClick={() => {
                setShowMoreDrawer(false);
                if (!isProfileComplete) {
                  navigate('/profile');
                  return;
                }
                onOpenQuickAdd();
              }}
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
            >
              {!isProfileComplete ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{!isProfileComplete ? 'Complete Profile Setup First' : 'Create New Record'}</span>
            </button>

            {/* Grid of Navigation Links */}
            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isLocked = !isProfileComplete && item.to !== '/profile';
                return (
                  <button
                    key={item.to}
                    onClick={() => {
                      setShowMoreDrawer(false);
                      if (isLocked) {
                        navigate('/profile');
                      } else {
                        navigate(item.to);
                      }
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-colors ${
                      isLocked
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400 opacity-60'
                        : 'bg-slate-50 hover:bg-brand-50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm border border-slate-100 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold flex items-center justify-between gap-1 truncate">
                        <span>{item.label}</span>
                        {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                        {!isLocked && item.badge && (
                          <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 py-0.2 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                setShowMoreDrawer(false);
                logout();
              }}
              className="w-full py-3 px-4 rounded-xl text-rose-600 font-semibold text-xs bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

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
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickAdd }) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const primaryTabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/connections', label: 'People', icon: Users },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const moreItems = [
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

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 z-40 flex items-center justify-around shadow-lg">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-brand-600 font-semibold scale-105' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            showMoreDrawer ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>

      {/* More Bottom Sheet / Drawer */}
      {showMoreDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setShowMoreDrawer(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.displayName || 'User'}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                />
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
                onOpenQuickAdd();
              }}
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Record</span>
            </button>

            {/* Grid of Navigation Links */}
            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => {
                      setShowMoreDrawer(false);
                      navigate(item.to);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-100 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm border border-slate-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        {item.label}
                        {item.badge && (
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

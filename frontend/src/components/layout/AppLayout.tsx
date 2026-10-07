import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from '../ui/QuickAddModal';
import { AddConnectionModal } from '../ui/AddConnectionModal';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

const routeTitleMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your network and daily priorities' },
  '/discover': { title: 'Discover Network', subtitle: 'Discover founders, mentors, and strategic partners' },
  '/connections': { title: 'Connections CRM', subtitle: 'Manage your contacts, relationship depth, and tags' },
  '/interactions': { title: 'Interaction Logs', subtitle: 'Track meetings, calls, coffee chats, and outcomes' },
  '/goals': { title: 'Goal Engine', subtitle: 'Turn networking ambitions into measurable targets' },
  '/kanban': { title: 'Kanban Board', subtitle: 'Visual workflow management for relationship tasks' },
  '/calendar': { title: 'Networking Calendar', subtitle: 'Timeline of meetings, follow-ups, and goal deadlines' },
  '/tasks': { title: 'Tasks & Follow-ups', subtitle: 'Actionable to-dos linked to your key relationships' },
  '/notes': { title: 'Notes & Context', subtitle: 'Rich contextual insights and discussion memos' },
  '/ai': { title: 'AI Networking Studio', subtitle: 'Prepare conversation starters, draft messages, and summarize meetings' },
  '/feed': { title: 'Network Feed', subtitle: 'Recent activity, milestones, and community updates' },
  '/analytics': { title: 'Analytics & Growth', subtitle: 'Relationship health, network velocity, and engagement metrics' },
  '/notifications': { title: 'Alerts & Reminders', subtitle: 'Timely reminders for follow-ups and meetings' },
  '/profile': { title: 'My Profile', subtitle: 'Complete your identity to unlock all CRM modules' },
  '/settings': { title: 'Settings & Privacy', subtitle: 'System preferences, data export, and security audit logs' },
};

export const AppLayout: React.FC = () => {
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'contact' | 'interaction' | 'meeting' | 'task' | 'goal' | 'note'>('goal');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, profile, persona, isProfileComplete, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get<{ notifications: any[]; unread_count: number }>('/notifications'),
    refetchInterval: 30000,
    enabled: isProfileComplete,
  });

  const path = location.pathname;
  const rawMeta = routeTitleMap[path] || {
    title: path.startsWith('/connections/') ? 'Contact Detail' : 'NexaLink CRM',
    subtitle: 'Relationship intelligence platform',
  };
  const pageMeta = path === '/profile'
    ? {
        title: 'My Profile',
        subtitle: isProfileComplete
          ? 'Manage your networking identity, locations, and connection bridges'
          : 'Complete your identity to unlock all CRM modules',
      }
    : rawMeta;

  // Enforce Mandatory Profile Completion Guard
  if (!isLoading && user && !isProfileComplete && path !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] w-full min-w-0 overflow-hidden">
      {/* Desktop Left Sidebar */}
      <Sidebar
        onOpenQuickAdd={() => {
          if (!isProfileComplete) {
            navigate('/profile');
            return;
          }
          setIsAddPersonOpen(true);
        }}
        onOpenSearch={() => {
          if (!isProfileComplete) {
            navigate('/profile');
            return;
          }
          setIsSearchOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mandatory Onboarding Notice Banner if profile is not completed */}
        {!isProfileComplete && (
          <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 text-white px-4 py-3 sm:px-6 shadow-md shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                    Step 1: Complete Your Profile
                  </h4>
                  <p className="text-[11px] text-brand-100">
                    Fill in your identity details below to unlock all CRM modules.
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-xs">
                <span>Setup In Progress</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <Navbar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onOpenAddPerson={() => {
            if (!isProfileComplete) {
              navigate('/profile');
              return;
            }
            setIsAddPersonOpen(true);
          }}
          onOpenAddGoal={() => {
            if (!isProfileComplete) {
              navigate('/profile');
              return;
            }
            setQuickAddTab('goal');
            setIsQuickAddOpen(true);
          }}
          onOpenQuickAdd={() => {
            if (!isProfileComplete) {
              navigate('/profile');
              return;
            }
            setIsAddPersonOpen(true);
          }}
          onOpenSearch={() => {
            if (!isProfileComplete) {
              navigate('/profile');
              return;
            }
            setIsSearchOpen(true);
          }}
          unreadCount={notifData?.unread_count || 0}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full mx-auto min-w-0 overflow-y-auto">
          <Outlet
            context={{
              openQuickAdd: (tab?: 'contact' | 'interaction' | 'meeting' | 'task' | 'goal' | 'note') => {
                if (!isProfileComplete) {
                  navigate('/profile');
                  return;
                }
                if (tab && tab !== 'contact') {
                  setQuickAddTab(tab);
                  setIsQuickAddOpen(true);
                } else {
                  setIsAddPersonOpen(true);
                }
              },
              openAddPerson: () => {
                if (!isProfileComplete) {
                  navigate('/profile');
                  return;
                }
                setIsAddPersonOpen(true);
              },
              openAddNetworkingRecord: () => {
                if (!isProfileComplete) {
                  navigate('/profile');
                  return;
                }
                setIsAddPersonOpen(true);
              },
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenQuickAdd={() => {
          if (!isProfileComplete) {
            navigate('/profile');
            return;
          }
          setIsAddPersonOpen(true);
        }}
      />

      {/* Add New Connection Modal (Add Person / Add to Network) */}
      {isProfileComplete && (
        <AddConnectionModal
          isOpen={isAddPersonOpen}
          onClose={() => setIsAddPersonOpen(false)}
          onSuccess={() => {
            refetchNotifs();
          }}
        />
      )}

      {/* Global Quick Add Modal (Goal / Interaction / Meeting / etc.) */}
      {isProfileComplete && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          defaultTab={quickAddTab}
          onClose={() => setIsQuickAddOpen(false)}
          onOpenAddPerson={() => {
            setIsQuickAddOpen(false);
            setIsAddPersonOpen(true);
          }}
          onSuccess={() => {
            refetchNotifs();
          }}
        />
      )}

      {/* Global Search Modal */}
      {isProfileComplete && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
};

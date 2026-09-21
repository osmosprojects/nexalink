import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from '../ui/QuickAddModal';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

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
  '/profile': { title: 'User Profile & Persona', subtitle: 'Personal details, skills, and AI networking persona' },
  '/settings': { title: 'Settings & Privacy', subtitle: 'System preferences, data export, and security audit logs' },
};

export const AppLayout: React.FC = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get<{ notifications: any[]; unread_count: number }>('/notifications'),
    refetchInterval: 30000,
  });

  const path = location.pathname;
  const pageMeta = routeTitleMap[path] || {
    title: path.startsWith('/connections/') ? 'Contact Detail' : 'NexaLink CRM',
    subtitle: 'Relationship intelligence platform',
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Left Sidebar */}
      <Sidebar
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-32 lg:pb-8">
        {/* Top Navbar */}
        <Navbar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          unreadCount={notifData?.unread_count || 0}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          <Outlet context={{ openQuickAdd: () => setIsQuickAddOpen(true) }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          refetchNotifs();
        }}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

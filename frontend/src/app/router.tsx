import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { ContactsPage } from '../pages/ContactsPage';
import { ContactDetailPage } from '../pages/ContactDetailPage';
import { InteractionsPage } from '../pages/InteractionsPage';
import { MeetingsPage } from '../pages/MeetingsPage';
import { GoalsPage } from '../pages/GoalsPage';
import { KanbanPage } from '../pages/KanbanPage';
import { CalendarPage } from '../pages/CalendarPage';
import { TasksPage } from '../pages/TasksPage';
import { NotesPage } from '../pages/NotesPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { FeedPage } from '../pages/FeedPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { useAuth } from '../context/AuthContext';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'connections',
        element: <ContactsPage />,
      },
      {
        path: 'connections/:id',
        element: <ContactDetailPage />,
      },
      {
        path: 'interactions',
        element: <InteractionsPage />,
      },
      {
        path: 'meetings',
        element: <MeetingsPage />,
      },
      {
        path: 'goals',
        element: <GoalsPage />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'notes',
        element: <NotesPage />,
      },
      {
        path: 'ai',
        element: <AIAssistantPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

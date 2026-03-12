import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import SocietyDashboard from './pages/SocietyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import SocietiesPage from './pages/SocietiesPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'society') return <Navigate to="/society" />;
  return <Navigate to="/student" />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1A1A2E', color: '#E8E8F0', border: '1px solid rgba(108,99,255,0.3)' }
      }} />
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/society" element={<ProtectedRoute roles={['society']}><SocietyDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/events/create" element={<ProtectedRoute roles={['society','admin']}><CreateEventPage /></ProtectedRoute>} />
        <Route path="/events/:id/edit" element={<ProtectedRoute roles={['society','admin']}><CreateEventPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-registrations" element={<ProtectedRoute roles={['student']}><MyRegistrationsPage /></ProtectedRoute>} />
        <Route path="/societies" element={<ProtectedRoute><SocietiesPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

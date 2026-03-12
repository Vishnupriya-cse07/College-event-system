import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/Student/StudentDashboard';
import SocietyDashboard from '../components/Society/SocietyDashboard';
import AdminDashboard from '../components/Admin/AdminDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <Routes><Route path="*" element={<AdminDashboard />} /></Routes>;
  if (user?.role === 'society') return <Routes><Route path="*" element={<SocietyDashboard />} /></Routes>;
  return <Routes><Route path="*" element={<StudentDashboard />} /></Routes>;
}

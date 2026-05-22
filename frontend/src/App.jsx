import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { LayoutDashboard, BookOpen, Shield, LogOut } from 'lucide-react';

// Page Imports
import Login from './pages/Login';
import Feed from './pages/Feed';
import KnowledgeBase from './pages/KnowledgeBase';
import AdminCommandCenter from './pages/AdminCommandCenter';

// Corporate Layout wrapper with minimal navigation
const DashboardLayout = ({ children, role }) => {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-surface-muted hover:text-black'}`}>
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-surface-muted font-sans">
      <nav className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold tracking-tight text-primary">Nexus</span>
            <div className="flex items-center gap-2">
              <NavLink to="/feed" icon={LayoutDashboard} label="Feed" />
              <NavLink to="/knowledge" icon={BookOpen} label="Knowledge" />
              {['Admin', 'HR'].includes(role) && (
                <NavLink to="/admin" icon={Shield} label="Admin" />
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-black transition-colors p-2 rounded-md hover:bg-surface-muted">
            <LogOut size={16} />
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

// Core Evaluation Loop for Role-Based Access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [session, setSession] = useState({ loading: true, role: null });

  useEffect(() => {
    const evaluateSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .table('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        setSession({ loading: false, role: data?.role || null });
      } else {
        setSession({ loading: false, role: null });
      }
    };

    evaluateSession();
  }, []);

  if (session.loading) {
    return <div className="min-h-screen bg-surface-muted flex items-center justify-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!session.role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(session.role)) return <Navigate to="/feed" replace />;

  return <DashboardLayout role={session.role}>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Tier 1: General Employees */}
        <Route 
          path="/feed" 
          element={
            <ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}>
              <Feed />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/knowledge" 
          element={
            <ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}>
              <KnowledgeBase />
            </ProtectedRoute>
          } 
        />
        
        {/* Tier 2: Management/Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['HR', 'Admin']}>
              <AdminCommandCenter />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
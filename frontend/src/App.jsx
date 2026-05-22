import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { LayoutDashboard, BookOpen, Shield, LogOut, Users } from 'lucide-react';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import KnowledgeBase from './pages/KnowledgeBase';
import AdminCommandCenter from './pages/AdminCommandCenter';
import Directory from './pages/Directory';

const DashboardLayout = ({ children, role }) => {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-surface-muted hover:text-black'}`}>
        <Icon size={16} />{label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-surface-muted font-sans">
      <nav className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold tracking-tight text-primary">Nexus</span>
            <div className="flex items-center gap-2">
              <NavLink to="/feed" icon={LayoutDashboard} label="Feed" />
              <NavLink to="/directory" icon={Users} label="Directory" />
              <NavLink to="/knowledge" icon={BookOpen} label="Knowledge" />
              {['Admin', 'HR'].includes(role) && <NavLink to="/admin" icon={Shield} label="Admin" />}
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-black p-2 rounded-md transition-colors hover:bg-surface-muted">
            <LogOut size={16} />
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [sessionState, setSessionState] = useState({ loading: true, role: null });

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("1. Checking for active session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log("2. No session. Routing to login.");
          if (isMounted) setSessionState({ loading: false, role: null });
          return;
        }

        console.log("3. Session found for:", session.user.email);
        console.log("4. Fetching profile role...");

        const { data, error: profileError } = await supabase
          .table('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("5. DB Error (Likely RLS blocking you):", profileError.message);
          console.log("6. FORCING fallback to Employee role so the app loads.");
          if (isMounted) setSessionState({ loading: false, role: 'Employee' });
        } else {
          console.log("5. Role confirmed:", data.role);
          if (isMounted) setSessionState({ loading: false, role: data.role || 'Employee' });
        }
      } catch (err) {
        console.error("Critical Auth Error:", err);
        if (isMounted) setSessionState({ loading: false, role: 'Employee' }); // Force load on crash
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event Triggered:", event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (sessionState.loading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center text-sm font-medium">
        Connecting to Nexus...
      </div>
    );
  }

  if (!sessionState.role) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(sessionState.role)) return <Navigate to="/feed" replace />;

  return <DashboardLayout role={sessionState.role}>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/feed" element={<ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}><Feed /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}><Directory /></ProtectedRoute>} />
        <Route path="/knowledge" element={<ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}><KnowledgeBase /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['HR', 'Admin']}><AdminCommandCenter /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
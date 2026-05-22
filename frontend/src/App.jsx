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
  const navItems = [
    { to: "/feed", icon: LayoutDashboard, label: "Feed" },
    { to: "/directory", icon: Users, label: "Directory" },
    { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
    ...( ['Admin', 'HR'].includes(role) ? [{ to: "/admin", icon: Shield, label: "Admin" }] : [])
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 bg-white p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10 text-black font-bold text-xl">
            <div className="bg-black text-white p-1.5 rounded-lg"><Command size={20} /></div>
            Orbit
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === item.to ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={() => { supabase.auth.signOut(); window.location.href = '/auth'; }} className="flex items-center gap-3 text-gray-500 hover:text-red-600 px-3 py-2 text-sm font-medium">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
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
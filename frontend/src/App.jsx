import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import KnowledgeBase from './pages/KnowledgeBase';
import AdminCommandCenter from './pages/AdminCommandCenter';
import Directory from './pages/Directory';

// --- HELPERS FROM UI MOCKUP ---
export function Avatar({ name = "User", size = 40 }) {
  const colors = ["#3B7DD8","#7C3AED","#E11D48","#D97706","#059669","#0891B2","#EA580C","#EC4899"];
  const char = name.charAt(0).toUpperCase();
  const color = colors[char.charCodeAt(0) % colors.length] || colors[0];
  
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0 }}>
      {char}
    </div>
  );
}

const NotifBell = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
        🔔
        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#080810]" />
      </button>
      {open && (
        <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50">
          <div className="px-4 py-3 text-sm font-bold text-slate-400 border-b border-white/5 mb-2">Notifications</div>
          <div className="px-4 py-3 text-sm text-slate-300 bg-indigo-500/10 rounded-xl">
            Welcome to the new Pulse Intranet!
          </div>
        </div>
      )}
    </div>
  );
};

// --- NEW SIDEBAR LAYOUT ---
const DashboardLayout = ({ children, session }) => {
  const location = useLocation();
  const { role, profile } = session;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const navItems = [
    { to: "/feed", label: "Feed", icon: "◈" },
    { to: "/directory", label: "Directory", icon: "◉" },
    { to: "/knowledge", label: "Knowledge Hub", icon: "◫" },
    ...( ['Admin', 'HR'].includes(role) ? [{ to: "/admin", label: "Command Center", icon: "⬡" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#080810] font-sans flex text-slate-50">
      
      {/* Sidebar */}
      <aside className="w-[220px] fixed left-0 top-0 h-screen bg-[#0f0f14] border-r border-white/5 flex flex-col z-50">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/20">⚡</div>
          <span className="text-xl font-extrabold tracking-tight text-white">Pulse</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-400 transition-colors">
            <span className="text-lg opacity-60">⎋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="text-lg font-bold text-white capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</div>
          <div className="flex items-center gap-4">
            <NotifBell />
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl py-1.5 px-3">
              <Avatar name={profile?.full_name || 'User'} size={28} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">{profile?.full_name?.split(' ')[0] || 'Employee'}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- AUTHENTICATION GATEWAY ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [sessionState, setSessionState] = useState({ loading: true, role: null, profile: null });

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) setSessionState({ loading: false, role: null, profile: null });
          return;
        }

        // Fetch full profile to get name & dept for UI
        const { data, error } = await supabase
          .table('profiles')
          .select('role, full_name, department_id')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (isMounted) setSessionState({ loading: false, role: data.role || 'Employee', profile: data });
      } catch (err) {
        console.error(err);
        if (isMounted) setSessionState({ loading: false, role: 'Employee', profile: { full_name: 'Unknown' } });
      }
    };

    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAuth());
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  if (sessionState.loading) return <div className="min-h-screen bg-[#080810] flex items-center justify-center text-indigo-400 font-bold tracking-widest animate-pulse">PULSE_OS BOOTING...</div>;
  if (!sessionState.role) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(sessionState.role)) return <Navigate to="/feed" replace />;

  return <DashboardLayout session={sessionState}>{children}</DashboardLayout>;
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
 import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Avatar } from '../App';
import { Loader2, Users, MessageSquare, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [data, setData] = useState({ stats: null, leadership: null, events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/init');
        setData(res);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="font-sans text-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Good morning, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-slate-400 mt-1">Here is what is happening at Pulse today.</p>
      </div>

      {/* Leadership Vision */}
      {data.leadership && (
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-indigo-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-[40px]" />
          <div className="text-[11px] font-bold tracking-[0.1em] text-indigo-400 mb-4 uppercase">Leadership Vision · {data.leadership.month_year}</div>
          <blockquote className="text-lg text-indigo-100 italic leading-relaxed max-w-3xl mb-6">
            "{data.leadership.quote}"
          </blockquote>
          <div className="flex items-center gap-4">
            <Avatar name={data.leadership.profiles?.full_name} size={36} />
            <div>
              <div className="text-sm font-bold text-white">{data.leadership.profiles?.full_name}</div>
              <div className="text-xs text-indigo-400">{data.leadership.profiles?.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Employees", val: data.stats?.users || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Platform Posts", val: data.stats?.posts || 0, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Upcoming Events", val: data.events?.length || 0, icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Recognitions", val: "Live", icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-extrabold text-white">{s.val}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/feed" className="block w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl p-4 transition-colors font-medium text-sm">Create an Organization Update</Link>
            <Link to="/recognition" className="block w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl p-4 transition-colors font-medium text-sm">Send Peer Appreciation</Link>
          </div>
        </div>

        {/* Upcoming Events Mini-View */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Upcoming Schedule</h2>
          <div className="space-y-4">
            {data.events.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex flex-col items-center justify-center shrink-0">
                  <div className="text-xs text-slate-400 font-bold uppercase">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-lg font-extrabold" style={{ color: ev.color }}>{new Date(ev.date).getDate()}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{ev.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{ev.time} · {ev.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
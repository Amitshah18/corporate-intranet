import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Users, BookOpen, Shield, Zap, Globe, MessageSquare, CheckCircle2, Activity } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: MessageSquare, title: 'Dynamic Feed', desc: 'Real-time corporate announcements and business updates.', span: 'md:col-span-2' },
    { icon: Users, title: 'Global Directory', desc: 'Discover colleagues and break inter-departmental silos.', span: 'md:col-span-1' },
    { icon: BookOpen, title: 'Knowledge Base', desc: 'Centralized access to policies, handbooks, and documents.', span: 'md:col-span-1' },
    { icon: Shield, title: 'Admin Controls', desc: 'Role-based access, moderation queues, and user provisioning.', span: 'md:col-span-2' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity size={20} className="text-white" />
            </div>
            Pulse
          </div>
          <Link to="/auth" className="text-sm font-medium px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-40 pb-24 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <Zap size={14} className="text-indigo-400" /> Pulse Intranet v2.0 is live
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          The heartbeat of your organization.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Unify communications, celebrate wins, and align your entire workforce with a stunning, high-performance internal platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth" className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10">
            Access Workspace <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">Scale your culture.</h2>
          <p className="text-slate-400 text-lg">Built for speed, security, and engagement.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {features.map((feature, idx) => (
            <div key={idx} className={`p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group ${feature.span}`}>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                <feature.icon size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
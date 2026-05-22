import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Users, BookOpen, Shield, Zap, Globe, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: MessageSquare, title: 'Dynamic Feed', desc: 'Real-time corporate announcements and business updates.' },
    { icon: Users, title: 'Global Directory', desc: 'Discover colleagues and break inter-departmental silos.' },
    { icon: BookOpen, title: 'Knowledge Base', desc: 'Centralized access to policies, handbooks, and documents.' },
    { icon: Shield, title: 'Admin Controls', desc: 'Role-based access, moderation queues, and user provisioning.' },
    { icon: LayoutDashboard, title: 'Minimalist UI', desc: 'Clutter-free aesthetics designed for maximum focus.' },
    { icon: Zap, title: 'High Performance', desc: 'Built on React, Vite, and Python for blazing fast concurrency.' },
  ];

  return (
    <div className="min-h-screen bg-surface text-primary font-sans selection:bg-black selection:text-white">
      
      {/* 1. Navigation */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            Nexus
          </div>
          <Link to="/auth" className="text-sm font-medium hover:text-gray-600 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-border text-xs font-medium mb-8">
          <Zap size={14} className="text-yellow-500" /> Nexus OS v2.0 is now live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
          The operating system for your organization.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Unify communications, celebrate wins, and align your entire workforce with a seamless, clutter-free internal platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/auth" className="bg-black text-white px-8 py-3.5 rounded-lg font-medium hover:bg-gray-900 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
            Start Workspace <ArrowRight size={18} />
          </Link>
          <a href="#features" className="px-8 py-3.5 rounded-lg font-medium border border-border hover:bg-surface-muted transition-all">
            Explore Features
          </a>
        </div>
      </section>

      {/* 3. Social Proof / Logos */}
      <section className="border-y border-border bg-surface-muted py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-widest">Powering modern teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            {/* Placeholder for corporate logos */}
            <h3 className="text-xl font-bold">Acme Corp</h3>
            <h3 className="text-xl font-bold">Globex</h3>
            <h3 className="text-xl font-bold">Soylent</h3>
            <h3 className="text-xl font-bold">Initech</h3>
            <h3 className="text-xl font-bold">Umbrella</h3>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to scale culture.</h2>
          <p className="text-gray-500">Built for speed, security, and engagement.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border bg-surface hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center mb-4 border border-border">
                <feature.icon size={20} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Highlight Section (Side by side) */}
      <section className="bg-surface-muted py-32 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Designed to break silos.</h2>
            <ul className="space-y-4">
              {[
                'Multi-tenancy isolation for department specific views.',
                'Peer-to-peer recognition to boost morale.',
                'Centralized management vision and milestone tracking.'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-black" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full lg:w-1/2 bg-surface rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden">
            {/* Abstract UI representation */}
            <div className="space-y-4 opacity-50">
              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
              <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to align your team?</h2>
        <p className="text-gray-500 mb-8">Deploy Nexus OS today and watch your organizational engagement metrics soar.</p>
        <Link to="/auth" className="bg-black text-white px-8 py-3.5 rounded-lg font-medium hover:bg-gray-900 transition-all shadow-md inline-block">
          Create Corporate Account
        </Link>
      </section>

    </div>
  );
}
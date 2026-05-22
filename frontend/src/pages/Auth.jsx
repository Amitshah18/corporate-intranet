import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { Loader2, Mail, Lock, User, AlertCircle, Activity, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
      } else {
        await api.post('/users/provision', {
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: 'Employee'
        });
        
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (loginError) throw loginError;
      }
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-50 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 p-16 flex-col justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Pulse</span>
        </div>

        <div className="max-w-lg">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Connect. <br/>Collaborate. <br/>Cultivate.
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed">
            The next-generation intranet designed to break silos and foster an engaged, high-velocity corporate culture.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
          <ShieldCheck size={18} className="text-indigo-400" />
          <span>SSO & Enterprise Grade Security</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-[440px] bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
              {isLogin ? 'Welcome back' : 'Join the network'}
            </h1>
            <p className="text-slate-400">
              {isLogin ? 'Enter your corporate credentials to continue.' : 'Set up your enterprise profile.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm backdrop-blur-md">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="font-medium leading-tight">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-white placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-white placeholder:text-slate-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center mt-4 shadow-lg shadow-indigo-500/25"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }} 
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
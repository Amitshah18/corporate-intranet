import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // The ProtectedRoute in App.jsx will automatically evaluate the session 
      // and role, then route the user appropriately.
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4 selection:bg-black selection:text-white font-sans text-sm">
      <div className="w-full max-w-[360px] bg-surface p-8 rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20M12 2v20"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Sign in to Nexus</h1>
          <p className="text-gray-500 mt-1">Enter your corporate credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md border border-red-100">
              <AlertCircle size={16} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-transparent border border-border rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-transparent border border-border rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
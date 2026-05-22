import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Avatar } from '../App';
import { Loader2, Award, Send } from 'lucide-react';

export default function Recognition({ currentUser }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ receiver_id: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boardRes, dirRes] = await Promise.all([
        api.get('/leaderboard'),
        api.get('/users/directory')
      ]);
      setLeaderboard(boardRes || []);
      
      const directoryUsers = dirRes || [];
      setUsers(directoryUsers);
      
      // Auto-select first available user that isn't the current user
      if (directoryUsers.length > 0) {
        const firstValidUser = directoryUsers.find(u => u.id !== currentUser?.id);
        if (firstValidUser) setFormData(f => ({ ...f, receiver_id: firstValidUser.id }));
      }
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.receiver_id || !formData.message.trim()) return;
    setIsSubmitting(true);
    
    try {
      await api.post('/recognition', {
        sender_id: currentUser?.id,
        receiver_id: formData.receiver_id,
        message: formData.message
      });
      
      setSuccess(true);
      setFormData(f => ({ ...f, message: '' }));
      setTimeout(() => setSuccess(false), 4000);
      
      await fetchData(); 
    } catch (error) {
      console.error("Failed to send appreciation:", error);
      alert("Error processing recognition. Check backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto font-sans text-slate-50">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Award className="text-amber-400" size={24} /> 
          </div>
          Recognition & Celebration
        </h1>
        <p className="text-slate-400 mt-2">Celebrate wins, appreciate peers, and build culture.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Send Appreciation Form */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8 h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
          
          <h2 className="text-xl font-bold text-white mb-6">Send Peer Appreciation 💌</h2>
          
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm font-bold flex items-center shadow-lg animate-in fade-in slide-in-from-top-2">
              🎉 Appreciation sent! +10 Points awarded to their profile.
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nominate a Colleague</label>
              <select 
                value={formData.receiver_id} 
                onChange={e => setFormData({...formData, receiver_id: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Select a colleague...
                </option>
                
                {/* Fallback if you are the only user in the database */}
                {users.filter(u => u.id !== currentUser?.id).length === 0 && (
                  <option value="" disabled className="bg-slate-900 text-rose-400">
                    No other colleagues found in Directory.
                  </option>
                )}

                {/* Map the actual users with dark backgrounds */}
                {users.filter(u => u.id !== currentUser?.id).map(u => {
                  const deptName = u.departments?.name || 'Global';
                  return (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white font-medium py-2">
                      {u.full_name} — {deptName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Message</label>
              <textarea 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Describe what they did that deserves recognition..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-amber-500 transition-colors min-h-[140px] resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-white rounded-xl py-4 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Award 10 Points</>}
            </button>
          </form>
        </div>

        {/* Gamification Leaderboard */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Engagement Leaderboard</h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Top 10</span>
          </div>

          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No points awarded yet. Be the first to recognize a peer!</p>
            ) : leaderboard.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${i === 0 ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] scale-[1.01]' : 'bg-slate-900/50 border-white/5 hover:bg-white/5'}`}>
                <div className="w-8 text-center text-2xl drop-shadow-md">
                  {['🥇','🥈','🥉'][i] || <span className="text-sm font-bold text-slate-500 bg-white/5 w-8 h-8 flex items-center justify-center rounded-full border border-white/10">{i + 1}</span>}
                </div>
                
                <Avatar name={u.full_name} size={42} />
                
                <div className="flex-1">
                  <div className={`text-base font-bold ${i === 0 ? 'text-amber-400' : 'text-white'}`}>{u.full_name}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{u.role}</div>
                </div>
                
                <div className="text-right bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                  <div className={`text-xl font-extrabold ${i === 0 ? 'text-amber-400' : 'text-indigo-400'}`}>{u.points || 0}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">PTS</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
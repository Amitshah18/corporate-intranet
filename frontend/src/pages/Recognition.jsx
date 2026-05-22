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
      setUsers(dirRes || []);
      if (dirRes && dirRes.length > 0) {
        setFormData(f => ({ ...f, receiver_id: dirRes[0].id }));
      }
    } catch (error) {
      console.error(error);
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
      setFormData({ receiver_id: users[0]?.id || '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
      fetchData(); // Refresh leaderboard
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto font-sans text-slate-50">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Award className="text-amber-400" size={32} /> Recognition & Celebration
        </h1>
        <p className="text-slate-400 mt-1">Celebrate wins, appreciate peers, and build culture.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Send Appreciation Form */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Send Peer Appreciation 💌</h2>
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-between">
              Appreciation sent! +10 Points awarded.
            </div>
          )}
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nominate a Colleague</label>
              <select 
                value={formData.receiver_id} 
                onChange={e => setFormData({...formData, receiver_id: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
              >
                {users.filter(u => u.id !== currentUser?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} — {u.departments?.name || 'Global'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Message</label>
              <textarea 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Describe what they did that deserves recognition..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 min-h-[120px] resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 text-white rounded-xl py-3 font-bold text-sm shadow-lg flex justify-center items-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send Appreciation</>}
            </button>
          </form>
        </div>

        {/* Gamification Leaderboard */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-6">Engagement Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${i === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/50 border-white/5'}`}>
                <div className="w-6 text-center text-xl">{['🥇','🥈','🥉'][i] || <span className="text-sm font-bold text-slate-500">{i + 1}</span>}</div>
                <Avatar name={u.full_name} size={36} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{u.full_name}</div>
                  <div className="text-xs text-slate-400">{u.role}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-extrabold ${i === 0 ? 'text-amber-400' : 'text-indigo-400'}`}>{u.points}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Loader2, CheckCircle2, XCircle, UserPlus } from 'lucide-react';

export default function AdminCommandCenter() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await api.get('/admin/pending');
      setPendingPosts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const moderatePost = async (id, action) => {
    setPendingPosts(current => current.filter(post => post.id !== id));
    try {
      await api.patch(`/admin/moderate/${id}`, { action });
    } catch (error) {
      console.error(error);
      fetchPending();
    }
  };

  const ProvisionUserForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'Employee', department_id: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await api.post('/users/provision', formData);
        alert('User provisioned successfully');
        setFormData({ email: '', password: '', full_name: '', role: 'Employee', department_id: '' });
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <UserPlus size={20} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Provision New Identity</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="bg-slate-900 border border-white/10 p-3.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" required />
          <input type="email" placeholder="Corporate Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-slate-900 border border-white/10 p-3.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" required />
          <input type="password" placeholder="Temporary Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-slate-900 border border-white/10 p-3.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" required />
          
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-slate-900 border border-white/10 p-3.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500 appearance-none">
            <option value="Employee">Employee</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>
          
          <input type="text" placeholder="Department UUID (Optional)" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} className="md:col-span-2 bg-slate-900 border border-white/10 p-3.5 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500" />
          
          <button type="submit" disabled={isSubmitting} className="md:col-span-2 bg-white text-slate-950 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex justify-center items-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Deploy Account'}
          </button>
        </form>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans text-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center">
          <ShieldAlert size={24} className="text-rose-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h1>
          <p className="text-slate-400 mt-1">Platform moderation and access control.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Moderation Queue ({pendingPosts.length})</h2>
        {pendingPosts.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-slate-400 font-medium">
            Queue is clear. No pending posts.
          </div>
        ) : (
          pendingPosts.map(post => (
            <div key={post.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-white/10 rounded-md text-xs font-bold text-slate-300">
                    {post.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">{post.content}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => moderatePost(post.id, 'reject')} className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition-colors">
                  <XCircle size={20} />
                </button>
                <button onClick={() => moderatePost(post.id, 'approve')} className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors">
                  <CheckCircle2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ProvisionUserForm />
    </div>
  );
}
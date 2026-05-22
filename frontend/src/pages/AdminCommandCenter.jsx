import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Check, X, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminCommandCenter() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await api.get('/admin/pending');
      setPendingPosts(data);
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await api.post('/users/provision', formData);
        alert('User provisioned successfully');
        setFormData({ email: '', password: '', full_name: '', role: 'Employee', department_id: '' });
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm mt-8">
        <h2 className="text-lg font-semibold mb-4">Provision New Employee</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border border-border p-2 rounded text-sm" required />
          <input type="email" placeholder="Corporate Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border border-border p-2 rounded text-sm" required />
          <input type="password" placeholder="Temporary Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="border border-border p-2 rounded text-sm" required />
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="border border-border p-2 rounded text-sm bg-transparent">
            <option value="Employee">Employee</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>
          <input type="text" placeholder="Department UUID (Optional)" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} className="border border-border p-2 rounded text-sm" />
          <button type="submit" className="col-span-2 bg-black text-white py-2 rounded font-medium text-sm">Create Account</button>
        </form>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert size={24} className="text-black" />
        <h1 className="text-2xl font-semibold text-primary tracking-tight">Moderation Queue</h1>
      </div>
      {/* ... (Keep existing pendingPosts mapping unchanged) */}
      <ProvisionUserForm />
    </div>
  );
}
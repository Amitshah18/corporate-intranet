import { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminCommandCenter() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingPosts(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderatePost = async (id, action) => {
    // Optimistic UI update
    setPendingPosts(current => current.filter(post => post.id !== id));
    
    try {
      await fetch(`http://localhost:5000/api/admin/moderate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (error) {
      console.error('Moderation error:', error);
      fetchPending(); // Revert on failure
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert size={24} className="text-black" />
        <h1 className="text-2xl font-semibold text-primary tracking-tight">Moderation Queue</h1>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-gray-500 text-sm shadow-sm">
          No pending posts require review.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="bg-surface border border-border rounded-lg p-5 flex items-start justify-between shadow-sm">
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-500">
                  <span className="bg-surface-muted px-2 py-0.5 rounded border border-border">{post.type}</span>
                  <span>Dept: {post.profiles?.department_id}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => moderatePost(post.id, 'reject')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Reject & Delete"
                >
                  <X size={18} />
                </button>
                <button 
                  onClick={() => moderatePost(post.id, 'approve')}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Approve & Publish"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Avatar } from '../App';
import { Loader2, Send } from 'lucide-react';

const timeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

function Badge({ type }) {
  const styles = {
    Announcement: { bg: "#fef2f210", color: "#fca5a5", border: "#fca5a530" },
    Recognition: { bg: "#fffbeb10", color: "#fcd34d", border: "#fcd34d30" },
    Update: { bg: "#eff6ff10", color: "#93c5fd", border: "#93c5fd30" },
    Celebration: { bg: "#fdf4ff10", color: "#d8b4fe", border: "#d8b4fe30" },
  };
  const s = styles[type] || styles.Update;
  return (
    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {type}
    </span>
  );
}

// CRITICAL FIX: We accept currentUser directly from App.jsx so we don't have to fetch it again.
export default function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('Update');
  const [filter, setFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const data = await api.get('/feed');
      setPosts(data || []);
    } catch (error) {
      console.error("Backend fetch failed:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handlePost = async () => {
    // If the user profile hasn't loaded yet from App.jsx, don't allow posting
    if (!content.trim() || !currentUser) return;
    setIsSubmitting(true);
    setSuccessMsg('');
    
    try {
      // Send real data to the Flask backend
      await api.post('/feed', { 
        author_id: currentUser.id, 
        content, 
        type,
        role: currentUser.role // Flask uses this to determine if it goes to moderation
      });
      
      setContent('');

      // UX FIX: If they are an Employee, tell them it went to moderation!
      if (currentUser.role === 'Employee') {
        setSuccessMsg('Post submitted to Command Center for review.');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        // If Admin/HR, it bypassed moderation, so refresh the feed instantly
        await fetchFeed(); 
      }

    } catch (error) {
      console.error("Failed to post:", error);
      alert("Failed to submit post. Ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.type === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 space-y-4">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      <span className="text-slate-400 font-medium tracking-widest text-sm uppercase">Syncing Feed...</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto font-sans">
      
      {/* Composer Module */}
      <div className="bg-[#0f172a] border border-indigo-500/30 rounded-[18px] p-5 mb-8 relative overflow-hidden shadow-2xl shadow-indigo-500/5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="flex gap-4 items-start">
          <Avatar name={currentUser?.full_name || 'User'} size={40} />
          <div className="flex-1">
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Share a milestone, update, or recognize a peer..." 
              className="w-full bg-transparent border-none outline-none resize-none text-slate-200 text-[15px] min-h-[70px] placeholder:text-slate-600"
            />
            
            {successMsg && (
              <div className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20 mb-2">
                ✅ {successMsg}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 text-xs outline-none cursor-pointer hover:border-indigo-500/50 transition-colors"
              >
                <option value="Update">Update</option>
                <option value="Announcement">Announcement</option>
                <option value="Recognition">Recognition</option>
              </select>
              <button 
                onClick={handlePost} 
                disabled={isSubmitting || !content.trim()} 
                className="bg-gradient-to-br from-indigo-500 to-purple-600 disabled:from-[#1e293b] disabled:to-[#1e293b] disabled:text-slate-500 text-white border-none rounded-lg px-6 py-2 text-[13px] font-bold cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center min-w-[80px]"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} className="mr-1.5"/> Post</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Announcement", "Recognition", "Update"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-xs transition-all ${filter === f ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center p-12 text-slate-500 border border-white/5 rounded-[18px] border-dashed">
            No posts found in this category.
          </div>
        ) : filteredPosts.map(post => {
          const authorName = post.profiles?.full_name || 'Employee';
          const dept = post.profiles?.department_id || 'Global';
          
          return (
            <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-[18px] p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={authorName} size={42} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-slate-200">{authorName}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs font-medium text-slate-400">{dept}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs font-medium text-slate-500">{timeAgo(post.created_at)}</span>
                  </div>
                  <div className="mt-2"><Badge type={post.type} /></div>
                </div>
              </div>
              <p className="text-[15px] text-slate-300 leading-[1.7] whitespace-pre-wrap m-0 pl-14">
                {post.content}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
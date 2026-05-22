import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

// --- MOCK DATA FALLBACK ---
const FALLBACK_POSTS = [
  {
    id: "mock1",
    content: "🎉 We're thrilled to announce that Pulse Intranet v2.0 is officially live across all verticals! This platform is your new home for connection, visibility, and collaboration.",
    type: "Announcement",
    created_at: new Date(Date.now() - 3600000).toISOString(), 
    profiles: { full_name: "Arjun Mehta", department_id: "Engineering", role: "Admin" }
  },
  {
    id: "mock2",
    content: "Q2 OKR check-in: Engineering shipped 3 major features this quarter. Massive kudos to the entire team! 🚀 We're at 92% OKR attainment across the org.",
    type: "Update",
    created_at: new Date(Date.now() - 86400000).toISOString(), 
    profiles: { full_name: "Priya Sharma", department_id: "People & Culture", role: "HR" }
  },
  {
    id: "mock3",
    content: "Huge shoutout to the design team for redesigning the entire onboarding flow in record time. The new design reduced drop-off by 34% and the feedback from new joiners has been incredible. 🌟",
    type: "Recognition",
    created_at: new Date(Date.now() - 172800000).toISOString(), 
    profiles: { full_name: "Rohan Kapoor", department_id: "Product", role: "Employee" }
  }
];

// --- HELPER COMPONENTS ---
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

// Local Avatar component to prevent import issues
function Avatar({ name = "User", size = 40 }) {
  const colors = ["#3B7DD8","#7C3AED","#E11D48","#D97706","#059669","#0891B2","#EA580C","#EC4899"];
  const char = name.charAt(0).toUpperCase();
  const color = colors[char.charCodeAt(0) % colors.length] || colors[0];
  
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0 }}>
      {char}
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('Update');
  const [filter, setFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Default fallback data
          let profileData = { full_name: 'User', role: 'Employee', department_id: 'Global' };
          
          try {
            const { data } = await supabase.table('profiles').select('full_name, role, department_id').eq('id', user.id).single();
            if (data) profileData = data;
          } catch (e) {
            console.warn("Profile fetch issue, using defaults:", e);
          }

          if (isMounted) {
            setCurrentUser({ 
              id: user.id, 
              name: profileData.full_name,
              role: profileData.role,
              dept: profileData.department_id
            });
          }
        }
      } catch (e) {
        console.error("Auth fetch error:", e);
      }
      
      await fetchFeed();
    };
    init();
    
    return () => { isMounted = false; };
  }, []);
  const fetchFeed = async () => {
    setLoading(true);
    try {
      // Create a timeout so it doesn't spin forever if the backend is sleeping
      const fetchPromise = api.get('/feed');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
      
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (data && data.length > 0) {
        setPosts(data);
        setIsUsingFallback(false);
      } else {
        setPosts(FALLBACK_POSTS);
        setIsUsingFallback(true);
      }
    } catch (error) {
      console.warn("Backend fetch failed/timed out, injecting mock data:", error);
      setPosts(FALLBACK_POSTS);
      setIsUsingFallback(true);
    } finally {
      // CRITICAL: This guarantees the spinner stops no matter what happens
      setLoading(false); 
    }
  };

  const handlePost = async () => {
    if (!content.trim() || !currentUser) return;
    setIsSubmitting(true);
    
    try {
      // Optimistic UI update (feels instant to the user)
      const optimisticPost = {
        id: `temp-${Date.now()}`,
        content,
        type,
        created_at: new Date().toISOString(),
        profiles: { 
          full_name: currentUser.name, 
          department_id: currentUser.dept, 
          role: currentUser.role 
        }
      };
      
      setPosts(current => [optimisticPost, ...current]);
      setContent('');

      // Attempt to send to backend if we are connected
      if (!isUsingFallback) {
        await api.post('/feed', { author_id: currentUser.id, content, type, role: currentUser.role });
        setTimeout(async () => {
          await fetchFeed(); 
        }, 500); // Refresh to get the real DB ID
      }
    } catch (error) {
      console.error("Failed to post:", error);
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
      
      {isUsingFallback && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold flex items-center justify-center text-center">
          ⚠️ Disconnected from Backend Server. Displaying mock data for UI testing.
        </div>
      )}

      {/* Composer Module */}
      <div className="bg-[#0f172a] border border-indigo-500/30 rounded-[18px] p-5 mb-8 relative overflow-hidden shadow-2xl shadow-indigo-500/5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="flex gap-4 items-start">
          <Avatar name={currentUser?.name || 'User'} size={40} />
          <div className="flex-1">
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Share a milestone, update, or recognize a peer..." 
              className="w-full bg-transparent border-none outline-none resize-none text-slate-200 text-[15px] min-h-[70px] placeholder:text-slate-600"
            />
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
                className="bg-gradient-to-br from-indigo-500 to-purple-600 disabled:from-[#1e293b] disabled:to-[#1e293b] disabled:text-slate-500 text-white border-none rounded-lg px-6 py-2 text-[13px] font-bold cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Post'}
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
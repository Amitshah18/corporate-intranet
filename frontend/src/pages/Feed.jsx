import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { MessageSquare, Award, Megaphone, Loader2, Send } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('Update');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await api.get('/feed');
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      await api.post('/feed', {
        author_id: user.id,
        content: newPostContent,
        type: postType
      });
      setNewPostContent('');
      await fetchFeed();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Announcement': return { icon: <Megaphone size={14} />, classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'Recognition': return { icon: <Award size={14} />, classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default: return { icon: <MessageSquare size={14} />, classes: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 font-sans text-slate-50 min-h-screen">
      
      {/* Composer */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share a milestone, update, or recognize a peer..."
            className="w-full bg-transparent resize-none outline-none text-lg placeholder:text-slate-600 min-h-[100px] text-white"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <select 
              value={postType} 
              onChange={(e) => setPostType(e.target.value)}
              className="text-sm bg-slate-900 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 text-slate-300"
            >
              <option value="Update">Business Update</option>
              <option value="Recognition">Peer Recognition</option>
              <option value="Announcement">Announcement</option>
            </select>
            <button 
              type="submit"
              disabled={isSubmitting || !newPostContent.trim()}
              className="bg-white text-slate-950 px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Post</>}
            </button>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6">
        {posts.map((post) => {
          const style = getTypeStyle(post.type);
          return (
            <article key={post.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-inner">
                    <span className="text-lg font-bold text-slate-300">
                      {post.profiles?.role?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">Dept: {post.profiles?.department_id || 'Global'}</div>
                    <div className="text-xs text-slate-500 font-medium">{new Date(post.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide ${style.classes}`}>
                  {style.icon}
                  {post.type}
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                {post.content}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MessageSquare, Award, Megaphone, Loader2 } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('Update');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feed');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Feed fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      author_id: user.id,
      content: newPostContent,
      type: postType
    };

    try {
      await fetch('http://localhost:5000/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setNewPostContent('');
      fetchFeed(); // Refresh feed
    } catch (error) {
      console.error('Post creation error:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Announcement': return <Megaphone size={16} className="text-black" />;
      case 'Recognition': return <Award size={16} className="text-black" />;
      default: return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div className="max-w-2xl mx-auto py-8 font-sans">
      
      {/* Composer */}
      <div className="bg-surface border border-border rounded-lg p-4 mb-8 shadow-sm">
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share an update, milestone, or recognize a peer..."
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-gray-400 min-h-[80px]"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <select 
              value={postType} 
              onChange={(e) => setPostType(e.target.value)}
              className="text-sm bg-surface-muted border border-border rounded px-2 py-1 outline-none focus:border-black"
            >
              <option value="Update">Business Update</option>
              <option value="Recognition">Peer Recognition</option>
              <option value="Announcement">Announcement</option>
            </select>
            <button 
              type="submit"
              className="bg-black text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="bg-surface border border-border rounded-lg p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {post.profiles?.role?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">Department ID: {post.profiles?.department_id || 'Global'}</div>
                  <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-xs font-medium">
                {getTypeIcon(post.type)}
                {post.type}
              </div>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Image as ImageIcon, X, Grid, Plus, UploadCloud } from 'lucide-react';

export default function Gallery({ currentUser }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Admin Upload State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', emoji: '📸', department: 'All' });
  const [selectedFiles, setSelectedFiles] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const data = await api.get('/gallery');
      setAlbums(data || []);
    } catch (error) {
      console.error("Gallery fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setIsSubmitting(true);
    
    try {
      await api.post('/gallery', {
        ...formData,
        photo_count: selectedFiles > 0 ? selectedFiles : 1 // Fallback to 1 if they don't select a file
      });
      
      setShowModal(false);
      setFormData({ title: '', emoji: '📸', department: 'All' });
      setSelectedFiles(0);
      await fetchGallery();
    } catch (error) {
      console.error("Failed to create memory:", error);
      alert("Failed to upload memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-pink-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto font-sans text-slate-50 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <ImageIcon size={24} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Media Gallery</h1>
            <p className="text-slate-400 mt-1">Office events, celebrations, and team memories.</p>
          </div>
        </div>

        {/* Only Admins can upload new memories */}
        {currentUser?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Create Memory
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.length === 0 ? (
          <div className="col-span-3 text-center p-16 border border-white/10 rounded-3xl text-slate-500 bg-white/5 backdrop-blur-sm">
            No media albums available yet.
          </div>
        ) : albums.map(album => (
          <div 
            key={album.id} 
            onClick={() => setSelectedAlbum(album)}
            className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-xl border border-white/10"
          >
            <div className="absolute inset-0 bg-slate-800 transition-transform duration-500 group-hover:scale-110" 
                 style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} 
                 className={`absolute inset-0 bg-gradient-to-br ${album.color} transition-transform duration-500 group-hover:scale-110 opacity-40`} />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/60 to-transparent flex flex-col items-center justify-center">
              <div className="text-5xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-2xl">{album.emoji}</div>
              <h3 className="text-xl font-extrabold text-white text-center px-4 mb-2">{album.title}</h3>
              <p className="text-xs font-bold text-slate-300/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                {album.photo_count} photos · {album.department}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-extrabold text-white mb-6">Create New Memory</h2>
            
            <form onSubmit={handleCreateMemory} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Album Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-pink-500 transition-colors"
                  placeholder="e.g., Q2 Bangalore Offsite"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Emoji</label>
                  <input 
                    type="text" 
                    required
                    value={formData.emoji}
                    onChange={e => setFormData({...formData, emoji: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-pink-500 transition-colors text-center text-2xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer h-full"
                  >
                    <option value="All">All Company</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Photos</label>
                <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 hover:bg-white/5 hover:border-pink-500/50 transition-colors text-center cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={e => setSelectedFiles(e.target.files.length)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
                  <span className="text-sm font-bold text-slate-300">
                    {selectedFiles > 0 ? `${selectedFiles} files selected` : 'Click to browse files'}
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.title}
                className="w-full mt-2 bg-gradient-to-br from-pink-500 to-rose-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Publish Memory Album'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Album Viewer Modal (From previous step) */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAlbum(null)} />
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-4xl h-[80vh] relative z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <span className="text-4xl drop-shadow-md">{selectedAlbum.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedAlbum.title}</h2>
                  <p className="text-sm text-slate-400">{selectedAlbum.photo_count} photos in this album</p>
                </div>
              </div>
              <button onClick={() => setSelectedAlbum(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: selectedAlbum.photo_count || 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-600 hover:bg-white/10 hover:text-slate-400 transition-colors cursor-pointer group">
                    <Grid size={24} className="mb-2 opacity-50 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">IMG_{i + 1001}.jpg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
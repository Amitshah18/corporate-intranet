import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.get('/gallery');
        setAlbums(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto font-sans text-slate-50">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20">
          <ImageIcon size={24} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Media Gallery</h1>
          <p className="text-slate-400 mt-1">Office events, celebrations, and team memories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.length === 0 ? (
          <div className="col-span-3 text-center p-10 border border-white/10 rounded-2xl text-slate-500">No media albums available.</div>
        ) : albums.map(album => (
          <div key={album.id} className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group shadow-xl">
            {/* Generative Gradient Background mimicking image covers */}
            <div className="absolute inset-0 bg-slate-800 transition-transform duration-500 group-hover:scale-110" 
                 style={{ background: `linear-gradient(135deg, ${album.color}, #0f172a)` }} />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/40 to-transparent flex flex-col items-center justify-center">
              <div className="text-5xl mb-4 group-hover:-translate-y-2 transition-transform duration-300">{album.emoji}</div>
              <h3 className="text-xl font-extrabold text-white text-center px-4 mb-2">{album.title}</h3>
              <p className="text-xs font-semibold text-slate-300/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                {album.photo_count} photos · {album.department}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
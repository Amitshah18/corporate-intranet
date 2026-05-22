import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Avatar } from '../App';
import { FileText, Download, BookOpen, Loader2, MessageCircle } from 'lucide-react';

export default function KnowledgeBase() {
  const [data, setData] = useState({ documents: [], forums: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('documents');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/knowledge');
        setData(res || { documents: [], forums: [] });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="font-sans text-slate-50">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
          <BookOpen size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Knowledge Hub</h1>
          <p className="text-slate-400 mt-1">Policies, resources, and team discussions in one place.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
        <button onClick={() => setTab('documents')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'documents' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>📄 Documents</button>
        <button onClick={() => setTab('forums')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'forums' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>💬 Discussion Forums</button>
      </div>

      {tab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.documents.map(doc => (
            <div key={doc.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <FileText size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{doc.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{doc.category} · {doc.size || '1.2 MB'}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                  <Download size={18} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'forums' && (
        <div className="space-y-4">
          {data.forums.length === 0 ? (
            <div className="text-center p-10 border border-white/10 rounded-2xl text-slate-500">No active discussions.</div>
          ) : data.forums.map(thread => (
            <div key={thread.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors cursor-pointer flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{thread.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <span className="bg-white/10 px-2 py-1 rounded text-slate-300">{thread.category}</span>
                  <span>Started by {thread.profiles?.full_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1.5"><MessageCircle size={16} /> {thread.replies}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Download, BookOpen, Loader2, MessageCircle, X } from 'lucide-react';

export default function KnowledgeBase() {
  const [data, setData] = useState({ documents: [], forums: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('documents');
  const [toast, setToast] = useState('');
  const [activeThread, setActiveThread] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/knowledge');
        setData(res || { documents: [], forums: [] });
      } catch (error) {
        console.error("Knowledge fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDownload = (title) => {
    setToast(`Downloading: ${title}...`);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="font-sans text-slate-50 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-in slide-in-from-top-5">
          ✅ {toast}
        </div>
      )}

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
        <button onClick={() => setTab('documents')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'documents' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>📄 Documents</button>
        <button onClick={() => setTab('forums')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'forums' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>💬 Discussion Forums</button>
      </div>

      {tab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.documents.length === 0 && <p className="text-slate-500 p-8">No documents available.</p>}
          {data.documents.map(doc => (
            <div key={doc.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-indigo-500/30 transition-all overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <FileText size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{doc.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">{doc.category} · {doc.size || 'PDF'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(doc.title)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-500 hover:text-white text-slate-400 transition-colors border border-white/5"
                >
                  <Download size={18} />
                </button>
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
            <div 
              key={thread.id} 
              onClick={() => setActiveThread(thread)}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{thread.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded">{thread.category}</span>
                  <span>Started by <strong className="text-slate-300">{thread.profiles?.full_name}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10 group-hover:bg-white/10">
                <MessageCircle size={18} className="text-indigo-400" /> 
                <span className="font-bold">{thread.replies} Replies</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forum Thread View Modal */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveThread(null)} />
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl relative z-10 shadow-2xl">
            <button onClick={() => setActiveThread(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X size={24} />
            </button>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase mb-4 inline-block">{activeThread.category}</span>
            <h2 className="text-2xl font-extrabold text-white mb-2">{activeThread.title}</h2>
            <p className="text-slate-400 text-sm mb-8">Started by {activeThread.profiles?.full_name}</p>
            
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-slate-300 text-center text-sm">
              <MessageCircle size={32} className="mx-auto mb-3 text-slate-500 opacity-50" />
              Thread viewer simulated for assessment.<br/> 
              There are {activeThread.replies} replies in this discussion.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
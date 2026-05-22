import { FileText, Download, BookOpen, ChevronRight } from 'lucide-react';

const MOCK_DOCS = [
  { id: 1, title: 'Employee Handbook 2026', category: 'Policy', color: 'from-blue-500 to-cyan-500' },
  { id: 2, title: 'Q2 Engineering Roadmaps', category: 'Engineering', color: 'from-purple-500 to-pink-500' },
  { id: 3, title: 'Travel & Expense Guidelines', category: 'Finance', color: 'from-emerald-500 to-teal-500' },
  { id: 4, title: 'Brand Design Assets', category: 'Marketing', color: 'from-orange-500 to-red-500' },
];

export default function KnowledgeBase() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-sans text-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
          <BookOpen size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Knowledge Hub</h1>
          <p className="text-slate-400 mt-1">Centralized intelligence and resources.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_DOCS.map(doc => (
          <div key={doc.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden">
            {/* Subtle background glow based on category color */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${doc.color} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} p-[1px]`}>
                  <div className="w-full h-full bg-slate-950/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{doc.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{doc.category}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                <Download size={18} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
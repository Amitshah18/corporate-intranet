import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Loader2, Mail, Building2 } from 'lucide-react';

export default function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const data = await api.get('/users/directory');
        setEmployees(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const filtered = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (emp.departments?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 font-sans text-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Organization Directory</h1>
          <p className="text-slate-400 text-lg">Discover and connect with colleagues across Pulse.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search name or department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 text-white placeholder:text-slate-600 transition-all backdrop-blur-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
          <div key={emp.id} className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-white group-hover:scale-105 transition-transform">
                {emp.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{emp.full_name}</h3>
                <span className="inline-block px-2.5 py-1 bg-white/5 rounded-md text-xs font-semibold text-indigo-300 mt-1">
                  {emp.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Building2 size={16} />
                <span>{emp.departments?.name || 'Unassigned Department'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={16} />
                <span>Contact via Pulse</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
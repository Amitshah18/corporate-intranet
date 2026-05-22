import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Loader2 } from 'lucide-react';

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
    emp.departments?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Organization Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Discover and connect with colleagues</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search name or department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-md outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-surface border border-border rounded-lg p-5 flex items-center gap-4 hover:border-black transition-colors cursor-pointer shadow-sm">
            <div className="w-12 h-12 rounded-full bg-surface-muted border border-border flex items-center justify-center text-lg font-medium text-gray-600">
              {emp.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">{emp.full_name}</h3>
              <p className="text-xs text-gray-500">{emp.role} • {emp.departments?.name || 'Unassigned'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
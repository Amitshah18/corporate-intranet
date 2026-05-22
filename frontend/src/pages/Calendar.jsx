import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Calendar as CalIcon, Plus, X, Clock, MapPin, Users } from 'lucide-react';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Meeting'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await api.get('/events');
      setEvents(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/events', formData);
      setShowModal(false);
      setFormData({ title: '', date: '', time: '', type: 'Meeting' }); // Reset form
      await fetchEvents(); // Refresh data
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group events by Month for a cleaner "Agenda" view
  const groupEventsByMonth = (eventList) => {
    const grouped = {};
    eventList.forEach(ev => {
      const date = new Date(ev.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(ev);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByMonth(events);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto font-sans text-slate-50 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CalIcon size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Engagement Calendar</h1>
            <p className="text-slate-400 mt-1">Organization-wide events, milestones, and town halls.</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      {/* Agenda View Layout */}
      {events.length === 0 ? (
        <div className="text-center p-16 border border-white/10 rounded-3xl text-slate-500 bg-white/5 backdrop-blur-sm">
          No upcoming events scheduled. Click "Add Event" to create one.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xl font-extrabold text-slate-300 mb-6 border-b border-white/10 pb-2">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthEvents.map(ev => (
                  <div key={ev.id} className="group bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                    {/* Decorative Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: ev.color }} />
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg bg-slate-900 border" style={{ borderColor: `${ev.color}40` }}>
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ev.color }}>{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-extrabold text-white">{new Date(ev.date).getDate()}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: ev.color }}>{ev.type}</span>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{ev.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                          <Clock size={14} className="text-slate-500" /> {ev.time}
                        </p>
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                          <Users size={14} className="text-slate-500" /> All Company
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Glassmorphic Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-extrabold text-white mb-6">Schedule Event</h2>
            
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                  placeholder="e.g., Q3 Town Hall"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time</label>
                  <input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Town Hall">Town Hall</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Social">Social</option>
                  <option value="Deadline">Deadline</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
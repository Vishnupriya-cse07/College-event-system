import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../Shared/Navbar';
import { eventsAPI, aiAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444', draft: '#6b7280', cancelled: '#ef4444' };
const CATEGORIES = ['technology', 'music', 'sports', 'arts', 'science', 'business', 'coding', 'dance', 'drama', 'debate', 'gaming', 'photography', 'environment', 'health', 'other'];

export default function SocietyDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '', category: 'technology',
    date: '', time: '', duration: 60,
    venue: { name: '', building: '', room: '', capacity: 100 },
    maxParticipants: 100, tags: '', registrationDeadline: '',
    prizes: [], requirements: '', agenda: '',
  });

  useEffect(() => {
    eventsAPI.getMyEvents()
      .then(res => setEvents(res.data.events))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('venue.')) {
      setForm(f => ({ ...f, venue: { ...f.venue, [name.split('.')[1]]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const generateDescription = async () => {
    if (!form.title || !form.category) { toast.error('Add title and category first'); return; }
    setAiGenerating(true);
    try {
      const res = await aiAPI.generateDescription({ title: form.title, category: form.category, keyPoints: form.shortDescription });
      setForm(f => ({ ...f, description: res.data.description }));
      toast.success('AI description generated! 🤖');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [],
      };
      if (editEvent) {
        await eventsAPI.update(editEvent._id, payload);
        toast.success('Event updated!');
      } else {
        await eventsAPI.create(payload);
        toast.success('Event submitted for approval!');
      }
      const res = await eventsAPI.getMyEvents();
      setEvents(res.data.events);
      setShowForm(false);
      setEditEvent(null);
      setForm({ title: '', description: '', shortDescription: '', category: 'technology', date: '', time: '', duration: 60, venue: { name: '', building: '', room: '', capacity: 100 }, maxParticipants: 100, tags: '', registrationDeadline: '', prizes: [], requirements: '', agenda: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    totalParticipants: events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0),
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
              🏛️ Society Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your events and registrations</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditEvent(null); }}>
            + Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 40 }}>
          {[
            { label: 'Total Events', value: stats.total, icon: '🎭', color: '#7c3aed' },
            { label: 'Live Events', value: stats.approved, icon: '✅', color: '#10b981' },
            { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#f59e0b' },
            { label: 'Total Registrations', value: stats.totalParticipants, icon: '👥', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Events List */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>My Events</h2>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> :
            events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 20, border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎭</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: 8 }}>No events yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create your first event to get started</p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Event</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(event => (
                  <div key={event._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{event.title}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[event.status]}22`, color: STATUS_COLORS[event.status] }}>
                          {event.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        📅 {event.date && format(new Date(event.date), 'MMM dd, yyyy')} · 
                        👥 {event.currentParticipants}/{event.maxParticipants} registered
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditEvent(event); setForm({ ...event, tags: event.tags?.join(', '), requirements: event.requirements?.join('\n') || '' }); setShowForm(true); }}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#13131f', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#13131f', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20 }}>
                {editEvent ? '✏️ Edit Event' : '🎭 Create New Event'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditEvent(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Event Title *</label>
                <input name="title" className="form-input" placeholder="e.g. Annual Tech Hackathon 2024" value={form.title} onChange={handleChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange} required>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Participants</label>
                  <input name="maxParticipants" type="number" className="form-input" value={form.maxParticipants} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Short Description (for cards)</label>
                <input name="shortDescription" className="form-input" placeholder="One-liner summary..." value={form.shortDescription} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>Full Description *</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={generateDescription} disabled={aiGenerating}>
                    {aiGenerating ? '⟳ Generating...' : '🤖 AI Generate'}
                  </button>
                </div>
                <textarea name="description" className="form-input" placeholder="Detailed event description..." value={form.description} onChange={handleChange} rows={5} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date *</label>
                  <input name="date" type="date" className="form-input" value={form.date?.split('T')[0] || ''} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Time *</label>
                  <input name="time" className="form-input" placeholder="e.g. 10:00 AM" value={form.time} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration (min)</label>
                  <input name="duration" type="number" className="form-input" value={form.duration} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Venue Name *</label>
                  <input name="venue.name" className="form-input" placeholder="e.g. Main Auditorium" value={form.venue?.name || ''} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Room/Hall</label>
                  <input name="venue.room" className="form-input" placeholder="e.g. Hall B" value={form.venue?.room || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tags (comma separated)</label>
                <input name="tags" className="form-input" placeholder="e.g. hackathon, prizes, networking" value={form.tags} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Requirements (one per line)</label>
                <textarea name="requirements" className="form-input" placeholder="e.g. Laptop required&#10;Team of 2-4 members" value={form.requirements} onChange={handleChange} rows={3} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Registration Deadline</label>
                <input name="registrationDeadline" type="date" className="form-input" value={form.registrationDeadline?.split('T')[0] || ''} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: 14 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: 14 }}>
                  {editEvent ? '💾 Update Event' : '🚀 Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

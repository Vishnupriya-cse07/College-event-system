import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['technical','cultural','sports','academic','workshop','hackathon','seminar','other'];

export default function CreateEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    title:'', description:'', shortDescription:'', category:'technical',
    date:'', time:'', venue:'', isOnline:false, onlineLink:'',
    maxParticipants:100, registrationDeadline:'', tags:'',
    requirements:'', status:'published'
  });
  const [prizes, setPrizes] = useState([{ position:'1st Place', reward:'' }]);
  const [speakers, setSpeakers] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (isEdit) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      const e = data.event;
      setForm({
        title:e.title, description:e.description, shortDescription:e.shortDescription||'',
        category:e.category, date:e.date?.split('T')[0]||'', time:e.time,
        venue:e.venue, isOnline:e.isOnline, onlineLink:e.onlineLink||'',
        maxParticipants:e.maxParticipants, registrationDeadline:e.registrationDeadline?.split('T')[0]||'',
        tags:e.tags?.join(', ')||'', requirements:e.requirements?.join('\n')||'', status:e.status
      });
      if (e.prizes) setPrizes(e.prizes);
      if (e.speakers) setSpeakers(e.speakers);
      if (e.schedule) setSchedule(e.schedule);
    } catch (err) { navigate('/society'); }
  };

  const generateDescription = async () => {
    if (!form.title || !form.category) { toast.error('Enter title and category first'); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-description', {
        title: form.title, category: form.category, details: form.shortDescription
      });
      setForm(prev => ({...prev, description: data.description}));
      toast.success('🤖 AI description generated!');
    } catch (err) { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        prizes, speakers, schedule,
        maxParticipants: parseInt(form.maxParticipants)
      };
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
        toast.success('Event updated!');
      } else {
        await api.post('/events', payload);
        toast.success('Event created!');
      }
      navigate('/society');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save event'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding:'24px',maxWidth:'900px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>
        {isEdit ? '✏️ Edit Event' : '➕ Create New Event'}
      </h1>
      <p style={{ color:'#9999BB',marginBottom:'28px' }}>Fill in the details to {isEdit?'update':'publish'} your event</p>

      <form onSubmit={handleSubmit}>
        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>📝 Basic Information</h3>
          <div className="form-group">
            <label>Event Title *</label>
            <input placeholder="e.g., National Level Hackathon 2024" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Short Description (shown on cards)</label>
            <input placeholder="Brief one-liner about the event" value={form.shortDescription} onChange={e=>setForm({...form,shortDescription:e.target.value})} />
          </div>
          <div className="form-group">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px' }}>
              <label style={{ margin:0 }}>Full Description *</label>
              <button type="button" onClick={generateDescription} disabled={aiLoading} style={{ padding:'4px 12px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',color:'#6C63FF',cursor:'pointer',fontSize:'0.78rem',fontWeight:600 }}>
                {aiLoading?'⏳ Generating...':'🤖 Generate with AI'}
              </button>
            </div>
            <textarea rows={6} placeholder="Detailed description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
          </div>
        </div>

        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>📅 Date, Time & Venue</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px' }}>
            <div className="form-group">
              <label>Event Date *</label>
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Registration Deadline</label>
              <input type="date" value={form.registrationDeadline} onChange={e=>setForm({...form,registrationDeadline:e.target.value})} />
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
            <div className="form-group">
              <label>Venue *</label>
              <input placeholder="e.g., Main Auditorium" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input type="number" value={form.maxParticipants} onChange={e=>setForm({...form,maxParticipants:e.target.value})} min={1} />
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px' }}>
            <input type="checkbox" id="isOnline" checked={form.isOnline} onChange={e=>setForm({...form,isOnline:e.target.checked})} style={{ width:'auto' }} />
            <label htmlFor="isOnline" style={{ margin:0,cursor:'pointer' }}>Online Event</label>
          </div>
          {form.isOnline && (
            <div className="form-group">
              <label>Online Link</label>
              <input placeholder="https://meet.google.com/..." value={form.onlineLink} onChange={e=>setForm({...form,onlineLink:e.target.value})} />
            </div>
          )}
        </div>

        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>🏷️ Tags & Requirements</h3>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input placeholder="react, javascript, web development" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
          </div>
          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea rows={3} placeholder="Laptop required&#10;Basic programming knowledge" value={form.requirements} onChange={e=>setForm({...form,requirements:e.target.value})} />
          </div>
        </div>

        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'24px' }}>
          <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>🏆 Prizes</h3>
          {prizes.map((prize, i) => (
            <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 2fr auto',gap:'10px',marginBottom:'10px',alignItems:'center' }}>
              <input placeholder="Position" value={prize.position} onChange={e=>setPrizes(prizes.map((p,j)=>j===i?{...p,position:e.target.value}:p))} />
              <input placeholder="Reward (e.g. ₹10,000 + Certificate)" value={prize.reward} onChange={e=>setPrizes(prizes.map((p,j)=>j===i?{...p,reward:e.target.value}:p))} />
              <button type="button" onClick={()=>setPrizes(prizes.filter((_,j)=>j!==i))} style={{ padding:'8px',background:'rgba(255,101,132,0.1)',border:'1px solid rgba(255,101,132,0.3)',borderRadius:'8px',color:'#FF6584',cursor:'pointer' }}>×</button>
            </div>
          ))}
          <button type="button" onClick={()=>setPrizes([...prizes,{position:'',reward:''}])} style={{ padding:'8px 16px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',color:'#6C63FF',cursor:'pointer',fontSize:'0.85rem',fontWeight:600 }}>
            + Add Prize
          </button>
        </div>

        <div style={{ display:'flex',gap:'12px',justifyContent:'flex-end' }}>
          <button type="button" onClick={()=>navigate('/society')} style={{ padding:'12px 24px',background:'transparent',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'10px',color:'#9999BB',cursor:'pointer',fontWeight:600 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding:'12px 32px',background:'linear-gradient(135deg,#6C63FF,#5A52E0)',border:'none',borderRadius:'10px',color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',opacity:loading?0.7:1 }}>
            {loading?(isEdit?'Updating...':'Creating...'):(isEdit?'Update Event':'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
}

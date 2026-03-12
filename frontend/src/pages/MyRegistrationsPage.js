import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await api.get('/registrations/my');
      setRegistrations(data.registrations);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const cancel = async (eventId) => {
    if (!window.confirm('Cancel registration?')) return;
    try {
      await api.delete(`/registrations/event/${eventId}`);
      toast.success('Registration cancelled');
      fetchRegistrations();
    } catch (err) { toast.error('Cancellation failed'); }
  };

  const filtered = filter === 'all' ? registrations : registrations.filter(r => r.status === filter);
  const statusColor = { confirmed:'#43D9AD', waitlisted:'#FFB547', cancelled:'#FF6584', attended:'#6C63FF' };
  const statusBg = { confirmed:'rgba(67,217,173,0.15)', waitlisted:'rgba(255,181,71,0.15)', cancelled:'rgba(255,101,132,0.15)', attended:'rgba(108,99,255,0.15)' };

  if (loading) return <div className="loading-spinner">Loading registrations...</div>;

  return (
    <div style={{ padding:'24px',maxWidth:'900px',margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>📋 My Registrations</h1>
        <p style={{ color:'#9999BB' }}>Track all your event registrations</p>
      </div>

      <div style={{ display:'flex',gap:'8px',marginBottom:'24px' }}>
        {['all','confirmed','waitlisted','cancelled','attended'].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'7px 16px',borderRadius:'10px',border:'1px solid',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
            borderColor:filter===s?'#6C63FF':'rgba(108,99,255,0.2)',
            background:filter===s?'rgba(108,99,255,0.2)':'transparent',
            color:filter===s?'#6C63FF':'#9999BB' }}>
            {s.charAt(0).toUpperCase()+s.slice(1)} {s==='all'?`(${registrations.length})`:''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:'3rem',marginBottom:'12px' }}>📋</div>
          <h3>No registrations found</h3>
          <Link to="/events" style={{ color:'#6C63FF' }}>Browse Events</Link>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
          {filtered.map(reg => (
            <div key={reg._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'20px',display:'flex',gap:'16px',alignItems:'center' }}>
              <div style={{ width:'56px',height:'56px',borderRadius:'12px',background:'rgba(108,99,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0 }}>
                {reg.event?.category==='technical'?'💻':reg.event?.category==='cultural'?'🎭':reg.event?.category==='sports'?'⚽':'🎪'}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',gap:'10px',alignItems:'center',marginBottom:'4px',flexWrap:'wrap' }}>
                  <h3 style={{ fontWeight:700,fontSize:'1rem',fontFamily:'Syne' }}>{reg.event?.title}</h3>
                  <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',background:statusBg[reg.status],color:statusColor[reg.status] }}>{reg.status}</span>
                </div>
                <div style={{ display:'flex',gap:'16px',fontSize:'0.8rem',color:'#9999BB',flexWrap:'wrap' }}>
                  {reg.event?.date && <span>📅 {format(new Date(reg.event.date),'MMM dd, yyyy')}</span>}
                  {reg.event?.venue && <span>📍 {reg.event.venue}</span>}
                  <span>🏛️ {reg.event?.organizer?.societyName||reg.event?.organizer?.name}</span>
                </div>
                <div style={{ fontSize:'0.72rem',color:'#666',marginTop:'4px' }}>Registration Code: <strong style={{ color:'#9999BB' }}>{reg.registrationCode}</strong></div>
              </div>
              <div style={{ display:'flex',gap:'8px',flexShrink:0 }}>
                <Link to={`/events/${reg.event?._id}`} style={{ padding:'8px 14px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',color:'#6C63FF',fontSize:'0.82rem',fontWeight:600,textDecoration:'none' }}>View</Link>
                {reg.status === 'confirmed' && new Date(reg.event?.date) > new Date() && (
                  <button onClick={()=>cancel(reg.event?._id)} style={{ padding:'8px 14px',background:'rgba(255,101,132,0.1)',border:'1px solid rgba(255,101,132,0.3)',borderRadius:'8px',color:'#FF6584',fontSize:'0.82rem',cursor:'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

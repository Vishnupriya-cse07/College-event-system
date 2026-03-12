import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SocietyDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events/my-events');
      setEvents(data.events);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      setEvents(events.filter(e => e._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredStudents?.length || 0), 0);
  const activeEvents = events.filter(e => e.status === 'published' || e.status === 'ongoing');
  const completedEvents = events.filter(e => e.status === 'completed');

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

  return (
    <div style={{ padding:'24px',maxWidth:'1400px',margin:'0 auto' }}>
      <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(67,217,173,0.1))',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'20px',padding:'28px 32px',marginBottom:'28px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>
            <span style={{ background:'linear-gradient(135deg,#6C63FF,#43D9AD)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{user?.societyName}</span>
          </h1>
          <p style={{ color:'#9999BB',fontSize:'0.9rem' }}>{user?.societyCategory} · {user?.societyDescription?.slice(0,80)}...</p>
        </div>
        <Link to="/events/create" style={{ padding:'12px 24px',background:'linear-gradient(135deg,#6C63FF,#5A52E0)',borderRadius:'12px',color:'white',textDecoration:'none',fontWeight:700,fontSize:'0.9rem' }}>
          ➕ Create Event
        </Link>
      </div>

      <div className="grid-4" style={{ marginBottom:'28px' }}>
        {[
          { icon:'🎪',label:'Total Events',value:events.length,color:'#6C63FF',bg:'rgba(108,99,255,0.15)' },
          { icon:'🟢',label:'Active Events',value:activeEvents.length,color:'#43D9AD',bg:'rgba(67,217,173,0.15)' },
          { icon:'👥',label:'Total Registrations',value:totalRegistrations,color:'#FF6584',bg:'rgba(255,101,132,0.15)' },
          { icon:'✅',label:'Completed Events',value:completedEvents.length,color:'#FFB547',bg:'rgba(255,181,71,0.15)' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background:stat.bg }}>
              <span>{stat.icon}</span>
            </div>
            <div>
              <div style={{ fontSize:'1.8rem',fontWeight:700,fontFamily:'Syne',color:stat.color }}>{stat.value}</div>
              <div style={{ fontSize:'0.8rem',color:'#9999BB' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.2rem',marginBottom:'16px' }}>🗓️ Your Events</h2>
      {events.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:'3rem',marginBottom:'12px' }}>🎪</div>
          <h3>No events created yet</h3>
          <p>Create your first event to get started!</p>
          <Link to="/events/create" className="btn btn-primary" style={{ marginTop:'16px',display:'inline-flex' }}>Create Event</Link>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
          {events.map(event => (
            <div key={event._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'20px',display:'flex',gap:'20px',alignItems:'center' }}>
              <div style={{ width:'60px',height:'60px',borderRadius:'12px',background:'rgba(108,99,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0 }}>
                {event.category==='technical'?'💻':event.category==='cultural'?'🎭':event.category==='sports'?'⚽':event.category==='hackathon'?'⚡':'🎪'}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px' }}>
                  <h3 style={{ fontWeight:700,fontSize:'1rem',fontFamily:'Syne' }}>{event.title}</h3>
                  <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',
                    background:event.status==='published'?'rgba(67,217,173,0.2)':event.status==='completed'?'rgba(153,153,187,0.2)':'rgba(255,181,71,0.2)',
                    color:event.status==='published'?'#43D9AD':event.status==='completed'?'#9999BB':'#FFB547' }}>
                    {event.status}
                  </span>
                </div>
                <div style={{ display:'flex',gap:'20px',fontSize:'0.82rem',color:'#9999BB' }}>
                  <span>📅 {format(new Date(event.date),'MMM dd, yyyy')} · {event.time}</span>
                  <span>📍 {event.venue}</span>
                  <span>👥 {event.registeredStudents?.length||0}/{event.maxParticipants} registered</span>
                </div>
              </div>
              <div style={{ display:'flex',gap:'8px',flexShrink:0 }}>
                <button onClick={()=>navigate(`/events/${event._id}`)} style={{ padding:'8px 14px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',color:'#6C63FF',fontSize:'0.82rem',cursor:'pointer',fontWeight:600 }}>
                  View
                </button>
                <button onClick={()=>navigate(`/events/${event._id}/edit`)} style={{ padding:'8px 14px',background:'rgba(255,181,71,0.1)',border:'1px solid rgba(255,181,71,0.3)',borderRadius:'8px',color:'#FFB547',fontSize:'0.82rem',cursor:'pointer' }}>
                  Edit
                </button>
                <button onClick={()=>deleteEvent(event._id)} style={{ padding:'8px 14px',background:'rgba(255,101,132,0.1)',border:'1px solid rgba(255,101,132,0.3)',borderRadius:'8px',color:'#FF6584',fontSize:'0.82rem',cursor:'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

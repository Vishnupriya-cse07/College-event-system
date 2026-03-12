import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinEvent, leaveEvent } = useSocket();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState('details');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    joinEvent(id);
    return () => leaveEvent(id);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
      if (user?.role === 'student') {
        const regs = await api.get('/registrations/my');
        setRegistered(regs.data.registrations.some(r => r.event?._id === id && r.status !== 'cancelled'));
      }
    } catch (err) { navigate('/events'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const { data } = await api.post(`/registrations/event/${id}`);
      toast.success(data.status === 'confirmed' ? '🎉 Registered successfully!' : '📋 Added to waitlist!');
      setRegistered(true);
      fetchEvent();
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setRegistering(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration?')) return;
    try {
      await api.delete(`/registrations/event/${id}`);
      toast.success('Registration cancelled');
      setRegistered(false);
      fetchEvent();
    } catch (err) { toast.error('Cancellation failed'); }
  };

  if (loading) return <div className="loading-spinner">Loading event...</div>;
  if (!event) return null;

  const isFull = event.registeredStudents?.length >= event.maxParticipants;
  const isPast = new Date(event.date) < new Date();
  const isOrganizer = event.organizer?._id === user?._id;
  const spotsLeft = event.maxParticipants - (event.registeredStudents?.length || 0);
  const fillPercent = ((event.registeredStudents?.length || 0) / event.maxParticipants * 100).toFixed(0);

  const categoryColor = { technical:'#6C63FF',cultural:'#FF6584',sports:'#43D9AD',academic:'#FFB547',workshop:'#A78BFA',hackathon:'#FB7185',seminar:'#6EE7B7' };
  const color = categoryColor[event.category] || '#6C63FF';

  return (
    <div style={{ padding:'24px',maxWidth:'1100px',margin:'0 auto' }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${color}22, ${color}11)`,border:`1px solid ${color}33`,borderRadius:'20px',padding:'32px',marginBottom:'24px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',right:'32px',top:'32px',fontSize:'5rem',opacity:0.15 }}>
          {event.category==='technical'?'💻':event.category==='cultural'?'🎭':event.category==='sports'?'⚽':event.category==='hackathon'?'⚡':'🎪'}
        </div>
        <div style={{ display:'flex',gap:'10px',alignItems:'center',marginBottom:'14px',flexWrap:'wrap' }}>
          <span style={{ padding:'5px 14px',borderRadius:'20px',fontSize:'0.78rem',fontWeight:700,textTransform:'uppercase',background:`${color}22`,color,border:`1px solid ${color}44` }}>{event.category}</span>
          <span style={{ padding:'5px 14px',borderRadius:'20px',fontSize:'0.78rem',fontWeight:700,
            background:event.status==='published'?'rgba(67,217,173,0.2)':'rgba(153,153,187,0.2)',
            color:event.status==='published'?'#43D9AD':'#9999BB' }}>{event.status}</span>
          {event.isOnline && <span style={{ padding:'5px 14px',borderRadius:'20px',fontSize:'0.78rem',fontWeight:700,background:'rgba(108,99,255,0.2)',color:'#6C63FF' }}>🌐 Online</span>}
        </div>
        <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'2rem',marginBottom:'10px',lineHeight:1.3 }}>{event.title}</h1>
        <p style={{ color:'#9999BB',fontSize:'0.9rem',marginBottom:'20px' }}>Organized by <strong style={{ color:'#E8E8F0' }}>{event.organizer?.societyName||event.organizer?.name}</strong></p>
        
        <div style={{ display:'flex',gap:'24px',flexWrap:'wrap',marginBottom:'20px' }}>
          {[
            { icon:'📅', label: format(new Date(event.date),'MMMM dd, yyyy') },
            { icon:'⏰', label: event.time },
            { icon:'📍', label: event.venue },
            { icon:'👥', label: `${event.registeredStudents?.length||0}/${event.maxParticipants} registered` },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:'8px',color:'#9999BB',fontSize:'0.9rem' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background:'rgba(0,0,0,0.3)',borderRadius:'20px',height:'8px',marginBottom:'16px',overflow:'hidden' }}>
          <div style={{ height:'100%',width:`${fillPercent}%`,background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:'20px',transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.8rem',color:'#9999BB',marginBottom:'20px' }}>
          <span style={{ color: isFull?'#FF6584':'#43D9AD',fontWeight:600 }}>{isFull?'Event Full':`${spotsLeft} spots available`}</span>
          <span>{fillPercent}% filled</span>
        </div>

        {user?.role === 'student' && !isPast && (
          <div>
            {registered ? (
              <div style={{ display:'flex',gap:'12px',alignItems:'center' }}>
                <span style={{ padding:'10px 20px',background:'rgba(67,217,173,0.2)',border:'1px solid rgba(67,217,173,0.4)',borderRadius:'10px',color:'#43D9AD',fontWeight:600,fontSize:'0.9rem' }}>✅ You're Registered!</span>
                <button onClick={handleCancel} style={{ padding:'10px 20px',background:'rgba(255,101,132,0.1)',border:'1px solid rgba(255,101,132,0.3)',borderRadius:'10px',color:'#FF6584',cursor:'pointer',fontWeight:600,fontSize:'0.9rem' }}>Cancel Registration</button>
              </div>
            ) : event.registrationOpen ? (
              <button onClick={handleRegister} disabled={registering} style={{ padding:'12px 28px',background:`linear-gradient(135deg,${color},${color}cc)`,border:'none',borderRadius:'12px',color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',opacity:registering?0.7:1 }}>
                {registering?'Registering...':(isFull?'Join Waitlist':'Register Now')}
              </button>
            ) : (
              <span style={{ padding:'10px 20px',background:'rgba(153,153,187,0.2)',borderRadius:'10px',color:'#9999BB' }}>Registration Closed</span>
            )}
          </div>
        )}
        {isOrganizer && (
          <button onClick={()=>navigate(`/events/${id}/edit`)} style={{ padding:'10px 20px',background:'rgba(255,181,71,0.1)',border:'1px solid rgba(255,181,71,0.3)',borderRadius:'10px',color:'#FFB547',cursor:'pointer',fontWeight:600 }}>✏️ Edit Event</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:'4px',marginBottom:'20px',background:'#1A1A2E',borderRadius:'12px',padding:'6px',border:'1px solid rgba(108,99,255,0.2)' }}>
        {['details','schedule','speakers','prizes'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'8px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'0.85rem',fontWeight:600,
            background:tab===t?'rgba(108,99,255,0.2)':'transparent',color:tab===t?'#6C63FF':'#9999BB' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px' }}>
        {tab==='details' && (
          <div>
            <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'12px' }}>About this Event</h3>
            <p style={{ color:'#9999BB',lineHeight:1.7,whiteSpace:'pre-line' }}>{event.description}</p>
            {event.requirements?.length > 0 && (
              <div style={{ marginTop:'20px' }}>
                <h4 style={{ fontWeight:600,marginBottom:'10px' }}>📋 Requirements</h4>
                <ul style={{ color:'#9999BB',paddingLeft:'20px',lineHeight:2 }}>
                  {event.requirements.map((r,i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {event.tags?.length > 0 && (
              <div style={{ marginTop:'20px',display:'flex',gap:'8px',flexWrap:'wrap' }}>
                {event.tags.map(tag => (
                  <span key={tag} style={{ padding:'4px 12px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'20px',fontSize:'0.8rem',color:'#9999BB' }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
        {tab==='schedule' && (
          <div>
            <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>📅 Schedule</h3>
            {event.schedule?.length > 0 ? (
              <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
                {event.schedule.map((s,i) => (
                  <div key={i} style={{ display:'flex',gap:'16px',alignItems:'flex-start' }}>
                    <span style={{ background:'rgba(108,99,255,0.2)',padding:'4px 10px',borderRadius:'8px',fontSize:'0.8rem',color:'#6C63FF',fontWeight:700,whiteSpace:'nowrap' }}>{s.time}</span>
                    <span style={{ color:'#9999BB',lineHeight:1.5 }}>{s.activity}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color:'#9999BB' }}>No schedule added yet.</p>}
          </div>
        )}
        {tab==='speakers' && (
          <div>
            <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>🎤 Speakers</h3>
            {event.speakers?.length > 0 ? (
              <div className="grid-2">
                {event.speakers.map((s,i) => (
                  <div key={i} style={{ background:'#0F0F1A',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'12px',padding:'16px' }}>
                    <div style={{ width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#FF6584)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:'10px' }}>👤</div>
                    <div style={{ fontWeight:700 }}>{s.name}</div>
                    <div style={{ fontSize:'0.82rem',color:'#6C63FF',marginBottom:'6px' }}>{s.designation}</div>
                    <div style={{ fontSize:'0.82rem',color:'#9999BB' }}>{s.bio}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color:'#9999BB' }}>No speakers listed.</p>}
          </div>
        )}
        {tab==='prizes' && (
          <div>
            <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>🏆 Prizes</h3>
            {event.prizes?.length > 0 ? (
              <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
                {event.prizes.map((p,i) => (
                  <div key={i} style={{ display:'flex',gap:'16px',alignItems:'center',background:'#0F0F1A',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'10px',padding:'14px' }}>
                    <span style={{ fontSize:'1.5rem' }}>{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                    <div>
                      <div style={{ fontWeight:600 }}>{p.position}</div>
                      <div style={{ color:'#FFB547',fontSize:'0.9rem' }}>{p.reward}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color:'#9999BB' }}>No prizes listed.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EventCard from '../components/Events/EventCard';
import AIChatbot from '../components/AI/AIChatbot';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [stats, setStats] = useState({ registered: 0, attended: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, regsRes] = await Promise.all([
        api.get('/events?upcoming=true&limit=6'),
        api.get('/registrations/my')
      ]);
      setUpcomingEvents(eventsRes.data.events);
      setMyRegistrations(regsRes.data.registrations.slice(0, 3));
      const regs = regsRes.data.registrations;
      setStats({
        registered: regs.filter(r=>r.status==='confirmed').length,
        attended: regs.filter(r=>r.status==='attended').length,
        upcoming: regs.filter(r=>r.status==='confirmed'&&new Date(r.event?.date)>new Date()).length
      });
      fetchRecommendations();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.get('/ai/recommendations');
      setRecommendations(data.recommendations.slice(0, 3));
    } catch (err) { console.error(err); }
    finally { setAiLoading(false); }
  };

  const registerForEvent = async (event) => {
    try {
      const { data } = await api.post(`/registrations/event/${event._id}`);
      toast.success(data.status === 'confirmed' ? '🎉 Registered successfully!' : '📋 Added to waitlist!');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) return <div className="loading-spinner">Loading your dashboard...</div>;

  return (
    <div style={{ padding:'24px',maxWidth:'1400px',margin:'0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(255,101,132,0.15))',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'20px',padding:'28px 32px',marginBottom:'28px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div>
          <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>
            Welcome back, <span style={{ background:'linear-gradient(135deg,#6C63FF,#FF6584)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p style={{ color:'#9999BB',fontSize:'0.95rem' }}>{user?.department} · Year {user?.year} · {user?.studentId}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'0.8rem',color:'#9999BB',marginBottom:'4px' }}>Your Interests</div>
          <div style={{ display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'flex-end' }}>
            {user?.interests?.slice(0,4).map(i=>(
              <span key={i} style={{ padding:'3px 10px',background:'rgba(108,99,255,0.2)',borderRadius:'20px',fontSize:'0.75rem',color:'#6C63FF',fontWeight:600 }}>{i}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:'28px' }}>
        {[
          { icon:'📋',label:'Registered',value:stats.registered,color:'#6C63FF',bg:'rgba(108,99,255,0.15)' },
          { icon:'📅',label:'Upcoming',value:stats.upcoming,color:'#43D9AD',bg:'rgba(67,217,173,0.15)' },
          { icon:'✅',label:'Attended',value:stats.attended,color:'#FFB547',bg:'rgba(255,181,71,0.15)' },
          { icon:'🎯',label:'Events Available',value:upcomingEvents.length,color:'#FF6584',bg:'rgba(255,101,132,0.15)' },
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

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'28px',marginBottom:'28px' }}>
        {/* AI Recommendations */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px' }}>
            <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.2rem' }}>🤖 AI Recommendations</h2>
            <button onClick={fetchRecommendations} style={{ fontSize:'0.8rem',background:'none',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',padding:'4px 10px',color:'#6C63FF',cursor:'pointer' }}>
              Refresh
            </button>
          </div>
          {aiLoading ? (
            <div style={{ textAlign:'center',padding:'40px',color:'#9999BB' }}>🤖 AI analyzing your interests...</div>
          ) : recommendations.length > 0 ? (
            <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
              {recommendations.map(event => (
                <div key={event._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'12px',padding:'14px',display:'flex',gap:'14px',alignItems:'center' }}>
                  <div style={{ width:'48px',height:'48px',borderRadius:'10px',background:'rgba(108,99,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0 }}>
                    {event.category==='technical'?'💻':event.category==='cultural'?'🎭':event.category==='sports'?'⚽':'🎪'}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:600,fontSize:'0.9rem',marginBottom:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{event.title}</div>
                    <div style={{ fontSize:'0.78rem',color:'#9999BB' }}>{format(new Date(event.date),'MMM dd')} · {event.venue}</div>
                  </div>
                  <button onClick={()=>registerForEvent(event)} style={{ padding:'6px 12px',background:'rgba(108,99,255,0.2)',border:'1px solid rgba(108,99,255,0.4)',borderRadius:'8px',color:'#6C63FF',fontSize:'0.78rem',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap' }}>
                    Register
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Update your interests to get AI recommendations!</p>
              <Link to="/profile" style={{ color:'#6C63FF' }}>Update Interests</Link>
            </div>
          )}
        </div>

        {/* My Upcoming Registrations */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px' }}>
            <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.2rem' }}>📋 My Registrations</h2>
            <Link to="/my-registrations" style={{ fontSize:'0.8rem',color:'#6C63FF',textDecoration:'none' }}>View all →</Link>
          </div>
          {myRegistrations.length > 0 ? (
            <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
              {myRegistrations.map(reg => (
                <div key={reg._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'12px',padding:'14px' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px' }}>
                    <span style={{ fontWeight:600,fontSize:'0.9rem' }}>{reg.event?.title}</span>
                    <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,
                      background:reg.status==='confirmed'?'rgba(67,217,173,0.2)':reg.status==='waitlisted'?'rgba(255,181,71,0.2)':'rgba(255,101,132,0.2)',
                      color:reg.status==='confirmed'?'#43D9AD':reg.status==='waitlisted'?'#FFB547':'#FF6584' }}>
                      {reg.status}
                    </span>
                  </div>
                  <div style={{ fontSize:'0.78rem',color:'#9999BB' }}>
                    {reg.event?.date ? format(new Date(reg.event.date),'MMM dd, yyyy') : 'TBD'} · {reg.event?.venue}
                  </div>
                  <div style={{ fontSize:'0.72rem',color:'#666',marginTop:'4px' }}>Code: {reg.registrationCode}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No registrations yet</p>
              <Link to="/events" style={{ color:'#6C63FF' }}>Browse Events</Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px' }}>
          <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.2rem' }}>🎯 Upcoming Events</h2>
          <Link to="/events" style={{ fontSize:'0.85rem',color:'#6C63FF',textDecoration:'none',fontWeight:600 }}>Browse all →</Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid-3">
            {upcomingEvents.map(event => (
              <EventCard key={event._id} event={event} showActions onRegister={registerForEvent} />
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>No upcoming events at the moment</p></div>
        )}
      </div>

      <AIChatbot />
    </div>
  );
}

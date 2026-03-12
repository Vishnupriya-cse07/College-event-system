import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/events?limit=100'),
      api.get('/societies'),
      api.get('/students')
    ]).then(([evRes, socRes, stuRes]) => {
      setEvents(evRes.data.events);
      setSocieties(socRes.data.societies);
      setStudents(stuRes.data.students);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading admin dashboard...</div>;

  const totalRegs = events.reduce((sum, e) => sum + (e.registeredStudents?.length || 0), 0);

  return (
    <div style={{ padding:'24px',maxWidth:'1400px',margin:'0 auto' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'2rem',marginBottom:'4px' }}>
          ⚙️ <span style={{ background:'linear-gradient(135deg,#6C63FF,#FF6584)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Admin Dashboard</span>
        </h1>
        <p style={{ color:'#9999BB' }}>System overview and management</p>
      </div>

      <div className="grid-4" style={{ marginBottom:'32px' }}>
        {[
          { icon:'🎪',label:'Total Events',value:events.length,color:'#6C63FF',bg:'rgba(108,99,255,0.15)' },
          { icon:'🏛️',label:'Societies',value:societies.length,color:'#43D9AD',bg:'rgba(67,217,173,0.15)' },
          { icon:'🎓',label:'Students',value:students.length,color:'#FFB547',bg:'rgba(255,181,71,0.15)' },
          { icon:'📋',label:'Registrations',value:totalRegs,color:'#FF6584',bg:'rgba(255,101,132,0.15)' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background:stat.bg }}><span>{stat.icon}</span></div>
            <div>
              <div style={{ fontSize:'1.8rem',fontWeight:700,fontFamily:'Syne',color:stat.color }}>{stat.value}</div>
              <div style={{ fontSize:'0.8rem',color:'#9999BB' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div>
          <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.1rem',marginBottom:'16px' }}>🏛️ Societies</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {societies.map(s => (
              <div key={s._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'12px',padding:'14px',display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:'rgba(108,99,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem' }}>🏛️</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:'0.9rem' }}>{s.societyName||s.name}</div>
                  <div style={{ fontSize:'0.78rem',color:'#9999BB' }}>{s.societyCategory} · {s.eventsOrganized?.length||0} events</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.1rem',marginBottom:'16px' }}>🎪 Recent Events</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {events.slice(0,8).map(e => (
              <div key={e._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'12px',padding:'14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600,fontSize:'0.9rem',marginBottom:'2px' }}>{e.title}</div>
                  <div style={{ fontSize:'0.78rem',color:'#9999BB' }}>{format(new Date(e.date),'MMM dd')} · {e.registeredStudents?.length||0} registered</div>
                </div>
                <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,
                  background:e.status==='published'?'rgba(67,217,173,0.2)':'rgba(153,153,187,0.2)',
                  color:e.status==='published'?'#43D9AD':'#9999BB' }}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

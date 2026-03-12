import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function EventCard({ event, showActions, onRegister, onEdit }) {
  const categoryColors = {
    technical: '#6C63FF', cultural: '#FF6584', sports: '#43D9AD',
    academic: '#FFB547', workshop: '#A78BFA', hackathon: '#FB7185',
    seminar: '#6EE7B7', other: '#9999BB'
  };

  const color = categoryColors[event.category] || '#6C63FF';
  const spotsLeft = event.maxParticipants - (event.registeredStudents?.length || 0);
  const isFull = spotsLeft <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',overflow:'hidden',transition:'transform 0.2s,box-shadow 0.2s',cursor:'pointer' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(108,99,255,0.2)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
      
      <div style={{ height:'140px',background:`linear-gradient(135deg, ${color}22, ${color}44)`,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem',borderBottom:'1px solid rgba(108,99,255,0.1)' }}>
        {event.category==='technical'?'💻':event.category==='cultural'?'🎭':event.category==='sports'?'⚽':event.category==='academic'?'📚':event.category==='workshop'?'🔧':event.category==='hackathon'?'⚡':event.category==='seminar'?'🎤':'🎪'}
        <div style={{ position:'absolute',top:'12px',right:'12px' }}>
          <span style={{ padding:'4px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',background:`${color}22`,color,border:`1px solid ${color}44` }}>
            {event.category}
          </span>
        </div>
        {isPast && <div style={{ position:'absolute',top:'12px',left:'12px',padding:'4px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,background:'rgba(153,153,187,0.2)',color:'#9999BB' }}>Ended</div>}
      </div>

      <div style={{ padding:'16px' }}>
        <h3 style={{ fontSize:'1rem',fontWeight:700,marginBottom:'8px',color:'#E8E8F0',lineHeight:1.3,fontFamily:'Syne' }}>{event.title}</h3>
        <p style={{ fontSize:'0.8rem',color:'#9999BB',marginBottom:'12px',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
          {event.shortDescription || event.description}
        </p>
        
        <div style={{ display:'flex',flexDirection:'column',gap:'6px',marginBottom:'14px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'0.8rem',color:'#9999BB' }}>
            <span>📅</span>
            <span>{format(new Date(event.date), 'MMM dd, yyyy')} · {event.time}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'0.8rem',color:'#9999BB' }}>
            <span>📍</span><span>{event.venue}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'0.8rem',color:'#9999BB' }}>
            <span>🏛️</span><span>{event.organizer?.societyName||event.organizer?.name}</span>
          </div>
        </div>

        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px' }}>
          <div style={{ fontSize:'0.8rem' }}>
            <span style={{ color: isFull?'#FF6584':'#43D9AD',fontWeight:600 }}>
              {isFull?'Full':''+spotsLeft+' spots left'}
            </span>
          </div>
          <div style={{ fontSize:'0.75rem',color:'#9999BB' }}>{event.registeredStudents?.length||0}/{event.maxParticipants} registered</div>
        </div>

        <div style={{ display:'flex',gap:'8px' }}>
          <Link to={`/events/${event._id}`} style={{ flex:1,padding:'8px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'8px',textDecoration:'none',color:'#6C63FF',textAlign:'center',fontSize:'0.85rem',fontWeight:600 }}>
            View Details
          </Link>
          {showActions && onRegister && !isPast && (
            <button onClick={()=>onRegister(event)} disabled={isFull} style={{ flex:1,padding:'8px',background:isFull?'rgba(153,153,187,0.1)':'#6C63FF',border:'none',borderRadius:'8px',color:isFull?'#9999BB':'white',fontSize:'0.85rem',fontWeight:600,cursor:isFull?'not-allowed':'pointer' }}>
              {isFull?'Waitlist':'Register'}
            </button>
          )}
          {onEdit && (
            <button onClick={()=>onEdit(event)} style={{ padding:'8px 12px',background:'rgba(255,181,71,0.1)',border:'1px solid rgba(255,181,71,0.3)',borderRadius:'8px',color:'#FFB547',fontSize:'0.85rem',cursor:'pointer' }}>
              ✏️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function SocietiesPage() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/societies').then(({ data }) => setSocieties(data.societies)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categoryColors = { technical:'#6C63FF',cultural:'#FF6584',sports:'#43D9AD',academic:'#FFB547',social:'#A78BFA' };

  if (loading) return <div className="loading-spinner">Loading societies...</div>;

  return (
    <div style={{ padding:'24px',maxWidth:'1400px',margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>🏛️ College Societies</h1>
        <p style={{ color:'#9999BB' }}>Discover active clubs and organizations on campus</p>
      </div>
      {societies.length === 0 ? (
        <div className="empty-state"><p>No societies registered yet</p></div>
      ) : (
        <div className="grid-3">
          {societies.map(society => {
            const color = categoryColors[society.societyCategory] || '#6C63FF';
            return (
              <div key={society._id} style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',transition:'transform 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ width:'64px',height:'64px',borderRadius:'16px',background:`${color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',marginBottom:'16px',border:`1px solid ${color}33` }}>
                  {society.societyCategory==='technical'?'💻':society.societyCategory==='cultural'?'🎭':society.societyCategory==='sports'?'⚽':society.societyCategory==='academic'?'📚':'🌟'}
                </div>
                <h3 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.1rem',marginBottom:'6px' }}>{society.societyName||society.name}</h3>
                <span style={{ padding:'4px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',background:`${color}22`,color,marginBottom:'10px',display:'inline-block' }}>
                  {society.societyCategory}
                </span>
                <p style={{ fontSize:'0.82rem',color:'#9999BB',lineHeight:1.5,marginBottom:'16px',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
                  {society.societyDescription||'An active college society.'}
                </p>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <span style={{ fontSize:'0.8rem',color:'#9999BB' }}>🎪 {society.eventsOrganized?.length||0} events</span>
                  <Link to={`/events?organizer=${society._id}`} style={{ padding:'6px 14px',background:`${color}22`,border:`1px solid ${color}44`,borderRadius:'8px',color,fontSize:'0.8rem',fontWeight:600,textDecoration:'none' }}>
                    View Events
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

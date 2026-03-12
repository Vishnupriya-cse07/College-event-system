import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EventCard from '../components/Events/EventCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','technical','cultural','sports','academic','workshop','hackathon','seminar','other'];

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchEvents(); }, [search, category, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      const { data } = await api.get(`/events?${params}`);
      setEvents(data.events);
      setTotalPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const registerForEvent = async (event) => {
    try {
      const { data } = await api.post(`/registrations/event/${event._id}`);
      toast.success(data.status === 'confirmed' ? '🎉 Registered!' : '📋 Added to waitlist!');
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div style={{ padding:'24px',maxWidth:'1400px',margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'6px' }}>🎯 Events</h1>
        <p style={{ color:'#9999BB' }}>Discover and register for college events</p>
      </div>

      <div style={{ display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap' }}>
        <input placeholder="🔍 Search events..." value={search}
          onChange={e=>{setSearch(e.target.value);setPage(1)}}
          style={{ flex:1,minWidth:'200px',background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'10px',padding:'10px 14px',color:'#E8E8F0',fontSize:'0.9rem',outline:'none' }} />
        <div style={{ display:'flex',gap:'8px',flexWrap:'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={()=>{setCategory(cat);setPage(1)}} style={{
              padding:'8px 16px',borderRadius:'10px',border:'1px solid',cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
              borderColor:category===cat?'#6C63FF':'rgba(108,99,255,0.2)',
              background:category===cat?'rgba(108,99,255,0.2)':'transparent',
              color:category===cat?'#6C63FF':'#9999BB'
            }}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:'3rem',marginBottom:'12px' }}>🔍</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {events.map(event => (
              <EventCard key={event._id} event={event}
                showActions={user?.role==='student'}
                onRegister={user?.role==='student'?registerForEvent:null} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display:'flex',justifyContent:'center',gap:'8px',marginTop:'32px' }}>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={()=>setPage(p)} style={{
                  width:'36px',height:'36px',borderRadius:'8px',border:'1px solid',cursor:'pointer',fontWeight:600,
                  borderColor:page===p?'#6C63FF':'rgba(108,99,255,0.2)',
                  background:page===p?'rgba(108,99,255,0.2)':'transparent',
                  color:page===p?'#6C63FF':'#9999BB'
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

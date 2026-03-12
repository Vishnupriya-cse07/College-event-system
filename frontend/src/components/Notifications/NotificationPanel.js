import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markRead } = useSocket();

  useEffect(() => { fetchNotifications(); markRead(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, read: true})));
    } catch (err) {}
  };

  const typeIcons = { event_registered:'✅',event_reminder:'⏰',event_cancelled:'❌',event_updated:'📝',new_event:'🎉',registration_closed:'🔒',waitlist_promoted:'🎊',general:'📢' };

  return (
    <div style={{ position:'fixed',top:'64px',right:'24px',width:'380px',background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'16px',boxShadow:'0 16px 48px rgba(0,0,0,0.6)',zIndex:150,maxHeight:'500px',overflow:'hidden',display:'flex',flexDirection:'column' }}>
      <div style={{ padding:'16px 20px',borderBottom:'1px solid rgba(108,99,255,0.2)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <h3 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1rem' }}>🔔 Notifications</h3>
        <div style={{ display:'flex',gap:'8px' }}>
          <button onClick={markAllRead} style={{ background:'none',border:'none',color:'#6C63FF',cursor:'pointer',fontSize:'0.8rem' }}>Mark all read</button>
          {onClose && <button onClick={onClose} style={{ background:'none',border:'none',color:'#9999BB',cursor:'pointer',fontSize:'1.2rem' }}>×</button>}
        </div>
      </div>
      <div style={{ overflowY:'auto',flex:1 }}>
        {loading ? <div style={{ padding:'40px',textAlign:'center',color:'#9999BB' }}>Loading...</div>
        : notifications.length===0 ? <div style={{ padding:'40px',textAlign:'center',color:'#9999BB' }}><div style={{ fontSize:'2rem',marginBottom:'8px' }}>🔕</div><p>No notifications yet</p></div>
        : notifications.map(notif => (
          <div key={notif._id} style={{ padding:'14px 20px',borderBottom:'1px solid rgba(108,99,255,0.1)',background:notif.read?'transparent':'rgba(108,99,255,0.05)',display:'flex',gap:'12px',alignItems:'flex-start' }}>
            <span style={{ fontSize:'1.3rem',marginTop:'2px' }}>{typeIcons[notif.type]||'📢'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.85rem',fontWeight:600,marginBottom:'2px',color:notif.read?'#9999BB':'#E8E8F0' }}>{notif.title}</div>
              <div style={{ fontSize:'0.8rem',color:'#9999BB',lineHeight:1.4 }}>{notif.message}</div>
            </div>
            {!notif.read && <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#6C63FF',marginTop:'6px',flexShrink:0 }}></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

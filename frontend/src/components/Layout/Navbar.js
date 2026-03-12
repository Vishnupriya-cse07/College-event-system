import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };
  const navLinks = {
    student: [
      { to: '/student', label: 'Dashboard' },
      { to: '/events', label: 'Events' },
      { to: '/my-registrations', label: 'My Registrations' },
      { to: '/societies', label: 'Societies' },
    ],
    society: [
      { to: '/society', label: 'Dashboard' },
      { to: '/events', label: 'Browse Events' },
      { to: '/events/create', label: 'Create Event' },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/events', label: 'Events' },
      { to: '/societies', label: 'Societies' },
    ]
  };
  const links = navLinks[user?.role] || [];
  return (
    <nav style={{ background:'rgba(26,26,46,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(108,99,255,0.2)',padding:'0 24px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100 }}>
      <Link to="/" style={{ textDecoration:'none' }}>
        <span style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.3rem',background:'linear-gradient(135deg,#6C63FF,#FF6584)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
          ⚡ EventHub
        </span>
      </Link>
      <div style={{ display:'flex',gap:'4px' }}>
        {links.map(link => (
          <Link key={link.to} to={link.to} style={{ textDecoration:'none',padding:'8px 14px',borderRadius:'10px',fontSize:'0.85rem',fontWeight:500,color:location.pathname===link.to?'#6C63FF':'#9999BB',background:location.pathname===link.to?'rgba(108,99,255,0.1)':'transparent' }}>
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
        <div style={{ position:'relative',fontSize:'1.2rem',cursor:'pointer' }}>🔔
          {unreadCount>0&&<span style={{ position:'absolute',top:'-4px',right:'-6px',background:'#FF6584',color:'white',borderRadius:'50%',width:'16px',height:'16px',fontSize:'0.65rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700 }}>{unreadCount>9?'9+':unreadCount}</span>}
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={()=>setShowMenu(!showMenu)} style={{ display:'flex',alignItems:'center',gap:'8px',background:'rgba(108,99,255,0.1)',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'10px',padding:'6px 12px',cursor:'pointer',color:'#E8E8F0' }}>
            <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#FF6584)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,color:'white' }}>{(user?.name||'U').charAt(0).toUpperCase()}</div>
            <span style={{ fontSize:'0.85rem',fontWeight:500 }}>{user?.societyName||user?.name?.split(' ')[0]}</span>
          </button>
          {showMenu&&(
            <div style={{ position:'absolute',right:0,top:'100%',marginTop:'8px',background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'12px',padding:'8px',minWidth:'160px',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',zIndex:200 }}>
              <Link to="/profile" onClick={()=>setShowMenu(false)} style={{ display:'block',padding:'10px 12px',color:'#E8E8F0',textDecoration:'none',borderRadius:'8px',fontSize:'0.9rem' }}>👤 Profile</Link>
              <button onClick={handleLogout} style={{ width:'100%',padding:'10px 12px',background:'none',border:'none',color:'#FF6584',cursor:'pointer',textAlign:'left',borderRadius:'8px',fontSize:'0.9rem' }}>🚪 Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../utils/api';

const ICONS = {
  bell: '🔔', menu: '☰', close: '✕', user: '👤',
  logout: '🚪', dashboard: '⚡', events: '🎭',
  societies: '🏛️', settings: '⚙️',
};

export default function Navbar() {
  const { user, logout, unreadCount, notifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const markAllRead = async () => {
    try { await notificationAPI.markAllRead(); } catch (e) {}
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>E</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
            Event<span style={{ color: '#7c3aed' }}>Hub</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[
            { to: '/events', label: 'Events' },
            { to: '/societies', label: 'Societies' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive(link.to) ? '#a78bfa' : '#8888aa',
              background: isActive(link.to) ? 'rgba(124,58,237,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} ref={notifRef}>
          {user ? (
            <>
              {/* Notifications Bell */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (unreadCount > 0) markAllRead(); }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'white', position: 'relative', fontSize: 16 }}>
                  {ICONS.bell}
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: '#7c3aed', color: 'white', borderRadius: '50%',
                      width: 18, height: 18, fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 48, width: 360,
                    background: '#13131f', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 999,
                  }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Notifications</span>
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 12, cursor: 'pointer' }}>Mark all read</button>
                    </div>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#555570' }}>No notifications yet</div>
                      ) : notifications.slice(0, 10).map((n, i) => (
                        <div key={i} style={{
                          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: n.isRead ? 'transparent' : 'rgba(124,58,237,0.05)',
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                          <div style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                </button>

                {profileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 48, width: 220,
                    background: '#13131f', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 999,
                  }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                      <div style={{ color: '#8888aa', fontSize: 12 }}>{user.role}</div>
                    </div>
                    {[
                      { to: '/dashboard', label: `${ICONS.dashboard} Dashboard` },
                      user.role === 'student' && { to: '/my-registrations', label: '🎟️ My Registrations' },
                    ].filter(Boolean).map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '12px 18px', fontSize: 13, color: '#ccc', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >{item.label}</Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '12px 18px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                        {ICONS.logout} Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

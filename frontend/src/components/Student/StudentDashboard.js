import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Shared/Navbar';
import EventCard from '../Shared/EventCard';
import { aiAPI, eventsAPI, registrationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', content: "Hi! I'm EventBot 🤖 Ask me anything about campus events!" }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      eventsAPI.getAll({ upcoming: 'true', limit: 6 }),
      registrationAPI.getMyRegistrations(),
    ]).then(([evRes, regRes]) => {
      setUpcomingEvents(evRes.data.events);
      setMyRegistrations(regRes.data.registrations);
    }).finally(() => setLoading(false));
  }, []);

  const loadRecommendations = async () => {
    setAiLoading(true);
    try {
      const res = await aiAPI.getRecommendations();
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('AI recommendations error', err);
    } finally {
      setAiLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const history = chatMessages.slice(-6);
      const res = await aiAPI.chat(chatInput, history);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const upcoming = myRegistrations.filter(r => new Date(r.event?.date) > new Date() && r.status === 'confirmed');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
              Hey, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {user?.department} · Year {user?.year} · {user?.interests?.length} interests tracked
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/my-registrations" className="btn btn-secondary">🎟️ My Tickets</Link>
            <Link to="/events" className="btn btn-primary">Browse Events →</Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid" style={{ marginBottom: 40 }}>
          {[
            { label: 'Registered Events', value: myRegistrations.length, icon: '🎟️', color: '#7c3aed' },
            { label: 'Upcoming Events', value: upcoming.length, icon: '📅', color: '#06b6d4' },
            { label: 'Your Interests', value: user?.interests?.length || 0, icon: '❤️', color: '#f472b6' },
            { label: 'AI Matches Found', value: recommendations.length, icon: '🤖', color: '#f59e0b' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Recommendations Section */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                🤖 AI-Powered For You
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Llama 3 analyzes your interests to find the best matches
              </p>
            </div>
            <button className="btn btn-primary" onClick={loadRecommendations} disabled={aiLoading} style={{ whiteSpace: 'nowrap' }}>
              {aiLoading ? '⟳ Analyzing...' : recommendations.length ? '↻ Refresh' : '✨ Get Recommendations'}
            </button>
          </div>

          {aiLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid rgba(124,58,237,0.3)' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Llama 3 is analyzing your profile...</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Cross-referencing your interests with {upcomingEvents.length} upcoming events</div>
              </div>
            </div>
          )}

          {recommendations.length > 0 && !aiLoading && (
            <div className="events-grid stagger">
              {recommendations.map(event => <EventCard key={event._id} event={event} showAI />)}
            </div>
          )}

          {recommendations.length === 0 && !aiLoading && (
            <div style={{ padding: '40px', background: 'var(--bg-card)', border: '1px dashed rgba(124,58,237,0.3)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Click "Get Recommendations" to let AI find events tailored just for you</p>
            </div>
          )}
        </div>

        {/* Upcoming Registered Events */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              📅 Your Upcoming Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.slice(0, 5).map(reg => (
                <Link key={reg._id} to={`/events/${reg.event?._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      🎭
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{reg.event?.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {reg.event?.date && new Date(reg.event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        {' · '}{reg.event?.society?.name}
                      </div>
                    </div>
                    <span className="badge badge-green">Confirmed</span>
                    <div style={{ fontSize: 13, color: '#a78bfa', fontFamily: 'monospace' }}>{reg.ticketId}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Upcoming Events */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>🔥 All Upcoming Events</h2>
            <Link to="/events" style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {[...Array(3)].map((_, i) => <div key={i} style={{ height: 350, background: 'var(--bg-card)', borderRadius: 20 }} />)}
            </div>
          ) : (
            <div className="events-grid stagger">
              {upcomingEvents.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot FAB */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
        {chatOpen && (
          <div style={{
            position: 'absolute', bottom: 64, right: 0, width: 360,
            background: '#13131f', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ padding: '16px 20px', background: 'rgba(124,58,237,0.15)', borderBottom: '1px solid rgba(124,58,237,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>🤖 EventBot</div>
                <div style={{ fontSize: 11, color: '#a78bfa' }}>Powered by Llama 3</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ height: 300, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                    background: msg.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 14,
                  }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, width: 'fit-content' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', animation: `pulse 1s ${i * 0.2}s ease infinite` }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendChat()}
                className="form-input" placeholder="Ask about events..." style={{ flex: 1, fontSize: 13, padding: '10px 12px' }}
              />
              <button className="btn btn-primary btn-sm" onClick={sendChat} disabled={chatLoading}>→</button>
            </div>
          </div>
        )}

        <button onClick={() => setChatOpen(!chatOpen)} style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          border: 'none', cursor: 'pointer', fontSize: 24,
          boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
          transition: 'transform 0.2s',
          animation: 'glow 2s ease infinite',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {chatOpen ? '✕' : '🤖'}
        </button>
      </div>
    </div>
  );
}

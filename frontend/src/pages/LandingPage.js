import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Shared/Navbar';
import EventCard from '../components/Shared/EventCard';
import { eventsAPI } from '../utils/api';

const STATS = [
  { label: 'Active Societies', value: '15+', icon: '🏛️' },
  { label: 'Students Registered', value: '500+', icon: '🎓' },
  { label: 'Events Per Semester', value: '80+', icon: '🎭' },
  { label: 'Reduction in Missed Events', value: '80%', icon: '📈' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Recommendations', desc: 'Llama 3 analyzes your interests to surface the most relevant events just for you.' },
  { icon: '⚡', title: 'Real-Time Notifications', desc: 'Socket.io delivers instant updates on new events, approvals, and registrations.' },
  { icon: '🔐', title: 'Secure Role-Based Access', desc: 'JWT authentication across 3 distinct roles — Admin, Society, and Student.' },
  { icon: '🎟️', title: 'Smart Registration', desc: 'One-click registration with automatic waitlisting and ticket generation.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Societies and admins get detailed insights on attendance and engagement.' },
  { icon: '✅', title: 'Event Approval Flow', desc: 'Structured approval pipeline ensures quality events reach students.' },
];

export default function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    eventsAPI.getAll({ featured: 'true', limit: 3, upcoming: 'true' })
      .then(res => setFeaturedEvents(res.data.events))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px',
      }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', textAlign: 'center', position: 'relative' }}>
          <div className="fade-in">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 50, padding: '6px 16px', fontSize: 13, color: '#a78bfa', fontWeight: 600,
              marginBottom: 28,
            }}>
              🤖 Powered by Llama 3 AI · Real-time with Socket.io
            </span>

            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800, lineHeight: 1.1, letterSpacing: -2,
              marginBottom: 24,
            }}>
              Your Campus,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Fully Connected
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
              maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7,
            }}>
              Discover, register, and never miss a campus event again. 
              AI-powered recommendations match you with events that align with your passions.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16 }}>
                Get Started Free →
              </Link>
              <Link to="/events" className="btn btn-secondary btn-lg" style={{ fontSize: 16 }}>
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
          {STATS.map((stat, i) => (
            <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: '#7c3aed' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
                Featured Events
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Handpicked events you can't miss</p>
            </div>
            <div className="events-grid stagger">
              {featuredEvents.map(event => <EventCard key={event._id} event={event} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/events" className="btn btn-secondary">View all events →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              A complete platform built for modern college life
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 10, fontSize: 17 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: 20 }}>
            Ready to dive in?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 16 }}>
            Join 500+ students already using EventHub to stay connected with campus life.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <p>© 2024 EventHub · AI-Powered College Event Management · Built with React, Node.js, MongoDB, Llama 3 & Socket.io</p>
      </footer>
    </div>
  );
}

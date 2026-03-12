import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  technology: '#60a5fa', music: '#f472b6', sports: '#4ade80',
  arts: '#fb923c', science: '#a78bfa', business: '#fbbf24',
  coding: '#34d399', dance: '#f9a8d4', drama: '#c084fc',
  debate: '#93c5fd', gaming: '#86efac', photography: '#fda4af',
  default: '#8888aa',
};

const CATEGORY_EMOJIS = {
  technology: '💻', music: '🎵', sports: '⚽', arts: '🎨',
  science: '🔬', business: '💼', coding: '🖥️', dance: '💃',
  drama: '🎭', debate: '🗣️', gaming: '🎮', photography: '📸',
  food: '🍕', health: '💊', environment: '🌿', other: '✨',
};

export default function EventCard({ event, showAI = false }) {
  const color = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;
  const emoji = CATEGORY_EMOJIS[event.category] || '✨';
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const isFull = spotsLeft <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <Link to={`/events/${event._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        transition: 'all 0.3s ease', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = `${color}44`;
          e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Color Band */}
        <div style={{ height: 6, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

        {/* Image or Gradient Header */}
        <div style={{
          height: 160, position: 'relative',
          background: event.image
            ? `url(${event.image}) center/cover`
            : `linear-gradient(135deg, ${color}22, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {!event.image && (
            <span style={{ fontSize: 56, opacity: 0.6 }}>{emoji}</span>
          )}

          {/* Badges overlay */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {event.isFeatured && (
              <span style={{ background: '#f59e0b', color: '#000', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                ⭐ FEATURED
              </span>
            )}
            {isPast && (
              <span style={{ background: 'rgba(0,0,0,0.6)', color: '#aaa', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                PAST
              </span>
            )}
            {showAI && event.aiScore && (
              <span style={{ background: 'rgba(124,58,237,0.9)', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                🤖 {event.aiScore}% match
              </span>
            )}
          </div>

          {isFull && !isPast && (
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(239,68,68,0.9)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              FULL
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Society & Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {emoji} {event.category}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.society?.name}</span>
            {event.society?.isVerified && <span style={{ fontSize: 11 }}>✓</span>}
          </div>

          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 10, color: 'var(--text-primary)' }}>
            {event.title}
          </h3>

          {showAI && event.aiReason && (
            <p style={{ fontSize: 12, color: '#a78bfa', marginBottom: 10, fontStyle: 'italic' }}>
              💡 {event.aiReason}
            </p>
          )}

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
            {event.shortDescription || event.description?.substring(0, 100)}...
          </p>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {format(new Date(event.date), 'MMM dd, yyyy')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Venue</span>
              <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.venue?.name || 'TBA'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.currentParticipants} registered</span>
              <span style={{ fontSize: 11, color: isFull ? '#ef4444' : 'var(--text-muted)' }}>
                {isFull ? 'Full' : `${spotsLeft} left`}
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%`,
                background: isFull ? '#ef4444' : color,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

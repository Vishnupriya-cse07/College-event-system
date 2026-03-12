import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../Shared/Navbar';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', adminNotes: '', rejectionReason: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getPendingEvents(),
        ]);
        setStats(statsRes.data.stats);
        setPendingEvents(pendingRes.data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      adminAPI.getUsers().then(res => setUsers(res.data.users)).catch(() => {});
    }
  }, [activeTab]);

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      await adminAPI.reviewEvent(reviewModal._id, reviewForm);
      toast.success(`Event ${reviewForm.status}!`);
      setPendingEvents(prev => prev.filter(e => e._id !== reviewModal._id));
      setReviewModal(null);
      // Refresh stats
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch {
      toast.error('Review failed');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await adminAPI.toggleUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to toggle user');
    }
  };

  const handleFeature = async (eventId, isFeatured) => {
    try {
      await adminAPI.featureEvent(eventId, !isFeatured);
      toast.success(isFeatured ? 'Event unfeatured' : 'Event featured! ⭐');
    } catch {
      toast.error('Failed to update');
    }
  };

  const TABS = ['overview', 'pending', 'users'];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
            ⚡ Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Platform management & oversight</p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 40 }}>
          {[
            { label: 'Total Events', value: stats?.totalEvents || 0, icon: '🎭', color: '#7c3aed' },
            { label: 'Pending Approval', value: stats?.pendingEvents || 0, icon: '⏳', color: '#f59e0b', alert: stats?.pendingEvents > 0 },
            { label: 'Students', value: stats?.totalStudents || 0, icon: '🎓', color: '#06b6d4' },
            { label: 'Societies', value: stats?.totalSocieties || 0, icon: '🏛️', color: '#10b981' },
            { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: '🎟️', color: '#f472b6' },
            { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: '📅', color: '#34d399' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', border: s.alert ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.label}</div>
              {s.alert && <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 4, fontWeight: 700 }}>ACTION REQUIRED</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--bg-card)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#7c3aed' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {tab === 'pending' && stats?.pendingEvents > 0 && (
                <span style={{ background: '#f59e0b', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginRight: 6, fontWeight: 800 }}>{stats.pendingEvents}</span>
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>Recent Pending Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(stats?.recentEvents || []).map(event => (
                <div key={event._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{event.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>by {event.society?.name} · {format(new Date(event.createdAt || Date.now()), 'MMM dd, yyyy')}</div>
                  </div>
                  <span className="badge badge-amber">Pending</span>
                  <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(event); setActiveTab('pending'); }}>Review</button>
                </div>
              ))}
              {(!stats?.recentEvents || stats.recentEvents.length === 0) && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>✅ No pending events</div>
              )}
            </div>

            {/* Category Distribution */}
            {stats?.categoryCounts?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>Events by Category</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.categoryCounts.map(({ _id, count }) => {
                    const maxCount = Math.max(...stats.categoryCounts.map(c => c.count));
                    return (
                      <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 120, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', textAlign: 'right' }}>{_id}</div>
                        <div style={{ flex: 1, height: 32, background: 'var(--bg-card)', borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 12, transition: 'width 0.8s ease' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Events Tab */}
        {activeTab === 'pending' && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>
              Events Pending Approval ({pendingEvents.length})
            </h2>
            {pendingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: 8 }}>All caught up!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>No events pending approval</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pendingEvents.map(event => (
                  <div key={event._id} className="card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{event.title}</h3>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          🏛️ {event.society?.name} · 📅 {event.date && format(new Date(event.date), 'MMM dd, yyyy')} · ⏰ {event.time}
                          <br />📍 {event.venue?.name} · 👥 Max {event.maxParticipants} participants · 🏷️ {event.category}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/events/${event._id}`} className="btn btn-secondary btn-sm">View →</Link>
                        <button className="btn btn-primary btn-sm" onClick={() => { setReviewModal(event); setReviewForm({ status: 'approved', adminNotes: '', rejectionReason: '' }); }}>
                          Review
                        </button>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                      {event.description?.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>User Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>{u.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'society' ? 'badge-cyan' : 'badge-amber'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                        {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleUser(u._id)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No users found</div>}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131f', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 520, padding: 32 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Review Event</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{reviewModal.title}</p>

            <div className="form-group">
              <label className="form-label">Decision</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['approved', 'rejected'].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, status: s }))} style={{
                    padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: 14,
                    background: reviewForm.status === s ? (s === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'var(--bg-secondary)',
                    border: reviewForm.status === s ? `2px solid ${s === 'approved' ? '#10b981' : '#ef4444'}` : '2px solid transparent',
                    color: reviewForm.status === s ? (s === 'approved' ? '#10b981' : '#ef4444') : 'var(--text-secondary)',
                  }}>
                    {s === 'approved' ? '✅ Approve' : '❌ Reject'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes (optional)</label>
              <textarea className="form-input" rows={3} placeholder="Internal notes..." value={reviewForm.adminNotes} onChange={e => setReviewForm(f => ({ ...f, adminNotes: e.target.value }))} />
            </div>

            {reviewForm.status === 'rejected' && (
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-input" rows={3} placeholder="Explain why this event is being rejected..." value={reviewForm.rejectionReason} onChange={e => setReviewForm(f => ({ ...f, rejectionReason: e.target.value }))} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: 14 }} onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: 14, background: reviewForm.status === 'rejected' ? '#ef4444' : '#7c3aed' }} onClick={handleReview}>
                {reviewForm.status === 'approved' ? '✅ Approve Event' : '❌ Reject Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

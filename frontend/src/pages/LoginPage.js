import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const demoLogins = [
    { role: 'student', email: 'student@demo.com', password: 'demo123', label: '🎓 Student Demo' },
    { role: 'society', email: 'society@demo.com', password: 'demo123', label: '🏛️ Society Demo' },
    { role: 'admin', email: 'admin@demo.com', password: 'demo123', label: '⚙️ Admin Demo' },
  ];

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F1A',padding:'24px' }}>
      <div style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.15) 0%, transparent 70%)',position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none' }} />
      <div style={{ width:'100%',maxWidth:'440px',position:'relative',zIndex:1 }}>
        <div style={{ textAlign:'center',marginBottom:'40px' }}>
          <div style={{ fontSize:'3rem',marginBottom:'12px' }}>⚡</div>
          <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'2.2rem',background:'linear-gradient(135deg,#6C63FF,#FF6584)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'8px' }}>EventHub</h1>
          <p style={{ color:'#9999BB',fontSize:'0.95rem' }}>AI-Powered College Event Management</p>
        </div>

        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'20px',padding:'32px' }}>
          <h2 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'24px',fontSize:'1.3rem' }}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%',padding:'12px',background:'linear-gradient(135deg,#6C63FF,#5A52E0)',border:'none',borderRadius:'10px',color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginBottom:'16px',opacity:loading?0.7:1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ borderTop:'1px solid rgba(108,99,255,0.2)',paddingTop:'16px',marginTop:'8px' }}>
            <p style={{ fontSize:'0.8rem',color:'#9999BB',marginBottom:'10px',textAlign:'center' }}>Quick Demo Access</p>
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {demoLogins.map(d => (
                <button key={d.role} onClick={()=>setForm({email:d.email,password:d.password})}
                  style={{ padding:'8px 12px',background:'rgba(108,99,255,0.08)',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'8px',color:'#9999BB',cursor:'pointer',fontSize:'0.82rem',textAlign:'left' }}>
                  {d.label} — {d.email}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center',marginTop:'20px',color:'#9999BB',fontSize:'0.85rem' }}>
            No account? <Link to="/register" style={{ color:'#6C63FF',fontWeight:600,textDecoration:'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

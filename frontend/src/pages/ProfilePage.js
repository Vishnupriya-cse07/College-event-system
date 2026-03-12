import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const INTERESTS = ['technical','cultural','sports','academic','workshop','hackathon','music','dance','photography','debate','coding','design'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'' });
  const [interests, setInterests] = useState(user?.interests||[]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i) => setInterests(prev => prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { ...form, interests });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const roleIcon = { student:'🎓', society:'🏛️', admin:'⚙️' };
  const roleColor = { student:'#6C63FF', society:'#43D9AD', admin:'#FF6584' };

  return (
    <div style={{ padding:'24px',maxWidth:'700px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'24px' }}>👤 Profile</h1>

      <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(255,101,132,0.1))',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'20px',padding:'24px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'20px' }}>
        <div style={{ width:'72px',height:'72px',borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#FF6584)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',fontWeight:700,color:'white' }}>
          {(user?.name||'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontFamily:'Syne',fontWeight:700,fontSize:'1.3rem',marginBottom:'4px' }}>{user?.societyName||user?.name}</h2>
          <div style={{ display:'flex',gap:'10px',alignItems:'center' }}>
            <span style={{ padding:'4px 12px',borderRadius:'20px',fontSize:'0.8rem',fontWeight:700,background:`${roleColor[user?.role]}22`,color:roleColor[user?.role] }}>
              {roleIcon[user?.role]} {user?.role}
            </span>
            {user?.department && <span style={{ fontSize:'0.82rem',color:'#9999BB' }}>{user.department} · Year {user.year}</span>}
          </div>
        </div>
      </div>

      <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'16px' }}>
        <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'16px' }}>Basic Info</h3>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        </div>
      </div>

      {user?.role === 'student' && (
        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'16px',padding:'24px',marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'Syne',fontWeight:700,marginBottom:'6px' }}>🎯 Interests</h3>
          <p style={{ fontSize:'0.82rem',color:'#9999BB',marginBottom:'14px' }}>These help AI recommend relevant events for you</p>
          <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
            {INTERESTS.map(interest => (
              <button type="button" key={interest} onClick={()=>toggleInterest(interest)} style={{
                padding:'6px 14px',borderRadius:'20px',border:'1px solid',cursor:'pointer',fontSize:'0.82rem',fontWeight:500,transition:'all 0.15s',
                borderColor:interests.includes(interest)?'#6C63FF':'rgba(108,99,255,0.2)',
                background:interests.includes(interest)?'rgba(108,99,255,0.2)':'transparent',
                color:interests.includes(interest)?'#6C63FF':'#9999BB' }}>
                {interest}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex',justifyContent:'flex-end' }}>
        <button onClick={handleSave} disabled={loading} style={{ padding:'12px 32px',background:'linear-gradient(135deg,#6C63FF,#5A52E0)',border:'none',borderRadius:'10px',color:'white',fontWeight:700,cursor:'pointer',opacity:loading?0.7:1 }}>
          {loading?'Saving...':'Save Changes'}
        </button>
      </div>
    </div>
  );
}

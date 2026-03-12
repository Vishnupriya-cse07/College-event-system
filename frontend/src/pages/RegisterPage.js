import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INTERESTS = ['technical','cultural','sports','academic','workshop','hackathon','music','dance','photography','debate','coding','design'];
const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','Arts','Science'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'',email:'',password:'',role:'student',studentId:'',department:'',year:'',societyName:'',societyCategory:'',societyDescription:'' });
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (i) => setInterests(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev,i]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, interests });
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F1A',padding:'24px' }}>
      <div style={{ width:'100%',maxWidth:'520px',position:'relative',zIndex:1 }}>
        <div style={{ textAlign:'center',marginBottom:'32px' }}>
          <h1 style={{ fontFamily:'Syne',fontWeight:800,fontSize:'2rem',background:'linear-gradient(135deg,#6C63FF,#FF6584)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>⚡ EventHub</h1>
          <p style={{ color:'#9999BB',fontSize:'0.9rem' }}>Create your account</p>
        </div>
        <div style={{ background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.2)',borderRadius:'20px',padding:'32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px' }}>
              <div className="form-group" style={{ margin:0 }}>
                <label>Full Name</label>
                <input placeholder="John Doe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label>Role</label>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="student">Student</option>
                  <option value="society">Society</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="email@college.edu" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
            </div>

            {form.role === 'student' && (<>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px' }}>
                <div className="form-group" style={{ margin:0 }}>
                  <label>Student ID</label>
                  <input placeholder="STU001" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})} />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label>Department</label>
                  <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label>Year</label>
                  <select value={form.year} onChange={e=>setForm({...form,year:e.target.value})}>
                    <option value="">Year</option>
                    {[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Interests (select all that apply)</label>
                <div style={{ display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'4px' }}>
                  {INTERESTS.map(interest => (
                    <button type="button" key={interest} onClick={()=>toggleInterest(interest)}
                      style={{ padding:'5px 12px',borderRadius:'20px',border:'1px solid',cursor:'pointer',fontSize:'0.8rem',fontWeight:500,
                        borderColor:interests.includes(interest)?'#6C63FF':'rgba(108,99,255,0.2)',
                        background:interests.includes(interest)?'rgba(108,99,255,0.2)':'transparent',
                        color:interests.includes(interest)?'#6C63FF':'#9999BB' }}>
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {form.role === 'society' && (<>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px' }}>
                <div className="form-group" style={{ margin:0 }}>
                  <label>Society Name</label>
                  <input placeholder="Tech Society" value={form.societyName} onChange={e=>setForm({...form,societyName:e.target.value})} />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label>Category</label>
                  <select value={form.societyCategory} onChange={e=>setForm({...form,societyCategory:e.target.value})}>
                    <option value="">Select</option>
                    {['technical','cultural','sports','academic','social'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Society Description</label>
                <textarea rows={3} placeholder="About your society..." value={form.societyDescription} onChange={e=>setForm({...form,societyDescription:e.target.value})} />
              </div>
            </>)}

            <button type="submit" disabled={loading} style={{ width:'100%',padding:'12px',background:'linear-gradient(135deg,#6C63FF,#5A52E0)',border:'none',borderRadius:'10px',color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',opacity:loading?0.7:1 }}>
              {loading?'Creating Account...':'Create Account'}
            </button>
          </form>
          <p style={{ textAlign:'center',marginTop:'16px',color:'#9999BB',fontSize:'0.85rem' }}>
            Have an account? <Link to="/login" style={{ color:'#6C63FF',fontWeight:600,textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

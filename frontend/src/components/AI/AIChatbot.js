import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm EveBot 🤖 Your AI assistant for college events. Ask me anything!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={()=>setOpen(!open)} style={{
        position:'fixed',bottom:'24px',right:'24px',width:'56px',height:'56px',
        borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#FF6584)',
        border:'none',cursor:'pointer',fontSize:'1.5rem',
        boxShadow:'0 8px 24px rgba(108,99,255,0.4)',zIndex:500,
        transition:'transform 0.2s'
      }}
        onMouseEnter={e=>e.target.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.target.style.transform='scale(1)'}
      >🤖</button>

      {open && (
        <div style={{ position:'fixed',bottom:'90px',right:'24px',width:'360px',background:'#1A1A2E',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'20px',boxShadow:'0 16px 48px rgba(0,0,0,0.6)',zIndex:500,display:'flex',flexDirection:'column',height:'480px' }}>
          <div style={{ padding:'16px 20px',borderBottom:'1px solid rgba(108,99,255,0.2)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(108,99,255,0.1)',borderRadius:'20px 20px 0 0' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#6C63FF,#FF6584)',display:'flex',alignItems:'center',justifyContent:'center' }}>🤖</div>
              <div>
                <div style={{ fontWeight:700,fontSize:'0.9rem',fontFamily:'Syne' }}>EveBot AI</div>
                <div style={{ fontSize:'0.72rem',color:'#43D9AD' }}>● Online</div>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:'none',border:'none',color:'#9999BB',cursor:'pointer',fontSize:'1.2rem' }}>×</button>
          </div>

          <div style={{ flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'80%',padding:'10px 14px',borderRadius:msg.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background:msg.role==='user'?'linear-gradient(135deg,#6C63FF,#5A52E0)':'#1E1E35',
                  color:msg.role==='user'?'white':'#E8E8F0',fontSize:'0.85rem',lineHeight:1.5
                }}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex',justifyContent:'flex-start' }}>
                <div style={{ padding:'10px 14px',background:'#1E1E35',borderRadius:'16px 16px 16px 4px',color:'#9999BB',fontSize:'0.85rem' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding:'12px',borderTop:'1px solid rgba(108,99,255,0.2)',display:'flex',gap:'8px' }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Ask EveBot anything..."
              style={{ flex:1,background:'#1E1E35',border:'1px solid rgba(108,99,255,0.3)',borderRadius:'10px',padding:'8px 12px',color:'#E8E8F0',fontSize:'0.85rem',outline:'none' }} />
            <button onClick={send} style={{ padding:'8px 14px',background:'#6C63FF',border:'none',borderRadius:'10px',color:'white',cursor:'pointer',fontWeight:600,fontSize:'0.85rem' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

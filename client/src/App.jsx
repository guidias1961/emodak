import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './RetroSpace.css';

const ENV_URL = import.meta.env.VITE_API_URL;
const API_URL = ENV_URL ? ENV_URL : 'http://localhost:5000/api';

function App() {
  const [wallet, setWallet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const [profile, setProfile] = useState({
    display_name: 'Sad Emo',
    status: 'Waiting for connection...',
    bio: '<b>About me:</b><br>I have no soul yet.',
    avatar_url: 'https://placehold.co/400x400/200052/FFF?text=Sad+Emo',
    interests: 'Crypto, Monad, Tears',
    music_url: ''
  });
  const [formData, setFormData] = useState({});

  // Verifica se já conectou antes ao carregar a página
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                const address = await accounts[0].getAddress();
                setWallet(address);
                loadProfile(address);
            }
        } catch (e) { console.log("Não conectado automaticamente"); }
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setStatusMsg('Check your wallet...');
    
    try {
      if (!window.ethereum) throw new Error("No wallet found. Install Rabby/Metamask.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      // Pede permissão explícita
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setWallet(address);
      setStatusMsg('Loading profile...');
      await loadProfile(address);
      
    } catch (error) {
      console.error(error);
      alert("Connection failed: " + error.message);
    } finally {
      setIsLoading(false);
      setStatusMsg('');
    }
  };

  const loadProfile = async (addr) => {
    try {
      // Adiciona timestamp para evitar cache do navegador
      const res = await axios.get(`${API_URL}/user/${addr}?t=${Date.now()}`);
      if(res.data) {
         setProfile(prev => ({...prev, ...res.data}));
         setFormData(prev => ({...prev, ...res.data}));
      }
    } catch (e) { 
      console.error("API Error:", e); 
      // Não trava a UI se a API falhar, só loga
    }
  };

  const handleSave = async () => {
    if(!wallet) return;
    try {
      const payload = { ...formData, wallet_address: wallet };
      const res = await axios.post(`${API_URL}/user`, payload);
      setProfile(res.data);
      setIsEditing(false);
    } catch (e) { alert("Save failed."); }
  };

  return (
    <div className="master-container">
      <div className="monad-nav">
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'18px', fontWeight:'bold'}}>💜 EMODAK SPACE</span>
        </div>
        <div>
            {wallet ? 
                <span style={{color:'#fff', fontWeight:'bold'}}>USER: {wallet.substring(0,6)}...</span> : 
                <button onClick={connectWallet} disabled={isLoading} style={{padding:'5px 15px', cursor:'pointer', background:'white', border:'none', fontWeight:'bold'}}>
                    {isLoading ? statusMsg || 'Connecting...' : '[ CONNECT WALLET ]'}
                </button>
            }
        </div>
      </div>

      <div className="content-grid">
        {/* COLUNA ESQUERDA */}
        <div className="left-col">
          <h2 style={{marginTop:0}}>{profile.display_name}</h2>
          
          <div className="profile-pic-box">
             <img src={profile.avatar_url} onError={(e)=>{e.target.src='https://placehold.co/400?text=Error'}} className="profile-pic" />
          </div>

          <div className="status-text">
             "{profile.status}"<br/>
             <span style={{color:'green', fontSize:'12px'}}>● Online</span>
          </div>

          <div className="contact-box">
             <div className="contact-header">Contacting {profile.display_name}</div>
             <div className="contact-grid">
                <span className="fake-link">Message</span> <span className="fake-link">Add Friend</span>
             </div>
          </div>
          
          <div className="contact-box" style={{marginTop:'10px'}}>
             <div className="contact-header">Url</div>
             <div style={{padding:'5px', fontSize:'11px'}}>myspace.com/{wallet ? wallet.substring(0,8) : 'guest'}</div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="right-col">
           <div style={{border:'1px solid #ccc', padding:'15px', background:'white', marginBottom:'20px', boxShadow:'2px 2px 5px #eee'}}>
              <b>{profile.display_name}</b> is in your extended network.
           </div>

           {wallet && (
               <div style={{textAlign:'right'}}>
                   <button onClick={() => setIsEditing(true)} style={{background:'#200052', color:'white', border:'none', padding:'8px 15px', cursor:'pointer'}}>Edit Profile</button>
               </div>
           )}

           <div className="orange-header">Interests</div>
           <div className="blurb-text">{profile.interests}</div>

           <div className="orange-header">About Me</div>
           <div className="blurb-text" dangerouslySetInnerHTML={{__html: profile.bio}} />

           <div className="orange-header">Friend Space</div>
           <div className="friend-grid">
               {[1,2,3,4,5,6,7,8].map(i => (
                   <div key={i} className="friend-card">
                       <img src={`https://placehold.co/150/200052/FFF?text=Friend+${i}`} />
                       <span style={{display:'block', marginTop:'5px', fontWeight:'bold', color:'#200052'}}>Emo {i}</span>
                   </div>
               ))}
           </div>
        </div>
      </div>

      {isEditing && (
        <>
            <div className="overlay" onClick={() => setIsEditing(false)}></div>
            <div className="edit-panel">
                <h3>Edit Profile</h3>
                <input placeholder="Name" value={formData.display_name || ''} onChange={e=>setFormData({...formData, display_name: e.target.value})} />
                <input placeholder="Status" value={formData.status || ''} onChange={e=>setFormData({...formData, status: e.target.value})} />
                <input placeholder="Avatar URL" value={formData.avatar_url || ''} onChange={e=>setFormData({...formData, avatar_url: e.target.value})} />
                <input placeholder="Interests" value={formData.interests || ''} onChange={e=>setFormData({...formData, interests: e.target.value})} />
                <textarea rows="5" placeholder="Bio" value={formData.bio || ''} onChange={e=>setFormData({...formData, bio: e.target.value})} />
                <button onClick={handleSave} style={{background:'#200052', color:'white', padding:'10px', border:'none', width:'100%'}}>SAVE CHANGES</button>
            </div>
        </>
      )}
    </div>
  );
}

export default App;

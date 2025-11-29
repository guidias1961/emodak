import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './RetroSpace.css';

// URL DO BACKEND (Se rodar localmente é essa, se for deploy, mude aqui)
// Se existir variável de ambiente usa ela, senão usa localhost (para seus testes locais)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [wallet, setWallet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do Perfil
  const [profile, setProfile] = useState({
    display_name: 'Anonymous Emo',
    status: 'Needs to connect wallet...',
    bio: 'Loading sadness...',
    avatar_url: 'https://placehold.co/200',
    interests: 'Crypto, Monad',
    music_url: ''
  });

  // Estado Temporário para Formulário
  const [formData, setFormData] = useState({});

  // 1. Conectar Carteira
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install Rabby or Metamask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet(address);
    loadProfile(address);
  };

  // 2. Carregar Perfil
  const loadProfile = async (addr) => {
    try {
      const res = await axios.get(`${API_URL}/user/${addr}`);
      setProfile(res.data);
      setFormData(res.data);
    } catch (e) { console.error("Error loading profile"); }
  };

  // 3. Salvar
  const handleSave = async () => {
    try {
      const res = await axios.post(`${API_URL}/user`, {
        ...formData,
        wallet_address: wallet
      });
      setProfile(res.data);
      setIsEditing(false);
    } catch (e) { alert("Failed to save. Too much traffic?"); }
  };

  return (
    <div className="master-container">
      {/* --- NAVBAR --- */}
      <div className="monad-nav">
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
             <img src="/emodak-logo.png" height="20" alt="logo" />
             <b>EMODAK SPACE</b>
        </div>
        <div>
            {wallet ? 
                <span>Logged as: {wallet.substring(0,6)}...</span> : 
                <button onClick={connectWallet}>[ Connect Wallet ]</button>
            }
        </div>
      </div>

      <div className="content-grid">
        {/* --- COLUNA ESQUERDA (FOTO & INFO) --- */}
        <div className="left-col">
          <h2 style={{margin:'0 0 10px 0'}}>{profile.display_name}</h2>
          
          <div className="profile-pic-box">
             <img src={profile.avatar_url} className="profile-pic" alt="avatar" />
          </div>

          <div className="status-text">
             "{profile.status}"<br/>
             <img src="https://i.imgur.com/L7E17m6.gif" alt="online" style={{marginTop:'5px'}}/>
          </div>

          {/* Contact Box */}
          <div className="contact-box">
             <div className="contact-header">Contacting {profile.display_name}</div>
             <div className="contact-grid">
                <a href="#">Message</a> <a href="#">Forward</a>
                <a href="#">Add Friend</a> <a href="#">Block</a>
             </div>
          </div>

          <div className="contact-box">
             <div className="contact-header">MySpace URL</div>
             <div style={{padding:'5px', fontSize:'10px'}}>
                myspace.com/{wallet ? wallet.substring(0,8) : 'guest'}
             </div>
          </div>

          {/* Music Player Mockup */}
          {profile.music_url && (
              <div style={{marginTop: '20px', border:'1px solid #000', padding:'5px', background:'#eee'}}>
                  <marquee scrollamount="3" style={{fontSize:'10px'}}>♫ Now Playing: Emo Anthem ♫</marquee>
                  <audio controls src={profile.music_url} style={{width:'100%', height:'20px'}} />
              </div>
          )}
        </div>

        {/* --- COLUNA DIREITA (CONTEÚDO) --- */}
        <div className="right-col">
           <div style={{border:'1px solid #ccc', padding:'10px', background:'white', marginBottom:'10px'}}>
              <b>{profile.display_name}</b> is in your extended network.
           </div>

           {wallet && (
               <div style={{textAlign:'right'}}>
                   <button className="btn-retro" onClick={() => setIsEditing(true)}>Edit Profile</button>
               </div>
           )}

           <div className="orange-header">{profile.display_name}'s Interests</div>
           <div className="blurb-text">
               <span className="section-label">General:</span> {profile.interests}
           </div>

           <div className="orange-header">{profile.display_name}'s Details</div>
           <div className="blurb-text">
               <span className="section-label">About me:</span>
               <div dangerouslySetInnerHTML={{__html: profile.bio}} /> 
               {/* Cuidado com XSS em produção, aqui é só exemplo */}
           </div>

           <div className="orange-header">{profile.display_name}'s Friend Space</div>
           <div className="blurb-text">
               <b>{profile.display_name} has 1337 friends.</b>
               
               <div className="friend-grid">
                   {/* Amigos Estáticos (Simulação) */}
                   <div className="friend-card">
                       <span className="friend-name">Tom</span>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Tom_Anderson_2011.jpg/220px-Tom_Anderson_2011.jpg" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Keone</span>
                       <img src="https://pbs.twimg.com/profile_images/1749830603063664640/AwD5pX35_400x400.jpg" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Cobie</span>
                       <img src="https://pbs.twimg.com/profile_images/1795509939556814848/LgE60XyZ_400x400.jpg" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Pepe</span>
                       <img src="https://i.seadn.io/s/raw/files/42a1219d94943719992f085734293e50.png" />
                   </div>
               </div>
           </div>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      {isEditing && (
        <>
            <div className="overlay" onClick={() => setIsEditing(false)}></div>
            <div className="edit-panel">
                <h3 style={{marginTop:0}}>Edit Your Emo Persona</h3>
                
                <label>Display Name:</label>
                <input value={formData.display_name} onChange={e=>setFormData({...formData, display_name: e.target.value})} />
                
                <label>Status:</label>
                <input value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} />
                
                <label>Avatar URL (Imgur/Link):</label>
                <input value={formData.avatar_url} onChange={e=>setFormData({...formData, avatar_url: e.target.value})} />

                <label>Interests:</label>
                <input value={formData.interests} onChange={e=>setFormData({...formData, interests: e.target.value})} />
                
                <label>Bio (HTML allowed):</label>
                <textarea rows="4" value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} />

                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                    <button className="btn-retro" style={{fontWeight:'bold'}} onClick={handleSave}>Save Changes</button>
                    <button className="btn-retro" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </div>
        </>
      )}
    </div>
  );
}

export default App;

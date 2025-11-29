import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './RetroSpace.css';

// URL SEGURA: Se não tiver variável, tenta localhost, mas não quebra
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Perfil Inicial Padrão
  const [profile, setProfile] = useState({
    display_name: 'Sad Emo',
    status: 'Offline...',
    bio: '<b>About me:</b><br>I have no soul yet.',
    avatar_url: 'https://placehold.co/200x200/200052/FFF?text=Emo',
    interests: 'Crypto, Monad, Tears',
    music_url: ''
  });
  
  const [formData, setFormData] = useState({});

  // FUNÇÃO DE CONEXÃO DIRETA
  const handleConnect = async () => {
    setLoading(true);
    try {
        if(!window.ethereum) throw new Error("No Wallet Found! Install Rabby or MetaMask.");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Isso força o popup da carteira a abrir
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        
        setWallet(address);
        await loadProfile(address);

    } catch (err) {
        alert("Connection Error: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const loadProfile = async (address) => {
      try {
          const res = await axios.get(`${API_URL}/user/${address}`);
          if(res.data) {
              setProfile(prev => ({...prev, ...res.data}));
              setFormData(prev => ({...prev, ...res.data}));
          }
      } catch (e) {
          console.log("API offline ou novo usuário. Usando dados locais.");
          setProfile(prev => ({...prev, status: "Connected (No API)"}));
      }
  };

  const handleSave = async () => {
      if(!wallet) return alert("Connect first!");
      try {
          const payload = { ...formData, wallet_address: wallet };
          const res = await axios.post(`${API_URL}/user`, payload);
          setProfile(res.data);
          setIsEditing(false);
      } catch (e) {
          alert("Erro ao salvar no banco. (API Check)");
      }
  };

  return (
    <div className="master-container">
      {/* NAVBAR */}
      <div className="monad-nav">
          <div>💜 <b>EMODAK SPACE</b></div>
          <div>
              {!wallet ? (
                  <button onClick={handleConnect} className="connect-btn">
                      {loading ? 'WAIT...' : '[ LOGIN / CONNECT ]'}
                  </button>
              ) : (
                  <span>User: {wallet.substring(0,6)}...</span>
              )}
          </div>
      </div>

      <div className="content-grid">
          {/* ESQUERDA */}
          <div className="left-col">
              <span className="profile-name">{profile.display_name}</span>
              
              <div className="profile-pic-box">
                  <img src={profile.avatar_url} className="profile-pic" alt="User" 
                       onError={(e)=>{e.target.src='https://placehold.co/200?text=Error'}}/>
              </div>

              <div className="status-box">
                  "{profile.status}"<br/>
                  <img src="https://i.imgur.com/L7E17m6.gif" width="15" style={{verticalAlign:'middle'}}/> 
                  <span style={{fontSize:'9px'}}> Last Login: Today</span>
              </div>

              <div className="contact-box">
                  <div className="contact-header">Contacting {profile.display_name}</div>
                  <div className="contact-links">
                      <a>Message</a> <a>Forward</a>
                      <a>Add Friend</a> <a>Block</a>
                  </div>
              </div>
              
              <div style={{marginTop:'10px', fontSize:'10px'}}>
                  <b>MySpace URL:</b><br/>
                  myspace.com/{wallet ? wallet.substring(0,8) : 'guest'}
              </div>
          </div>

          {/* DIREITA */}
          <div className="right-col">
              <div className="network-banner">
                  {profile.display_name} is in your extended network.
              </div>

              {wallet && (
                  <div style={{textAlign:'right', marginBottom:'10px'}}>
                      <button onClick={()=>setIsEditing(!isEditing)}>[ Edit Profile ]</button>
                  </div>
              )}

              {isEditing && (
                  <div style={{border:'2px dashed purple', padding:'10px', background:'#f0f0f0', marginBottom:'10px'}}>
                      <b>Editing Mode:</b><br/>
                      <input placeholder="Name" onChange={e=>setFormData({...formData, display_name: e.target.value})} /><br/>
                      <input placeholder="Status" onChange={e=>setFormData({...formData, status: e.target.value})} /><br/>
                      <input placeholder="Avatar URL" onChange={e=>setFormData({...formData, avatar_url: e.target.value})} /><br/>
                      <button onClick={handleSave}>Save</button>
                  </div>
              )}

              <div className="orange-header">{profile.display_name}'s Interests</div>
              <div className="blurb-content">
                  <span className="section-label">General:</span> {profile.interests}
              </div>

              <div className="orange-header">{profile.display_name}'s Details</div>
              <div className="blurb-content" dangerouslySetInnerHTML={{__html: profile.bio}} />

              <div className="orange-header">{profile.display_name}'s Friend Space</div>
              <div className="blurb-content">
                  <span className="friend-count">{profile.display_name} has 666 friends.</span>
                  
                  <div className="friend-grid">
                      <div className="friend-card">
                          <span className="friend-name">Tom</span>
                          <img src="https://placehold.co/100/200052/FFF?text=Tom" />
                      </div>
                      <div className="friend-card">
                          <span className="friend-name">Keone</span>
                          <img src="https://placehold.co/100/200052/FFF?text=Keone" />
                      </div>
                      <div className="friend-card">
                          <span className="friend-name">Pepe</span>
                          <img src="https://placehold.co/100/200052/FFF?text=Pepe" />
                      </div>
                      <div className="friend-card">
                          <span className="friend-name">WIF</span>
                          <img src="https://placehold.co/100/200052/FFF?text=WIF" />
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './RetroSpace.css';

// Força o uso da URL do Railway se estiver em produção, senão usa localhost
// IMPORTANTE: Não coloque barra / no final dessa string no railway variable, ou o código abaixo trata
const ENV_URL = import.meta.env.VITE_API_URL;
const API_URL = ENV_URL ? ENV_URL : 'http://localhost:5000/api';

console.log("🔌 API URL Configurada:", API_URL); // Para debug no F12

function App() {
  const [wallet, setWallet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    display_name: 'Anonymous Emo',
    status: 'Disconnect form reality...',
    bio: '<b>About me:</b><br>I have no soul yet.',
    avatar_url: 'https://placehold.co/400x400/200052/FFF?text=Sad+Emo',
    interests: 'Crypto, Monad, Tears',
    music_url: ''
  });

  const [formData, setFormData] = useState({});

  // 1. Conectar Carteira com DEBUG
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        alert("ERRO: Nenhuma carteira detectada! Instale a Rabby ou MetaMask.");
        setIsLoading(false);
        return;
      }

      // Solicita conexão
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      console.log("✅ Carteira conectada:", address);
      setWallet(address);
      
      // Busca perfil
      await loadProfile(address);
      
    } catch (error) {
      console.error("❌ Erro ao conectar:", error);
      alert(`Erro ao conectar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Carregar Perfil
  const loadProfile = async (addr) => {
    try {
      console.log(`📡 Buscando dados em: ${API_URL}/user/${addr}`);
      const res = await axios.get(`${API_URL}/user/${addr}`);
      
      // Se tiver dados, atualiza. Se for novo, usa o padrão misturado com o retorno
      if(res.data) {
         setProfile(prev => ({...prev, ...res.data}));
         setFormData(prev => ({...prev, ...res.data}));
      }
    } catch (e) { 
      console.error("❌ Erro na API:", e);
      // Não alerta o usuário para não assustar, mas loga no console
    }
  };

  // 3. Salvar
  const handleSave = async () => {
    try {
      const payload = { ...formData, wallet_address: wallet };
      const res = await axios.post(`${API_URL}/user`, payload);
      setProfile(res.data);
      setIsEditing(false);
      alert("Profile updated... whatever.");
    } catch (e) { 
      alert("Failed to save. Server might be sleeping.");
      console.error(e);
    }
  };

  return (
    <div className="master-container">
      {/* --- NAVBAR --- */}
      <div className="monad-nav">
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
             {/* Certifique-se que emodak-logo.png está na pasta public */}
             <span style={{fontSize:'14px'}}>💜 <b>EMODAK SPACE</b></span>
        </div>
        <div>
            {wallet ? 
                <span style={{color:'#ccc'}}>Logged: {wallet.substring(0,6)}...</span> : 
                <button onClick={connectWallet} style={{cursor:'pointer'}}>
                    {isLoading ? 'Connecting...' : '[ Connect Wallet ]'}
                </button>
            }
        </div>
      </div>

      <div className="content-grid">
        {/* --- COLUNA ESQUERDA --- */}
        <div className="left-col">
          <h2 style={{margin:'0 0 10px 0', fontSize:'18px'}}>{profile.display_name}</h2>
          
          <div className="profile-pic-box">
             {/* Fallback para imagem se a URL quebrar */}
             <img 
                src={profile.avatar_url} 
                onError={(e) => {e.target.src='https://placehold.co/400x400/000/FFF?text=Image+Error'}}
                className="profile-pic" 
                alt="avatar" 
             />
          </div>

          <div className="status-text">
             "{profile.status}"<br/>
             <span style={{color:'green', fontSize:'10px'}}>● Online</span>
          </div>

          <div className="contact-box">
             <div className="contact-header">Contacting {profile.display_name}</div>
             <div className="contact-grid">
                <span className="fake-link">Message</span> <span className="fake-link">Forward</span>
                <span className="fake-link">Add Friend</span> <span className="fake-link">Block</span>
             </div>
          </div>

          <div className="contact-box">
             <div className="contact-header">MySpace URL</div>
             <div style={{padding:'5px', fontSize:'10px', wordBreak:'break-all'}}>
                myspace.com/{wallet ? wallet.substring(0,6) : 'guest'}
             </div>
          </div>
        </div>

        {/* --- COLUNA DIREITA --- */}
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
           </div>

           <div className="orange-header">{profile.display_name}'s Friend Space</div>
           <div className="blurb-text">
               <b>{profile.display_name} has 666 friends.</b>
               
               <div className="friend-grid">
                   {/* Placeholders seguros que não quebram */}
                   <div className="friend-card">
                       <span className="friend-name">Tom</span>
                       <img src="https://placehold.co/100/200052/FFF?text=Tom" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Keone</span>
                       <img src="https://placehold.co/100/200052/FFF?text=Keone" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Vitalik</span>
                       <img src="https://placehold.co/100/200052/FFF?text=Vitalik" />
                   </div>
                   <div className="friend-card">
                       <span className="friend-name">Pepe</span>
                       <img src="https://placehold.co/100/200052/FFF?text=Pepe" />
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
                <h3 style={{marginTop:0}}>Edit Your Persona</h3>
                
                <label>Display Name:</label>
                <input value={formData.display_name || ''} onChange={e=>setFormData({...formData, display_name: e.target.value})} />
                
                <label>Status:</label>
                <input value={formData.status || ''} onChange={e=>setFormData({...formData, status: e.target.value})} />
                
                <label>Avatar URL (Imgur/Link):</label>
                <input value={formData.avatar_url || ''} onChange={e=>setFormData({...formData, avatar_url: e.target.value})} />

                <label>Interests:</label>
                <input value={formData.interests || ''} onChange={e=>setFormData({...formData, interests: e.target.value})} />
                
                <label>Bio (HTML allowed):</label>
                <textarea rows="4" value={formData.bio || ''} onChange={e=>setFormData({...formData, bio: e.target.value})} />

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

import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './index.css'

function App() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('mp4')
  const [isPlaylist, setIsPlaylist] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  
  // Progress states
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [taskId, setTaskId] = useState(null)

  // Tauri Window instance
  const appWindow = getCurrentWindow();

  // Clear status toast after 5 seconds
  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  // Handle Server-Sent Events (SSE) for real-time progress
  useEffect(() => {
    if (!taskId) return;

    const eventSource = new EventSource(`http://localhost:8080/progress/${taskId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.percent || 0);
      setProgressMsg(data.message || '');

      if (data.status === 'finished') {
        setStatus({ type: 'success', message: 'Download concluído! Verifique a pasta.' });
        setLoading(false);
        setTaskId(null);
        setUrl('');
        eventSource.close();
      } else if (data.status === 'error') {
        setStatus({ type: 'error', message: data.message || 'Erro durante o download.' });
        setLoading(false);
        setTaskId(null);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setStatus({ type: 'error', message: 'Conexão com o servidor perdida.' });
      setLoading(false);
      setTaskId(null);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url) {
      setStatus({ type: 'error', message: 'Por favor, insira o link do YouTube.' })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })
    setProgress(0)
    setProgressMsg('Conectando ao servidor...')

    try {
      const response = await fetch('http://localhost:8080/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, is_playlist: isPlaylist })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar o download')
      }

      const data = await response.json()
      setTaskId(data.task_id)

    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Servidor offline ou inacessível.' })
      setLoading(false)
    }
  }

  return (
    <div className="app-window">
      
      {/* 1. Global Sidebar (Leftmost) */}
      <div className="sidebar-global">
        <div className="window-controls" data-tauri-drag-region>
          <div className="mac-btn btn-close" onClick={() => appWindow.close()}></div>
          <div className="mac-btn btn-min" onClick={() => appWindow.minimize()}></div>
          <div className="mac-btn btn-max" onClick={() => appWindow.toggleMaximize()}></div>
        </div>
        
        <div className="nav-icons">
          <div className="nav-icon brand-logo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </div>
          <div className="nav-icon active">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
        </div>
      </div>

      {/* 2. Inner Sidebar (Menu) */}
      <div className="sidebar-inner">
        <h2>Downloads</h2>
        <ul className="menu-list">
          <li className="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Novo Download
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path></svg>
            Vídeos Baixados
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            Músicas (MP3)
          </li>
        </ul>
        
        {/* Audio Wave from Figma Mockup */}
        <div className="audio-wave-container">
          <div className="wave"></div>
        </div>
      </div>

      {/* 3. Main Content */}
      <div className="main-content">
        <div className="top-bar" data-tauri-drag-region>
          <div className="url-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Cole o link do YouTube aqui..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <div className="banner">
          <h1>YT Downloader Premium</h1>
          <p>Baixe vídeos, áudios e playlists com qualidade máxima.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="section">
            <div className="section-header">
              <h3>Configurações de Download</h3>
            </div>
            <div className="cards-grid">
              
              <div className="feature-card">
                <h4>Formato</h4>
                <p>Escolha entre Vídeo HD ou apenas Áudio.</p>
                <div className="select-wrapper" style={{ marginTop: 'auto' }}>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={loading}>
                    <option value="mp4">🎬 Vídeo Alta Qualidade (MP4)</option>
                    <option value="mp3">🎵 Apenas Áudio (MP3)</option>
                  </select>
                </div>
              </div>

              <div className="feature-card">
                <h4>Modo Playlist</h4>
                <p>Ative para baixar todos os vídeos de uma playlist.</p>
                <div className="toggle-group" style={{ marginTop: 'auto' }}>
                  <span>Baixar Playlist inteira</span>
                  <label className="switch">
                    <input type="checkbox" checked={isPlaylist} onChange={(e) => setIsPlaylist(e.target.checked)} disabled={loading} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {!loading ? (
                <button type="submit" className="feature-card download-btn-card" disabled={loading}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '10px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Processar Download
                </button>
              ) : (
                <div className="feature-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <h4>Processando...</h4>
                  <p>Aguarde o início do download</p>
                </div>
              )}

            </div>
          </div>
        </form>

        {loading && (
          <div className="section">
            <div className="section-header">
              <h3>Status do Download</h3>
            </div>
            <div className="progress-container">
              <div className="progress-header">
                <span>{progressMsg}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Right Sidebar (Profile/Activity) */}
      <div className="sidebar-right">
        <div className="right-top-icons" data-tauri-drag-region>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </div>

        <div className="profile-card">
          <div className="avatar-ring">
            <div className="avatar">🤓</div>
          </div>
          <h3>Sophie Fortune</h3>
          <p>@sophiefortune</p>
        </div>

        <div className="list-section">
          <h4>Últimos Downloads</h4>
          
          <div className="list-item">
            <div className="list-avatar">🎵</div>
            <div className="list-info">
              <h5>Mix de Lo-Fi</h5>
              <p>Baixado há 2 min</p>
            </div>
          </div>
          
          <div className="list-item">
            <div className="list-avatar">🎬</div>
            <div className="list-info">
              <h5>Curso React Tauri</h5>
              <p>Baixado há 26 min</p>
            </div>
          </div>
          
          <div className="list-item">
            <div className="list-avatar">🎧</div>
            <div className="list-info">
              <h5>Podcast Flow</h5>
              <p>Baixado há 1 hora</p>
            </div>
          </div>

        </div>
      </div>

      <div className={`toast ${status.type} ${status.message ? 'show' : ''}`}>
        {status.type === 'success' ? '✅' : '⚠️'} {status.message}
      </div>

    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
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
      setStatus({ type: 'error', message: 'Por favor, cole o link do YouTube.' })
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })
    setProgress(0)
    setProgressMsg('Iniciando comunicação com o servidor...')

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
      setTaskId(data.task_id) // Triggers the SSE useEffect

    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Servidor offline ou inacessível.' })
      setLoading(false)
    }
  }

  return (
    <div className="layout-wrapper">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="glass-card fade-in">
        <header className="card-header">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </div>
          <div>
            <h1 className="title">YT Downloader</h1>
            <p className="subtitle">Extraia vídeos e áudios com qualidade suprema.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="form-layout">
          
          <div className="input-group">
            <label htmlFor="url">Link do Conteúdo</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <input 
                type="text" 
                id="url" 
                placeholder="https://youtu.be/..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="controls-row">
            <div className="input-group flex-1">
              <label htmlFor="format">Formato de Saída</label>
              <div className="select-wrapper">
                <select id="format" value={format} onChange={(e) => setFormat(e.target.value)} disabled={loading}>
                  <option value="mp4">🎬 Vídeo Alta Qualidade (MP4)</option>
                  <option value="mp3">🎵 Apenas Áudio (MP3)</option>
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div className="toggle-group">
              <label className="toggle-label">Modo Playlist</label>
              <label className="switch">
                <input type="checkbox" checked={isPlaylist} onChange={(e) => setIsPlaylist(e.target.checked)} disabled={loading} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Dynamic Area: Shows Button OR Progress Bar */}
          {!loading ? (
            <button type="submit" className="btn-primary" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Processar Download
            </button>
          ) : (
            <div className="progress-container fade-in">
              <div className="progress-header">
                <span className="progress-text">{progressMsg}</span>
                <span className="progress-percent">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="progress-glow" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </form>

        <div className={`toast ${status.type} ${status.message ? 'show' : ''}`}>
          {status.type === 'success' ? '✅' : '⚠️'} {status.message}
        </div>
      </main>
    </div>
  )
}

export default App

# 🚀 YT Downloader Premium

Um aplicativo completo (Full-Stack) para download de vídeos, áudios e playlists do YouTube com qualidade máxima, organização automática de pastas e uma interface de usuário moderna e fluida.

Este projeto substitui a antiga implementação em Golang por uma arquitetura robusta em **Python (Flask)** combinada com um frontend moderno em **React (Vite)**.

## ✨ Funcionalidades Principais

* 🎨 **Interface Premium (Glassmorphism):** Design moderno com efeitos de vidro translúcido, gradientes dinâmicos e notificações integradas.
* 📊 **Barra de Progresso Real-Time:** Acompanhe a porcentagem exata e o status do download em tempo real graças a uma conexão assíncrona com o servidor via **Server-Sent Events (SSE)**.
* 📁 **Organização Inteligente:** Os downloads são separados automaticamente nas pastas `downloads/Video`, `downloads/MP3` e subpastas nomeadas para `Playlists`.
* 🛡️ **Bypass de Restrições:** Configuração avançada do `yt-dlp` simulando clientes Web, Android e iOS para burlar o famoso "Erro 403" do YouTube.
* 🎧 **Suporte a YouTube Mix:** Tratamento especial de strings nativo do Windows para evitar erros de I/O e limites de caracteres (MAX_PATH) ao extrair centenas de vídeos.
* 🎥 **Integração com FFmpeg:** Extração de áudio e união de faixas de vídeo em altíssima qualidade (192kbps para MP3).

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* React.js (via Vite)
* CSS Vanilla (Design Customizado)
* Fetch API nativa para SSE

**Backend:**
* Python 3
* Flask & Flask-CORS (Rotas e Server-Sent Events)
* yt-dlp (Motor de Download)
* Multi-Threading (Para evitar bloqueios de API durante downloads)

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js (Para o frontend React/Vite)
* Python 3.8+ (Para o backend)
* FFmpeg instalado e adicionado às variáveis de ambiente (ou configurado no arquivo `downloader_service.py`).

### 1. Backend (Python/Flask)
Abra um terminal na pasta `backend`:
```bash
# Crie e ative o ambiente virtual
python -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate

# Instale as dependências
pip install flask flask-cors yt-dlp

# Inicie o servidor
python app.py
```
O backend estará rodando na porta `http://localhost:8080`.

### 2. Frontend (React/Vite)
Abra um novo terminal na pasta `frontend`:
```bash
# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:5173`.

## 🤝 Contribuição
Sinta-se à vontade para fazer um fork, abrir issues ou enviar Pull Requests! Melhorias no design, refatorações ou novos extratores de vídeo são muito bem-vindos.

---
Feito com 💻 e ☕.

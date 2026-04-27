import os
from pathlib import Path

class DownloaderService:
    def __init__(self, handler):
        self.handler = handler
        # Busca o ffmpeg do winget como fallback
        self.ffmpeg_path = r"C:\Users\guuii\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
        if not os.path.exists(self.ffmpeg_path):
            self.ffmpeg_path = None

    def get_default_dir(self, format_type, is_playlist):
        base_dir = os.path.abspath('downloads')
        if is_playlist:
            return os.path.join(base_dir, 'Playlists')
        elif format_type == 'mp3':
            return os.path.join(base_dir, 'MP3')
        else:
            return os.path.join(base_dir, 'Video')

    def download(self, url, format_type, output_dir=None, is_playlist=False, progress_hook=None, logger=None):
        if not output_dir:
            output_dir = self.get_default_dir(format_type, is_playlist)
        else:
            output_dir = os.path.abspath(output_dir)

        if is_playlist:
            # Usa fallback para Mixes e deixa o yt-dlp cuidar da formatação e limites
            outtmpl = '%(playlist_title|Mix)s/%(title)s.%(ext)s'
        else:
            outtmpl = '%(title)s.%(ext)s'

        ydl_opts = {
            'paths': {'home': output_dir},
            'outtmpl': outtmpl,
            'noplaylist': not is_playlist,
            'restrictfilenames': True,
            'windowsfilenames': True,
            'trim_file_name': 200,
            'quiet': True,
            'no_color': True,
        }

        if self.ffmpeg_path:
            ydl_opts['ffmpeg_location'] = self.ffmpeg_path

        if format_type == 'mp3':
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            })
        else:
            ydl_opts.update({
                'format': 'best[ext=mp4]/best',
            })

        # Resolvendo problema de runtime de JS e desafios EJS do YouTube
        ydl_opts['js_runtimes'] = {'node': {}}
        ydl_opts['remote_components'] = ['ejs:github']

        ydl_opts['extractor_args'] = {
            'youtube': {
                'player_client': ['web', 'android'],
                'skip': ['webpage', 'configs']
            }
        }

        # Novas tentativas de burlar o bloqueio do YouTube
        ydl_opts.update({
            'nocheckcertificate': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        })

        # Carrega cookies de um arquivo cookies.txt se ele existir na raiz do backend
        cookies_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'cookies.txt'))
        if os.path.exists(cookies_file):
            ydl_opts['cookiefile'] = cookies_file


        if progress_hook:
            ydl_opts['progress_hooks'] = [progress_hook]
            
        if logger:
            ydl_opts['logger'] = logger

        self.handler.download(url, ydl_opts)

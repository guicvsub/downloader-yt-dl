import yt_dlp

class YtDlpHandler:
    def download(self, url, options):
        print(f"Opções enviadas ao yt-dlp: {options}")
        with yt_dlp.YoutubeDL(options) as ydl:
            ydl.download([url])

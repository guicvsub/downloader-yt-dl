import sys

class CLIController:
    def __init__(self, service):
        self.service = service

    def handle(self):
        if len(sys.argv) < 3:
            print("Uso: python app.py <formato (mp3|mp4)> <URL> [diretorio] [playlist (true/false)]")
            sys.exit(1)

        format_type = sys.argv[1]
        url = sys.argv[2]
        output_dir = sys.argv[3] if len(sys.argv) >= 4 else None
        is_playlist = sys.argv[4].lower() == 'true' if len(sys.argv) >= 5 else False

        print(f"Iniciando download de {url} em formato {format_type}...")
        try:
            self.service.download(url, format_type, output_dir, is_playlist)
            print("Download concluído com sucesso!")
        except Exception as e:
            print(f"Erro: {e}")
            sys.exit(1)

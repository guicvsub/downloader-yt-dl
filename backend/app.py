import sys
from flask import Flask
from infra.ytdlp_handler import YtDlpHandler
from service.downloader_service import DownloaderService
from controller.api_controller import create_api_blueprint
from controller.cli_controller import CLIController

def main():
    handler = YtDlpHandler()
    service = DownloaderService(handler)

    # Se houver argumentos (além do nome do arquivo), roda como CLI
    if len(sys.argv) > 1:
        cli = CLIController(service)
        cli.handle()
    else:
        from flask_cors import CORS

        # Caso contrário, inicia o servidor Flask
        app = Flask(__name__)
        CORS(app) # Habilita CORS para o frontend
        api_blueprint = create_api_blueprint(service)
        app.register_blueprint(api_blueprint)
        
        print("Servidor Flask rodando em http://localhost:8080")
        app.run(port=8080, debug=True)

if __name__ == "__main__":
    main()

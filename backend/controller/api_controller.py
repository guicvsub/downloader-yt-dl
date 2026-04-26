import uuid
import threading
import time
import json
from flask import Blueprint, request, jsonify, Response, stream_with_context

progress_store = {}

def create_api_blueprint(service):
    api = Blueprint('api', __name__)

    @api.route('/download', methods=['POST'])
    def handle_download():
        data = request.json
        url = data.get('url')
        format_type = data.get('format')
        output_dir = data.get('output_dir')
        is_playlist = data.get('is_playlist', False)

        if not url or not format_type:
            return jsonify({'error': 'URL e formato são obrigatórios'}), 400

        task_id = str(uuid.uuid4())
        progress_store[task_id] = {'status': 'starting', 'percent': 0, 'message': 'Iniciando extração...'}

        class MyLogger:
            def debug(self, msg):
                # O yt-dlp manda mensagens de status como debug
                if "Downloading item" in msg or "Extracting" in msg or "Downloading webpage" in msg:
                    # Só atualiza a mensagem se não estivermos no meio de um download rápido
                    if progress_store[task_id]['status'] == 'starting':
                        clean_msg = msg.replace('\x1b[0;94m', '').replace('\x1b[0m', '').strip()
                        progress_store[task_id]['message'] = f"Extraindo: {clean_msg}"
            def info(self, msg):
                pass
            def warning(self, msg):
                pass
            def error(self, msg):
                print(f"YT-DLP Error: {msg}")

        def progress_hook(d):
            if d['status'] == 'downloading':
                percent_str = d.get('_percent_str', '0%').strip()
                clean_percent = percent_str.replace('%', '').split('m')[-1].replace('\x1b[0', '')
                try:
                    percent = float(clean_percent)
                except ValueError:
                    percent = 0
                
                # Pega informações do arquivo atual na playlist (ex: 1 de 50)
                playlist_index = d.get('info_dict', {}).get('playlist_index')
                playlist_count = d.get('info_dict', {}).get('playlist_count')
                
                prefix = ""
                if playlist_index and playlist_count:
                    prefix = f"[{playlist_index}/{playlist_count}] "

                progress_store[task_id] = {
                    'status': 'downloading', 
                    'percent': percent, 
                    'message': f"{prefix}Baixando: {percent_str}"
                }
            elif d['status'] == 'finished':
                progress_store[task_id]['status'] = 'processing'
                progress_store[task_id]['percent'] = 100
                progress_store[task_id]['message'] = 'Processando arquivo final (FFmpeg)...'

        def background_task():
            try:
                # Passa o MyLogger via kwargs se o service.download permitisse, mas vamos injetar depois.
                # Para evitar alterar a assinatura de service.download, passamos o logger e hook juntos:
                service.download(url, format_type, output_dir, is_playlist, progress_hook, MyLogger())
                progress_store[task_id]['status'] = 'finished'
                progress_store[task_id]['message'] = 'Download concluído com sucesso!'
            except Exception as e:
                import traceback
                traceback.print_exc()
                progress_store[task_id]['status'] = 'error'
                progress_store[task_id]['message'] = str(e)

        threading.Thread(target=background_task).start()

        return jsonify({'task_id': task_id, 'message': 'Download iniciado em segundo plano'})

    @api.route('/progress/<task_id>', methods=['GET'])
    def get_progress(task_id):
        def generate():
            while True:
                if task_id in progress_store:
                    data = progress_store[task_id]
                    yield f"data: {json.dumps(data)}\n\n"
                    if data['status'] in ['finished', 'error']:
                        # Removemos da memória após 5 segundos para não vazar memória
                        time.sleep(5)
                        progress_store.pop(task_id, None)
                        break
                else:
                    yield f"data: {json.dumps({'status': 'error', 'message': 'Tarefa não encontrada'})}\n\n"
                    break
                time.sleep(0.5)
        return Response(stream_with_context(generate()), mimetype='text/event-stream')

    return api

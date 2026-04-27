import yt_dlp
import json
import sys

def extract_media_info(url: str) -> str:
    """
    Extracts information from a YouTube video or playlist using yt-dlp.
    Returns a JSON string containing the requested metadata.
    """
    ydl_opts = {
        'extract_flat': 'in_playlist', # Extrai informações de playlists rapidamente
        'quiet': True,                 # Não mostra logs no console
        'skip_download': True,         # Não faz download do vídeo
        'ignoreerrors': True,          # Pula vídeos indisponíveis/privados sem travar
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            
            if not info_dict:
                raise Exception("Mídia indisponível. Pode estar privada ou ter sido removida por direitos autorais.")

            result = {
                "success": True,
                "data": {}
            }
            
            if 'entries' in info_dict:
                # Trata-se de uma playlist
                entries = info_dict.get('entries', [])
                valid_entries = [e for e in entries if e]
                
                playlist_thumb = info_dict.get('thumbnail')
                if not playlist_thumb and info_dict.get('thumbnails'):
                    playlist_thumb = info_dict['thumbnails'][0]['url']

                if not playlist_thumb and valid_entries:
                    first_entry = valid_entries[0]
                    playlist_thumb = first_entry.get('thumbnail')
                    if not playlist_thumb and first_entry.get('thumbnails'):
                        playlist_thumb = first_entry['thumbnails'][0]['url']

                result["data"] = {
                    "type": "playlist",
                    "playlist_name": info_dict.get('title'),
                    "video_count": len(valid_entries),
                    "thumbnail": playlist_thumb,
                    "videos": []
                }
                
                for entry in valid_entries:
                    thumbnail = entry.get('thumbnail')
                    if not thumbnail and entry.get('thumbnails'):
                        thumbnail = entry['thumbnails'][0]['url']
                        
                    result["data"]["videos"].append({
                        "title": entry.get('title'),
                        "duration": entry.get('duration'),
                        "thumbnail": thumbnail,
                        "url": entry.get('url') or entry.get('webpage_url')
                    })
            else:
                # Trata-se de um único vídeo
                thumbnail = info_dict.get('thumbnail')
                if not thumbnail and info_dict.get('thumbnails'):
                    thumbnail = info_dict['thumbnails'][0]['url']
                    
                result["data"] = {
                    "type": "video",
                    "title": info_dict.get('title'),
                    "duration": info_dict.get('duration'),
                    "thumbnail": thumbnail,
                    "url": info_dict.get('webpage_url') or info_dict.get('url')
                }
                
            return json.dumps(result, indent=2, ensure_ascii=False)
            
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        }, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Forneça uma URL como argumento."}))
        sys.exit(1)
        
    media_url = sys.argv[1]
    print(extract_media_info(media_url))

import os
import logging
import shutil
import time
import tempfile
from typing import Any, cast
from flask import Flask, request, jsonify, send_file, send_from_directory, Response
from flask_cors import CORS
import yt_dlp

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DOWNLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'streamvault_downloads')
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

def get_ffmpeg_path() -> str | None:
    """Finds FFmpeg on system PATH or dynamically loads bundled imageio-ffmpeg."""
    path = shutil.which("ffmpeg")
    if path:
        return path
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            return str(exe)
    except Exception as e:
        logger.warning(f"Could not load imageio_ffmpeg: {e}")
    return None

def get_video_info(url: str) -> dict[str, Any] | None:
    """Extracts metadata and formats for any public YouTube or Shorts URL."""
    ydl_opts: dict[str, Any] = {
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],
            }
        },
    }
    ffmpeg_exe = get_ffmpeg_path()
    if ffmpeg_exe:
        ydl_opts['ffmpeg_location'] = ffmpeg_exe

    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return cast(dict[str, Any], info)
        except Exception as e:
            logger.error(f"Error extracting video info: {e}")
            return None

@app.route('/')
def index():
    if os.path.exists('templates/index.html'):
        return send_from_directory('templates', 'index.html')
    return send_from_directory('.', 'index.html')

@app.route('/api/info', methods=['POST'])
def video_info():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    data = cast(dict[str, Any] | None, request.get_json(silent=True))
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    url_raw = data.get('url')
    url = str(url_raw).strip() if url_raw is not None else ''
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    info = get_video_info(url)
    if info is None:
        return jsonify({'error': 'Could not fetch video information. Please check the URL and ensure the video is public.'}), 400

    duration_value = info.get('duration', 0)
    duration_seconds = int(duration_value) if isinstance(duration_value, (int, float)) else 0

    # Clean, guaranteed formats for user selection
    formats = [
        # Audio Options
        {
            'format_id': 'best-audio-mp3',
            'extension': 'mp3',
            'resolution': 'Audio (320kbps)',
            'filesize': 'Studio Master',
            'type': 'audio',
            'note': '320kbps MP3',
            'has_audio': True
        },
        {
            'format_id': 'best-audio-m4a',
            'extension': 'm4a',
            'resolution': 'Audio (AAC)',
            'filesize': 'Lossless Stream',
            'type': 'audio',
            'note': '256kbps AAC',
            'has_audio': True
        },
        # Video Options
        {
            'format_id': 'best-1080p',
            'extension': 'mp4',
            'resolution': '1080p',
            'filesize': 'Full HD',
            'type': 'video',
            'note': '1080p 60fps',
            'has_audio': True
        },
        {
            'format_id': 'best-720p',
            'extension': 'mp4',
            'resolution': '720p',
            'filesize': 'HD Quality',
            'type': 'video',
            'note': '720p HD',
            'has_audio': True
        },
        {
            'format_id': 'best-480p',
            'extension': 'mp4',
            'resolution': '480p',
            'filesize': 'Standard',
            'type': 'video',
            'note': '480p SD',
            'has_audio': True
        },
        {
            'format_id': 'best-360p',
            'extension': 'mp4',
            'resolution': '360p',
            'filesize': 'Fast Mobile',
            'type': 'video',
            'note': '360p Mobile',
            'has_audio': True
        }
    ]

    result: dict[str, Any] = {
        'title': str(info.get('title') or 'YouTube Media'),
        'thumbnail': str(info.get('thumbnail') or ''),
        'channel': str(info.get('uploader') or info.get('channel') or 'YouTube Creator'),
        'duration': str(info.get('duration_string') or '0:00'),
        'views': int(info.get('view_count') or 0),
        'upload_date': str(info.get('upload_date') or ''),
        'is_shorts': 'shorts' in url.lower() or duration_seconds <= 60,
        'formats': formats,
        'original_url': url
    }
    
    return jsonify(result)

def process_media_download(url: str, format_id: str, media_type: str) -> tuple[str, str]:
    """Downloads requested media and converts to MP3/MP4, returning (file_path, safe_filename)."""
    ffmpeg_path = get_ffmpeg_path()
    postprocessors: list[dict[str, Any]] = []
    merge_output_format = None

    if media_type == 'audio' or 'mp3' in format_id or 'audio' in format_id:
        # High quality audio extraction
        if ffmpeg_path:
            selected_format = 'bestaudio/best/18'
            postprocessors.append({
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            })
        else:
            selected_format = 'bestaudio[ext=m4a]/bestaudio/18/best'
    else:
        # Video resolution matching
        height = 1080
        if '720' in format_id:
            height = 720
        elif '480' in format_id:
            height = 480
        elif '360' in format_id:
            height = 360

        if ffmpeg_path:
            selected_format = (
                f"bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]/"
                f"bestvideo[height<={height}]+bestaudio/"
                f"best[height<={height}][ext=mp4]/"
                f"best[height<={height}]/"
                f"18/best"
            )
            merge_output_format = 'mp4'
        else:
            selected_format = (
                f"best[height<={height}][ext=mp4]/"
                f"best[height<={height}]/"
                f"18/best"
            )

    ydl_opts: dict[str, Any] = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'restrictfilenames': True,
        'format': selected_format,
        'retries': 15,
        'fragment_retries': 15,
        'socket_timeout': 45,
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],
            }
        },
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }

    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = ffmpeg_path
    if merge_output_format and ffmpeg_path:
        ydl_opts['merge_output_format'] = merge_output_format
    if postprocessors:
        ydl_opts['postprocessors'] = postprocessors

    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        info = ydl.extract_info(url, download=True)
        if not info:
            raise RuntimeError("Unable to download media stream. Please try again.")

        raw_filename = str(ydl.prepare_filename(info))
        saved_filename = raw_filename

        # If audio conversion ran, extension becomes .mp3
        if (media_type == 'audio' or 'mp3' in format_id) and ffmpeg_path:
            base_path = str(os.path.splitext(raw_filename)[0])
            mp3_path = base_path + ".mp3"
            if os.path.exists(mp3_path):
                saved_filename = mp3_path

        # Fallback search if exact name shifted
        if not os.path.exists(saved_filename):
            base_path = str(os.path.splitext(raw_filename)[0])
            for ext in ['.mp3', '.mp4', '.m4a', '.webm', '.opus']:
                cand = base_path + ext
                if os.path.exists(cand):
                    saved_filename = cand
                    break

        if not os.path.exists(saved_filename):
            raise FileNotFoundError("Processed media file could not be located on server.")

        actual_filename = os.path.basename(saved_filename)
        return saved_filename, actual_filename

@app.route('/api/stream-download', methods=['GET'])
def stream_download():
    """Direct single-request stream download. Immune to serverless container isolation."""
    url = request.args.get('url', '').strip()
    format_id = request.args.get('format_id', 'best-audio-mp3').strip()
    media_type = request.args.get('media_type', 'audio').strip().lower()

    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        file_path, filename = process_media_download(url, format_id, media_type)
        mimetype = 'audio/mpeg' if filename.endswith('.mp3') else 'video/mp4'
        if filename.endswith('.m4a'):
            mimetype = 'audio/mp4'

        response: Response = send_file(file_path, as_attachment=True, download_name=filename, mimetype=mimetype)

        def remove_file() -> None:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.error(f"Error cleaning file {file_path}: {e}")

        response.call_on_close(remove_file)
        return response
    except Exception as e:
        logger.error(f"Stream download error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_media():
    """Prepares download and provides direct streaming URL."""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    data = cast(dict[str, Any] | None, request.get_json(silent=True))
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
        
    url_raw = data.get('url')
    format_id_raw = data.get('format_id')
    media_type_raw = data.get('media_type')
    url = str(url_raw).strip() if url_raw is not None else ''
    format_id = str(format_id_raw).strip() if format_id_raw is not None else 'best-audio-mp3'
    media_type = str(media_type_raw).strip().lower() if media_type_raw is not None else 'audio'
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        file_path, filename = process_media_download(url, format_id, media_type)
        return jsonify({
            'success': True,
            'filename': filename,
            'download_url': f'/api/stream-download?url={url}&format_id={format_id}&media_type={media_type}'
        })
    except Exception as e:
        logger.error(f"Download API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-file/<filename>')
def serve_downloaded_file(filename: str):
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(DOWNLOAD_FOLDER, safe_filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File expired or not found. Please try downloading again.'}), 404
        
    try:
        mimetype = 'audio/mpeg' if safe_filename.endswith('.mp3') else 'video/mp4'
        response: Response = send_file(file_path, as_attachment=True, download_name=safe_filename, mimetype=mimetype)

        def remove_file() -> None:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.error(f"Error deleting served file: {e}")

        response.call_on_close(remove_file)
        return response
    except Exception as e:
        logger.error(f"Error serving file: {e}")
        return jsonify({'error': 'Error serving file'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

import os
import json
import logging
import shutil
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import yt_dlp

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DOWNLOAD_FOLDER = 'downloads'
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

def get_video_info(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'best',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return info
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
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    info = get_video_info(url)
    if info is None:
        return jsonify({'error': 'Could not fetch video information. Please check the URL.'}), 400

    # Extract relevant details
    formats = []
    seen_resolutions = set()
    
    # Check for FFmpeg presence
    ffmpeg_active = shutil.which("ffmpeg") is not None

    # Separate collection to handle DASH vs Combined more smartly
    final_video_list = []
    final_audio_list = []
    
    # Track which resolutions we've already added to avoid duplicates
    resolutions_seen = set()
    
    formats_data = info.get('formats', []) if info else []
    
    unique_audio = []
    aud_seen = set()
    
    # Sort formats by size recursively to get best raw size
    def get_size(fmt):
        return fmt.get('filesize') or fmt.get('filesize_approx') or 0
        
    sorted_formats = sorted(formats_data, key=get_size, reverse=True)

    for f in sorted_formats:
        v_c = str(f.get('vcodec', 'none'))
        a_c = str(f.get('acodec', 'none'))
        is_v = v_c != 'none'
        is_a = a_c != 'none'
        
        # We only care about audio formats for StreamVault
        if is_v or not is_a:
            continue
            
        sz_v = get_size(f)
        sz_str = "Unknown"
        if sz_v > 0:
            sz_mb = sz_v / (1024 * 1024)
            sz_str = f"{sz_mb:.2f} MB"

        f_obj = {
            'format_id': str(f.get('format_id')),
            'extension': str(f.get('ext', 'unknown')),
            'resolution': 'Audio',
            'filesize': sz_str,
            'type': 'audio',
            'note': str(f.get('format_note', 'Standard')),
            'has_audio': True,
            'needs_ffmpeg': False,
            'raw_size': sz_v,
            'displayRes': 'Audio'
        }
        
        a_key = f"{f_obj['extension']}_{f_obj['filesize']}"
        if a_key not in aud_seen:
            aud_seen.add(a_key)
            unique_audio.append(f_obj)
            
        if len(unique_audio) >= 12:
            break

    formats = unique_audio

    # Filter and sort formats to show unique resolutions and best audio
    result = {
        'title': str(info.get('title') or 'Unknown'),
        'thumbnail': str(info.get('thumbnail') or ''),
        'channel': str(info.get('uploader') or 'Unknown'),
        'duration': str(info.get('duration_string') or '0:00'),
        'views': int(info.get('view_count') or 0),
        'upload_date': str(info.get('upload_date') or ''),
        'is_shorts': 'shorts' in url.lower() or (info.get('duration', 0) <= 60 if info else False),
        'formats': formats,
        'original_url': url
    }
    
    return jsonify(result)

@app.route('/api/download', methods=['POST'])
def download_audio():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
        
    url = data.get('url')
    format_id = data.get('format_id')
    
    if not url or not format_id:
        return jsonify({'error': 'URL and format_id are required'}), 400

    # Check for ffmpeg (needed for MP3 conversion)
    ffmpeg_path = shutil.which("ffmpeg")
    
    ydl_opts = {
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'restrictfilenames': True,
        'format': f'{format_id}/bestaudio/best',
        'retries': 15,                 # Increased retries
        'fragment_retries': 15,
        'socket_timeout': 60,          # Increased for slower connections
        'noprogress': True,
        'quiet': True,
        'no_color': True,
        'ignoreerrors': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
    }
    
    # If FFmpeg is available, convert to MP3 for maximum compatibility
    if ffmpeg_path:
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '320',
        }]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Perform the actual download
            info = ydl.extract_info(url, download=True)
            if info is None:
                return jsonify({'error': 'Could not extract info for download'}), 400

            saved_filename = str(ydl.prepare_filename(info))
            
            # After FFmpeg post-processing, the extension changes to .mp3
            if ffmpeg_path:
                base_path = str(os.path.splitext(saved_filename)[0])
                mp3_path = base_path + ".mp3"
                if os.path.exists(mp3_path):
                    saved_filename = mp3_path
            
            # Fallback: if the expected file doesn't exist, search for it
            if not os.path.exists(saved_filename):
                base_path = str(os.path.splitext(saved_filename)[0])
                for ext in ['.mp3', '.m4a', '.webm', '.ogg', '.opus', '.wav']:
                    candidate = base_path + ext
                    if os.path.exists(candidate):
                        saved_filename = candidate
                        break
            
            actual_filename = os.path.basename(saved_filename)

            return jsonify({
                'success': True, 
                'filename': actual_filename,
            })
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Download error: {e}")
        return jsonify({'error': error_msg}), 500

import time
def cleanup_old_files():
    """Deletes files in the downloads folder older than 10 minutes."""
    try:
        if not os.path.exists(DOWNLOAD_FOLDER):
            return
            
        now = time.time()
        for filename in os.listdir(DOWNLOAD_FOLDER):
            file_path = os.path.join(DOWNLOAD_FOLDER, filename)
            # Security: Don't accidentally go out of directory
            if os.path.isfile(file_path):
                # If file is older than 10 minutes (600 seconds)
                if os.stat(file_path).st_mtime < now - 600:
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        logger.error(f"Error removing old file {file_path}: {e}")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

@app.route('/api/download-file/<filename>')
def serve_downloaded_file(filename):
    # Run cleanup of old files
    cleanup_old_files()
    
    # Security: sanitize filename
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(DOWNLOAD_FOLDER, safe_filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File expired or not found. Please try downloading again.'}), 404
        
    try:
        return send_from_directory(DOWNLOAD_FOLDER, safe_filename, as_attachment=True)
    except Exception as e:
        logger.error(f"Error serving file: {e}")
        return jsonify({'error': 'Error serving file'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

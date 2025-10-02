from flask import Flask, render_template, jsonify, send_from_directory
from pathlib import Path
import re
import base64
from io import BytesIO
from PIL import Image
from flask_apscheduler import APScheduler
import requests
import os
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'manga-novel-reader-secret-key'

# Cấu hình APScheduler
app.config['SCHEDULER_API_ENABLED'] = True
scheduler = APScheduler()

# Đường dẫn data
DATA_PATH = Path("data")

def natural_sort_key(text):
    """Sắp xếp tự nhiên"""
    return [int(c) if c.isdigit() else c.lower() for c in re.split(r'(\d+)', str(text))]

def get_image_base64(image_path, max_width=None):
    """Chuyển ảnh sang base64"""
    try:
        img = Image.open(image_path)
        if max_width and img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except:
        return None

def keep_alive():
    """Gửi request đến ứng dụng để giữ cho nó không bị sleep"""
    try:
        app_url = os.environ.get('APP_URL', 'https://manga-manager-uqlj.onrender.com/')
        response = requests.get(f"{app_url}/keep-alive")
        print(f"Keep-alive request sent. Status: {response.status_code}")
    except Exception as e:
        print(f"Keep-alive error: {str(e)}")

@app.route('/keep-alive')
def keep_alive_endpoint():
    """Endpoint để kiểm tra trạng thái hoạt động"""
    return jsonify({"status": "alive"}), 200

@app.route('/')
def index():
    """Màn hình chính"""
    return render_template('index.html')

@app.route('/api/series')
def get_series():
    """API lấy danh sách series"""
    if not DATA_PATH.exists():
        return jsonify([])
    
    series_list = []
    for series_dir in sorted(DATA_PATH.iterdir(), key=lambda x: natural_sort_key(x.name)):
        if series_dir.is_dir():
            key_visual_path = series_dir / "Key_Visual.png"
            series_data = {
                'name': series_dir.name,
                'has_manga': (series_dir / "manga").exists(),
                'has_novel': (series_dir / "novel").exists(),
                'key_visual': get_image_base64(key_visual_path, 300) if key_visual_path.exists() else None
            }
            series_list.append(series_data)
    
    return jsonify(series_list)

@app.route('/api/manga/<series_name>')
def get_manga_chapters(series_name):
    """API lấy danh sách chapters manga"""
    manga_path = DATA_PATH / series_name / "manga"
    
    if not manga_path.exists():
        return jsonify([])
    
    chapters = []
    for chapter_dir in sorted(manga_path.iterdir(), key=lambda x: natural_sort_key(x.name)):
        if chapter_dir.is_dir():
            chapters.append(chapter_dir.name)
    
    return jsonify(chapters)

@app.route('/api/manga/<series_name>/<chapter_name>')
def get_manga_chapter_content(series_name, chapter_name):
    """API lấy nội dung chapter manga"""
    chapter_path = DATA_PATH / series_name / "manga" / chapter_name
    
    if not chapter_path.exists():
        return jsonify({'error': 'Chapter not found'}), 404
    
    images = []
    for img_path in sorted(chapter_path.iterdir(), key=lambda x: natural_sort_key(x.name)):
        if img_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
            img_base64 = get_image_base64(img_path, 1100)
            if img_base64:
                images.append(img_base64)
    
    return jsonify({
        'series': series_name,
        'chapter': chapter_name,
        'images': images
    })

@app.route('/api/novel/<series_name>')
def get_novel_arcs(series_name):
    """API lấy danh sách arcs và chapters novel"""
    novel_path = DATA_PATH / series_name / "novel"
    
    if not novel_path.exists():
        return jsonify([])
    
    arcs = []
    for arc_dir in sorted(novel_path.iterdir(), key=lambda x: natural_sort_key(x.name)):
        if arc_dir.is_dir():
            chapters = []
            for chapter_dir in sorted(arc_dir.iterdir(), key=lambda x: natural_sort_key(x.name)):
                if chapter_dir.is_dir():
                    chapters.append(chapter_dir.name)
            
            arcs.append({
                'name': arc_dir.name,
                'chapters': chapters
            })
    
    return jsonify(arcs)

@app.route('/api/novel/<series_name>/<arc_name>/<chapter_name>')
def get_novel_chapter_content(series_name, arc_name, chapter_name):
    """API lấy nội dung chapter novel"""
    chapter_path = DATA_PATH / series_name / "novel" / arc_name / chapter_name
    
    if not chapter_path.exists():
        return jsonify({'error': 'Chapter not found'}), 404
    
    text_content = []
    images = []
    
    for file_path in sorted(chapter_path.iterdir(), key=lambda x: natural_sort_key(x.name)):
        if file_path.suffix.lower() == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text_content.append(f.read())
            except:
                pass
        elif file_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
            img_base64 = get_image_base64(file_path, 800)
            if img_base64:
                images.append(img_base64)
    
    return jsonify({
        'series': series_name,
        'arc': arc_name,
        'chapter': chapter_name,
        'text': '\n\n'.join(text_content),
        'images': images
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False') == 'True'
    
    # Khởi tạo scheduler
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        scheduler.init_app(app)
        scheduler.start()
        # Lên lịch gửi request mỗi 10 phút
        scheduler.add_job(
            id='keep_alive',
            func=keep_alive,
            trigger='interval',
            minutes=10,
            next_run_time=datetime.now() + timedelta(seconds=10)  # Chạy lần đầu sau 10 giây
        )
    
    app.run(host='0.0.0.0', port=port, debug=debug)

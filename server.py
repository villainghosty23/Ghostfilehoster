import os
import secrets
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['SECRET_KEY'] = secrets.token_hex(16)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Generate a unique ID for the file
        file_id = secrets.token_urlsafe(8)
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}_{filename}")
        file.save(save_path)
        
        # Generate the shareable URL
        file_url = f"{request.host_url}download/{file_id}"
        return jsonify({
            'url': file_url,
            'filename': filename,
            'size': os.path.getsize(save_path)
        })

@app.route('/download/<file_id>')
def download_file(file_id):
    # Find the file with the matching ID
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if filename.startswith(file_id + '_'):
            return send_from_directory(
                app.config['UPLOAD_FOLDER'],
                filename,
                as_attachment=True
            )
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask
from flask_cors import CORS
from controllers.feed import feed_bp
from controllers.admin import admin_bp

app = Flask(__name__)
CORS(app) 

app.register_blueprint(feed_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/api/health', methods=['GET'])
def health_check():
    return {"status": "active", "concurrency_ready": True}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
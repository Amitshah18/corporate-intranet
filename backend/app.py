import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from controllers.feed import feed_bp
from controllers.admin import admin_bp
from controllers.users import users_bp
from controllers.features import features_bp
load_dotenv()

app = Flask(__name__)

# Ultra-permissive CORS for local assessment development
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(feed_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(features_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return {"status": "active"}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
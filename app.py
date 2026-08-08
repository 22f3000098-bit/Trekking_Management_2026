import os
import logging
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from flask import Flask, render_template, abort
from config import Config
from extensions import db, jwt, mail, cors, init_extensions, celery_init_app

logger = logging.getLogger(__name__)


def create_app(config_class=Config):
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(config_class)

    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    os.makedirs(app.config.get('EXPORTS_FOLDER', 'exports'), exist_ok=True)

    init_extensions(app)
    celery_init_app(app)

    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.staff import staff_bp
    from routes.user import user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path.startswith('api/'):
            abort(404)
        return render_template('index.html')

    with app.app_context():
        db.create_all()
        _seed_admin(app)

    return app


def _seed_admin(app):
    from models import User
    from werkzeug.security import generate_password_hash

    admin_email = app.config.get('ADMIN_EMAIL')
    admin_password = app.config.get('ADMIN_PASSWORD')
    admin_username = app.config.get('ADMIN_USERNAME', 'admin')

    if not admin_email or not admin_password:
        logger.warning("[SEED] ADMIN_EMAIL or ADMIN_PASSWORD missing from environment configuration.")
        return

    existing_admin = User.query.filter_by(role='admin').first()
    if not existing_admin:
        admin = User(
            email=admin_email,
            username=admin_username,
            password_hash=generate_password_hash(admin_password, method='pbkdf2:sha256'),
            role='admin',
            is_active=True,
            is_blacklisted=False,
        )
        db.session.add(admin)
        db.session.commit()
        print(f"[SEED] Initial admin user created → {admin_email}")


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

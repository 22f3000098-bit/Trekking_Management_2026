from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from celery import Celery, Task
import redis as redis_lib

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cors = CORS()
redis_client = None


def init_extensions(app):
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    global redis_client
    try:
        redis_client = redis_lib.from_url(app.config['REDIS_URL'], decode_responses=True)
        redis_client.ping()
    except Exception as e:
        print(f"[REDIS] Connection failed — caching disabled: {e}")
        redis_client = None


def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config['CELERY'])
    celery_app.set_default()
    app.extensions['celery'] = celery_app
    return celery_app

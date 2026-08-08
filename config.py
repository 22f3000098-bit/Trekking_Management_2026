import os
from datetime import timedelta
from celery.schedules import crontab


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-tma-2024')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///tma.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-tma-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    CELERY = {
        'broker_url': os.environ.get('REDIS_URL', 'redis://localhost:6379/0'),
        'result_backend': os.environ.get('REDIS_URL', 'redis://localhost:6379/0'),
        'task_serializer': 'json',
        'result_serializer': 'json',
        'accept_content': ['json'],
        'timezone': 'UTC',
        'enable_utc': True,
        'beat_schedule': {
            'daily-trek-reminders': {
                'task': 'tasks.reminders.send_daily_reminders',
                'schedule': crontab(hour=8, minute=0),
            },
            'monthly-activity-report': {
                'task': 'tasks.monthly_report.send_monthly_report',
                'schedule': crontab(day_of_month=1, hour=9, minute=0),
            },
        },
    }

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME', 'noreply@tma.com')

    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@tma.com')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
    ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    EXPORTS_FOLDER = os.path.join(BASE_DIR, 'exports')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

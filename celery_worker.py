from app import create_app

flask_app = create_app()
celery_app = flask_app.extensions['celery']

import tasks.reminders       # noqa: F401
import tasks.monthly_report  # noqa: F401
import tasks.export          # noqa: F401

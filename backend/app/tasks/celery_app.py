from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "analytics",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.ingestion_tasks",
        "app.tasks.alert_tasks",
        "app.tasks.report_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "check-alerts-every-minute": {
            "task": "app.tasks.alert_tasks.check_all_alerts",
            "schedule": crontab(minute="*"),
        },
        "run-scheduled-reports": {
            "task": "app.tasks.report_tasks.run_due_reports",
            "schedule": crontab(minute="0", hour="*"),
        },
    },
)

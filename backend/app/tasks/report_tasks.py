import asyncio
from datetime import datetime, timezone, timedelta
from app.tasks.celery_app import celery_app
from app.db.base import AsyncSessionLocal
from app.models.report import Report, ReportRun, ReportStatus, ReportFrequency
from app.services.report_service import generate_pdf_report
from app.services.email_service import send_email
from sqlalchemy import select


@celery_app.task(name="app.tasks.report_tasks.run_due_reports")
def run_due_reports():
    asyncio.run(_run_reports())


async def _run_reports():
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Report).where(Report.next_run_at <= now)
        )
        reports = result.scalars().all()

        for report in reports:
            run = ReportRun(report_id=report.id, status=ReportStatus.RUNNING, ran_at=now)
            db.add(run)
            await db.flush()

            try:
                file_path = generate_pdf_report(run.id, report.name, [])
                run.status = ReportStatus.DONE
                run.file_path = file_path

                if report.recipients:
                    await send_email(
                        report.recipients,
                        f"Report: {report.name}",
                        f"<p>Your scheduled report <b>{report.name}</b> is ready.</p>",
                    )
            except Exception as e:
                run.status = ReportStatus.FAILED
                run.error = str(e)

            report.next_run_at = _next_run(report.frequency, now)

        await db.commit()


def _next_run(frequency: ReportFrequency, from_dt: datetime) -> datetime:
    if frequency == ReportFrequency.DAILY:
        return from_dt + timedelta(days=1)
    if frequency == ReportFrequency.WEEKLY:
        return from_dt + timedelta(weeks=1)
    return from_dt + timedelta(days=30)

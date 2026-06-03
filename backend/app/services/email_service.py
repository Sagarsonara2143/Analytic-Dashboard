import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_email(to: list[str], subject: str, body_html: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.EMAILS_FROM
    message["To"] = ", ".join(to)
    message.attach(MIMEText(body_html, "html"))

    kwargs: dict = dict(
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
    )
    if settings.SMTP_USE_TLS:
        kwargs["username"] = settings.SMTP_USER
        kwargs["password"] = settings.SMTP_PASSWORD
        kwargs["start_tls"] = True

    await aiosmtplib.send(message, **kwargs)

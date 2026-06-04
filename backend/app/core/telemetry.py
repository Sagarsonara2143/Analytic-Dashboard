from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from app.core.config import settings


def setup_telemetry(app):
    """Setup OpenTelemetry tracing (skip if not configured)"""
    try:
        if not hasattr(settings, 'OTEL_EXPORTER_OTLP_ENDPOINT') or not settings.OTEL_EXPORTER_OTLP_ENDPOINT:
            print("ℹ️ OpenTelemetry not configured, skipping...")
            return
            
        resource = Resource.create({"service.name": settings.OTEL_SERVICE_NAME})
        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT, insecure=True)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        FastAPIInstrumentor.instrument_app(app)
        SQLAlchemyInstrumentor().instrument()
        print("✅ OpenTelemetry configured successfully")
    except Exception as e:
        print(f"⚠️ OpenTelemetry setup failed (continuing without): {e}")

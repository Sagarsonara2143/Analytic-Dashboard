from fastapi import APIRouter
from app.api.v1 import auth, orgs, ingestion, dashboards, alerts, reports, websocket, api_keys

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(orgs.router)
api_router.include_router(ingestion.router)
api_router.include_router(dashboards.router)
api_router.include_router(alerts.router)
api_router.include_router(reports.router)
api_router.include_router(websocket.router)
api_router.include_router(api_keys.router)

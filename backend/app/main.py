from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback

from app.api.v1 import api_router
from app.core.config import settings
from app.core.telemetry import setup_telemetry


app = FastAPI(
    title="Analytics Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3004",
        "http://frontend:3004",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_telemetry(app)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"Error: {exc}")
    print(traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}"})


app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

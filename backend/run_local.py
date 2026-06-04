#!/usr/bin/env python3
"""
Local development server startup script
Run this instead of docker for local backend development
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for local development
os.environ.setdefault("PYTHONPATH", str(backend_dir))

if __name__ == "__main__":
    print("🚀 Starting Analytics Platform Backend (Local Development)")
    print("📍 API Docs: http://localhost:8000/api/docs")
    print("📍 Health Check: http://localhost:8000/health")
    print()
    
    # Check if .env file exists
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("❌ .env file not found. Please create it from .env.example")
        sys.exit(1)
    
    print("✅ Environment file found")
    print("🔧 Make sure PostgreSQL and Redis are running locally")
    print("🔧 PostgreSQL: localhost:5432")
    print("🔧 Redis: localhost:6379")
    print()
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=[str(backend_dir / "app")],
            log_level="info",
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)
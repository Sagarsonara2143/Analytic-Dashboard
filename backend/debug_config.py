#!/usr/bin/env python3
"""
Debug script to check what database URL is being generated
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def debug_database_config():
    """Debug the database configuration"""
    print("🔍 Debugging database configuration...")
    
    try:
        from app.core.config import settings
        
        print(f"DB_HOST: {settings.DB_HOST}")
        print(f"DB_PORT: {settings.DB_PORT}")
        print(f"DB_USER: {settings.DB_USER}")
        print(f"DB_PASSWORD: {settings.DB_PASSWORD}")
        print(f"DB_NAME: {settings.DB_NAME}")
        print(f"Generated database_url: {settings.database_url}")
        
        # Test with SQLAlchemy engine
        from app.db.base import engine
        print(f"Engine URL: {engine.url}")
        
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_database_config()
#!/usr/bin/env python3
"""
Validation script to check if all models and database connections work
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def check_models():
    """Check if all models can be imported correctly"""
    print("🔍 Checking model imports...")
    try:
        from app.models.user import User
        from app.models.organization import Organization
        from app.models.org_member import OrgMember, Role
        from app.models.dashboard import Dashboard, Widget
        print("✅ All models imported successfully")
        return True
    except Exception as e:
        print(f"❌ Model import failed: {e}")
        return False

def check_database():
    """Check database connection"""
    print("🔍 Checking database connection...")
    try:
        import asyncio
        from sqlalchemy import text
        from app.db.base import engine
        
        async def test_connection():
            async with engine.begin() as conn:
                result = await conn.execute(text("SELECT 1"))
                return result.scalar() == 1
        
        result = asyncio.run(test_connection())
        if result:
            print("✅ Database connection successful")
            return True
        else:
            print("❌ Database connection failed")
            return False
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def check_redis():
    """Check Redis connection"""
    print("🔍 Checking Redis connection...")
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis connection successful")
        return True
    except Exception as e:
        print(f"❌ Redis connection error: {e}")
        return False

def main():
    print("🚀 Analytics Platform - Environment Validation")
    print("=" * 50)
    
    checks = [
        check_models(),
        check_database(),
        check_redis(),
    ]
    
    print("\n" + "=" * 50)
    if all(checks):
        print("✅ All checks passed! Ready to start the backend.")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
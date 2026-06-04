#!/usr/bin/env python3
"""
Simple PostgreSQL connection test
"""

import psycopg2
import asyncpg
import asyncio

def test_sync_connection():
    """Test synchronous connection with psycopg2"""
    print("🔍 Testing sync connection...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="Admin@2025",
            database="analytics_db"
        )
        print("✅ Sync connection successful")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Sync connection failed: {e}")
        return False

async def test_async_connection():
    """Test async connection with asyncpg"""
    print("🔍 Testing async connection...")
    try:
        conn = await asyncpg.connect(
            host="localhost",
            port=5432,
            user="postgres",
            password="Admin@2025",
            database="analytics_db"
        )
        print("✅ Async connection successful")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Async connection failed: {e}")
        return False

def main():
    print("🚀 PostgreSQL Connection Test")
    print("=" * 40)
    
    # Test different connection methods
    sync_ok = test_sync_connection()
    async_ok = asyncio.run(test_async_connection())
    
    if not (sync_ok or async_ok):
        print("\n💡 Troubleshooting steps:")
        print("1. Check if PostgreSQL service is running:")
        print("   services.msc -> PostgreSQL")
        print("2. Verify the password:")
        print("   psql -U postgres -h localhost")
        print("3. Check if database exists:")
        print("   createdb -U postgres analytics_db")
        print("4. Try without password:")
        print("   Set PGPASSWORD=Admin@2025")

if __name__ == "__main__":
    main()
@echo off
echo Starting Analytics Platform Backend (Local Development)
echo.

REM Check if virtual environment is activated
if "%VIRTUAL_ENV%"=="" (
    echo Please activate your virtual environment first:
    echo   venv\Scripts\activate
    echo.
    pause
    exit /b 1
)

echo Virtual environment: %VIRTUAL_ENV%

REM Check if PostgreSQL is running
echo Checking PostgreSQL connection...
python -c "import psycopg2; psycopg2.connect('host=localhost port=5432 user=postgres password=postgres dbname=analytics_db')" 2>nul
if errorlevel 1 (
    echo ❌ Cannot connect to PostgreSQL. Please start it:
    echo   - Install PostgreSQL if not installed
    echo   - Start PostgreSQL service
    echo   - Create database: createdb analytics_db
    echo.
    pause
    exit /b 1
)
echo ✅ PostgreSQL connection OK

REM Check if Redis is running
echo Checking Redis connection...
python -c "import redis; redis.Redis('localhost', 6379).ping()" 2>nul
if errorlevel 1 (
    echo ❌ Cannot connect to Redis. Please start it:
    echo   - Install Redis if not installed
    echo   - Start Redis server on localhost:6379
    echo.
    pause
    exit /b 1
)
echo ✅ Redis connection OK

echo.
echo Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo ❌ Database migration failed
    pause
    exit /b 1
)
echo ✅ Database migrations complete

echo.
echo Starting FastAPI server...
python run_local.py
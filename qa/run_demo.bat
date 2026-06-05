@echo off
setlocal
title Analytics Dashboard - Demo Suite

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   Analytics ^& Dashboard Platform — Demo Suite       ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: Check frontend
curl -s --max-time 3 http://localhost:3004 >nul 2>&1
if errorlevel 1 (
    echo  ❌  Frontend not running at http://localhost:3004
    echo.
    echo  Start the app first:
    echo     docker compose up --build
    echo.
    pause & exit /b 1
)

:: Check backend
curl -s --max-time 3 http://localhost:8004/api/docs >nul 2>&1
if errorlevel 1 (
    echo  ❌  Backend not running at http://localhost:8004
    echo.
    echo  Start the app first:
    echo     docker compose up --build
    echo.
    pause & exit /b 1
)

echo  ✅  App is running!
echo.
echo  Select scenario to run:
echo  ─────────────────────────────────────────
echo   [0]  Run ALL scenarios (full demo)
echo   [1]  Authentication (signup, login, logout)
echo   [2]  Organizations (create, select)
echo   [3]  Dashboards ^& Widgets (all 5 types)
echo   [4]  Alerts (create, mute, delete)
echo   [5]  API Keys (create, delete)
echo   [6]  Data Sources (REST, webhook, CSV)
echo   [7]  Data Ingestion (events, CSV, webhook)
echo   [8]  Reports (schedule, list, runs)
echo   [9]  WebSocket Real-Time updates
echo   [10] Members ^& RBAC (invite, roles)
echo   [11] Dashboard Sharing (share token)
echo   [12] Token Refresh (silent refresh)
echo   [C]  Core only (scenarios 1-6)
echo  ─────────────────────────────────────────
echo.
set /p CHOICE="  Enter choice: "

if "%CHOICE%"=="0"  node demo.js
if "%CHOICE%"=="1"  node demo.js 1
if "%CHOICE%"=="2"  node demo.js 2
if "%CHOICE%"=="3"  node demo.js 3
if "%CHOICE%"=="4"  node demo.js 4
if "%CHOICE%"=="5"  node demo.js 5
if "%CHOICE%"=="6"  node demo.js 6
if "%CHOICE%"=="7"  node demo.js 7
if "%CHOICE%"=="8"  node demo.js 8
if "%CHOICE%"=="9"  node demo.js 9
if "%CHOICE%"=="10" node demo.js 10
if "%CHOICE%"=="11" node demo.js 11
if "%CHOICE%"=="12" node demo.js 12
if /i "%CHOICE%"=="C" node demo.js 1 6

echo.
echo  Demo finished! Check:
echo    screenshots\        - Visual screenshots of every step
echo    report.json         - Pass/fail summary
echo    bugs_and_errors.log - All bugs and errors logged
echo.
if exist bugs_and_errors.log (
    echo  Opening bug log...
    type bugs_and_errors.log
)
echo.
pause

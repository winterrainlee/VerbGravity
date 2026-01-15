@echo off
echo ======================================
echo   VerbGravity Development Servers
echo ======================================
echo.

:: Get current directory
set "PROJECT_ROOT=%~dp0"

:: Start Backend (FastAPI) in new window
echo Starting Backend (FastAPI) on port 8000...
start "VerbGravity Backend" cmd /k "cd /d %PROJECT_ROOT%server && .\venv\Scripts\python.exe main.py"

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak > nul

:: Start Frontend (Vite) in new window
echo Starting Frontend (Vite) on port 5173...
start "VerbGravity Frontend" cmd /k "cd /d %PROJECT_ROOT%client && npm.cmd run dev"

echo.
echo ======================================
echo   Servers Started!
echo ======================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo.
echo   Press any key to exit this window...
pause > nul

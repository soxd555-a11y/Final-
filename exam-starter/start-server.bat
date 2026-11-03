@echo off
chcp 65001 >nul
title Exam Starter - Server (http://localhost:3000)
cd /d "%~dp0backend"

if not exist node_modules (
  echo [1/3] Installing dependencies (first time only)...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed. Check internet connection / Node.js.
    pause
    exit /b 1
  )
) else (
  echo [1/3] node_modules exists - skip install.
)

if not exist .env (
  echo [2/3] Creating .env from .env.example ...
  copy ".env.example" ".env" >nul
  echo       >> IMPORTANT: edit backend\.env and set DB_PASSWORD to match this machine.
) else (
  echo [2/3] .env exists - skip.
)

echo [3/3] Starting server...
echo       Web     : http://localhost:3000/
echo       Health  : http://localhost:3000/health
echo.
echo If /health shows a DB error, run start-db.bat first (or fix backend\.env).
echo.
call npm start
pause

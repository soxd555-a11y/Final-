@echo off
chcp 65001 >nul
title Exam Starter - MySQL (auto setup)
cd /d "%~dp0"

echo === Step 1: checking MySQL on port 3306 ===
powershell -NoProfile -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue).TcpTestSucceeded" > "%TEMP%\mysql-port.txt" 2>nul
set /p PORTOK=<"%TEMP%\mysql-port.txt"

if "%PORTOK%"=="True" (
  echo MySQL is already running on port 3306. OK - skip.
  goto CHECK_TABLES
)

echo Port 3306 is not open. Trying Docker...
docker ps >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Docker not found and MySQL not running.
  echo Install MySQL, or start Docker Desktop, then run this again.
  echo Manual setup:
  echo   mysql -u root -p ^< sql\schema.sql
  echo   mysql -u root -p ^< sql\seed.sql
  echo.
  pause
  exit /b 1
)

docker inspect exam-mysql >nul 2>&1
if errorlevel 1 (
  echo Creating container exam-mysql ...
  docker run -d --name exam-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=exam_db -p 3306:3306 mysql:8.0
) else (
  echo Starting existing container exam-mysql ...
  docker start exam-mysql
)

echo Waiting for MySQL to be ready (max 60s)...
set /a tries=0
:WAIT
set /a tries+=1
docker exec exam-mysql mysqladmin ping -uroot -proot --silent >nul 2>&1
if not errorlevel 1 goto READY
if %tries% geq 60 (
  echo [ERROR] MySQL did not become ready in 60s. Check: docker logs exam-mysql
  pause
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto WAIT

:READY
echo MySQL is ready.

:CHECK_TABLES
echo === Step 2: checking tables (exam_db) ===
docker exec exam-mysql mysql -uroot -proot -N -e "SELECT 1 FROM exam_db.books LIMIT 1" >nul 2>&1
if not errorlevel 1 (
  echo Tables already exist - existing data is kept.
  goto DONE
)

echo Importing sql\schema.sql and sql\seed.sql ...
docker exec -i exam-mysql mysql -uroot -proot --default-character-set=utf8mb4 < sql\schema.sql
if errorlevel 1 (
  echo [ERROR] schema.sql import failed.
  pause
  exit /b 1
)
docker exec -i exam-mysql mysql -uroot -proot --default-character-set=utf8mb4 < sql\seed.sql
if errorlevel 1 (
  echo [ERROR] seed.sql import failed.
  pause
  exit /b 1
)
echo Created tables + seed data.

:DONE
echo.
echo === Done. Next: run start-server.bat then open http://localhost:3000/ ===
pause

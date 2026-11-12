@echo off
REM Contourne le bug Docker Compose "bake" qui bloque sur "load local bake definitions".
REM Usage: scripts\rebuild.bat   ou   scripts\rebuild.bat backend

setlocal
cd /d "%~dp0.."

if "%~1"=="" (
  echo === Build backend ===
  docker build -t la_maison_orientale-backend ./lmoBack
  if errorlevel 1 exit /b 1
  echo === Build frontend ===
  docker build -t la_maison_orientale-frontend ./lmoFront
  if errorlevel 1 exit /b 1
) else if /I "%~1"=="backend" (
  docker build -t la_maison_orientale-backend ./lmoBack
  if errorlevel 1 exit /b 1
) else if /I "%~1"=="frontend" (
  docker build -t la_maison_orientale-frontend ./lmoFront
  if errorlevel 1 exit /b 1
) else (
  echo Usage: rebuild.bat [backend^|frontend]
  exit /b 1
)

echo === Restart containers ===
docker compose up -d --no-build
echo OK
endlocal

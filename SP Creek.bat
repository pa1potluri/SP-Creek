@echo off
title SP Creek
cd /d "%~dp0"
set "SP_CREEK_PORT=8813"
set "SP_CREEK_PYTHON=python"
if exist "E:\claude pa1\envs\hero\Scripts\python.exe" set "SP_CREEK_PYTHON=E:\claude pa1\envs\hero\Scripts\python.exe"
"%SP_CREEK_PYTHON%" -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:%SP_CREEK_PORT%/', timeout=2)" >nul 2>&1
if not errorlevel 1 (
  start "" http://localhost:%SP_CREEK_PORT%
  exit /b 0
)
echo Keep this window open while using SP Creek. Press Ctrl+C to stop.
"%SP_CREEK_PYTHON%" serve_world.py %SP_CREEK_PORT% --open
if errorlevel 1 (
  echo.
  echo The server could not start. If SP Creek is already open, use that window.
  echo Otherwise check the error above.
  pause
)

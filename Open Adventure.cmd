@echo off
cd /d "%~dp0"
powershell -NoProfile -WindowStyle Hidden -Command "try { $r=Invoke-WebRequest 'http://127.0.0.1:8823/' -TimeoutSec 2 -UseBasicParsing; if($r.StatusCode -eq 200){Start-Process 'http://localhost:8823'; exit} } catch {}; Start-Process python -ArgumentList 'serve_world.py','8823','--open' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden"

@echo off
title SP Creek
cd /d "%~dp0"
start "" http://localhost:8810
"E:\claude pa1\envs\hero\Scripts\python.exe" serve_world.py 8810

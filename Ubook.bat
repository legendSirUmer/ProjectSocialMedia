@echo off
REM Change to Backend directory and start Django server
cd /d "%~dp0Backend"
start cmd /k "py manage.py runserver"

REM Change to Frontend directory and start React dev server
cd /d "%~dp0Frontend"
start cmd /k "npm run dev"
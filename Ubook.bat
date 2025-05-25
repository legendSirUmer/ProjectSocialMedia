@echo off
REM Change to Backend directory and start Django server
cd /d "%~dp0Backend"
start cmd /k "py manage.py runserver"

REM Change to Frontend directory and start React dev server
cd /d "%~dp0Frontend"
start cmd /k "npm run dev && start msedge http://localhost:5173/"







REM adk web --port=6999 --session_db_url "mssql+pyodbc://@DESKTOP-1CU83GB\SQLEXPRESS01/Ubook?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"for agent
@echo off
:: Check for administrative permissions
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ========================================================
echo Configuring PostgreSQL, Database, Schema and Seed Data...
echo ========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0reset_postgres.ps1"

pause

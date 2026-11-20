@echo off
echo ========================================================
echo Configuring PostgreSQL, Database, Schema and Seed Data...
echo ========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0reset_postgres.ps1"

pause

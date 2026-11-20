$ErrorActionPreference = "Continue"

Write-Host "Updating PostgreSQL configuration..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$schemaPath = Join-Path $scriptDir "server\sql\schema.sql"
$seedPath = Join-Path $scriptDir "server\sql\seed.sql"

# 1. PostgreSQL 18 (default port 5432)
$hba18 = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
if (Test-Path $hba18) {
    Copy-Item $hba18 "$hba18.bak" -Force
    (Get-Content $hba18 -Raw) -replace "scram-sha-256", "trust" | Set-Content $hba18 -Encoding utf8
    Restart-Service postgresql-x64-18 -Force
    
    $psql18 = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
    & $psql18 -p 5432 -U postgres -c "ALTER USER postgres WITH PASSWORD 'shop12345';"
    & $psql18 -p 5432 -U postgres -c "CREATE DATABASE shopease;"
    
    Write-Host "Applying schema and seed data to shopease..." -ForegroundColor Cyan
    & $psql18 -p 5432 -U postgres -d shopease -f $schemaPath
    & $psql18 -p 5432 -U postgres -d shopease -f $seedPath

    (Get-Content $hba18 -Raw) -replace "trust", "scram-sha-256" | Set-Content $hba18 -Encoding utf8
    Restart-Service postgresql-x64-18 -Force
    Write-Host "PostgreSQL 18 configured successfully!" -ForegroundColor Green
}

# 2. PostgreSQL 14 (port 5433)
$hba14 = "C:\Program Files\PostgreSQL\14\data\pg_hba.conf"
if (Test-Path $hba14) {
    Copy-Item $hba14 "$hba14.bak" -Force
    (Get-Content $hba14 -Raw) -replace "scram-sha-256", "trust" | Set-Content $hba14 -Encoding utf8
    Restart-Service postgresql-x64-14 -Force
    
    $psql14 = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    & $psql14 -p 5433 -U postgres -c "ALTER USER postgres WITH PASSWORD 'shop12345';"
    & $psql14 -p 5433 -U postgres -c "CREATE DATABASE shopease;"

    Write-Host "Applying schema and seed data to shopease on port 5433..." -ForegroundColor Cyan
    & $psql14 -p 5433 -U postgres -d shopease -f $schemaPath
    & $psql14 -p 5433 -U postgres -d shopease -f $seedPath
    
    (Get-Content $hba14 -Raw) -replace "trust", "scram-sha-256" | Set-Content $hba14 -Encoding utf8
    Restart-Service postgresql-x64-14 -Force
    Write-Host "PostgreSQL 14 configured successfully!" -ForegroundColor Green
}

Set-Content (Join-Path $scriptDir "reset_done.txt") "SUCCESS"
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "ALL SET! Password is 'shop12345', database, schema & seed ready." -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

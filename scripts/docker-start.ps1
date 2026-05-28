# Demarre PostgreSQL + pgAdmin pour La Maison Orientale
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

Write-Host "=== La Maison Orientale - Docker ===" -ForegroundColor Cyan

# Verifier que le moteur Docker tourne
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker non disponible" }
} catch {
    Write-Host ""
    Write-Host "ERREUR : Docker Desktop n'est pas demarre." -ForegroundColor Red
    Write-Host "1. Ouvre 'Docker Desktop' depuis le menu Demarrer Windows"
    Write-Host "2. Attends 'Engine running' (icone verte)"
    Write-Host "3. Relance ce script : .\scripts\docker-start.ps1"
    Write-Host ""
    exit 1
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Fichier .env cree depuis .env.example" -ForegroundColor Yellow
}

Write-Host "Demarrage des conteneurs (postgres + pgadmin)..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec docker compose up" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3
Write-Host ""
docker compose ps
Write-Host ""
Write-Host "PostgreSQL : localhost:5433  (user postgres, db la_maison_orientale)" -ForegroundColor Green
Write-Host "pgAdmin     : http://localhost:5050" -ForegroundColor Green
Write-Host "  Email     : admin@lamaisonorientale.com"
Write-Host "  Password  : admin123"
Write-Host ""
Write-Host "Dans pgAdmin, host du serveur = postgres (port 5432)" -ForegroundColor Yellow
Write-Host "Voir docs/DOCKER.md pour les details."

@echo off
chcp 65001 >nul 2>&1
title BuchungsProfi - Buchhaltungssoftware

echo ============================================
echo    BuchungsProfi - Buchhaltungssoftware
echo ============================================
echo.

:: Pruefen ob Node.js verfuegbar ist
where node >nul 2>&1
if %errorlevel% neq 0 (
    :: Pruefe lokale Node Installation
    if exist "%~dp0node\node.exe" (
        set "PATH=%~dp0node;%PATH%"
    ) else (
        echo Node.js wurde nicht gefunden.
        echo Bitte installiere Node.js von https://nodejs.org
        echo.
        pause
        exit /b 1
    )
)

:: Pruefen ob node_modules existiert
if not exist "%~dp0node_modules" (
    echo Installiere Abhaengigkeiten...
    cd /d "%~dp0"
    call npm install
    echo.
)

:: Pruefen ob dist existiert
if not exist "%~dp0dist\index.html" (
    echo Erstelle App...
    cd /d "%~dp0"
    call npm run build
    echo.
)

echo App wird gestartet...
echo.
cd /d "%~dp0"
call npx electron .

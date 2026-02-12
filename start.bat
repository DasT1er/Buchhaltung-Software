@echo off
chcp 65001 >nul 2>&1
title BuchungsProfi - Buchhaltungssoftware

:: Pruefen ob die fertige App existiert
if exist "%~dp0dist\index.html" (
    echo ============================================
    echo    BuchungsProfi - Buchhaltungssoftware
    echo ============================================
    echo.
    echo App wird im Browser geoeffnet...
    start "" "%~dp0dist\index.html"
    exit /b 0
)

echo ============================================
echo    BuchungsProfi - Buchhaltungssoftware
echo ============================================
echo.
echo Der "dist" Ordner wurde nicht gefunden.
echo.
echo Bitte zuerst einmal "build.bat" ausfuehren,
echo um die App zu erstellen.
echo.
pause

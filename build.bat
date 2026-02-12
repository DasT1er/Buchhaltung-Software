@echo off
chcp 65001 >nul 2>&1
title BuchungsProfi - Build
echo ============================================
echo    BuchungsProfi - App erstellen
echo ============================================
echo.

:: Pruefen ob Node.js installiert ist
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js wurde nicht gefunden!
    echo.
    echo Node.js wird jetzt automatisch heruntergeladen...
    echo Bitte warten...
    echo.

    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.16.0/node-v22.16.0-x64.msi' -OutFile '%TEMP%\nodejs_installer.msi'"

    if not exist "%TEMP%\nodejs_installer.msi" (
        echo.
        echo Download fehlgeschlagen!
        echo Bitte installiere Node.js manuell:
        echo https://nodejs.org/de/download
        echo.
        pause
        exit /b 1
    )

    echo Download abgeschlossen!
    echo.
    echo Node.js wird jetzt installiert...
    echo.

    msiexec /i "%TEMP%\nodejs_installer.msi" /passive
    del "%TEMP%\nodejs_installer.msi" >nul 2>&1
    set "PATH=%PATH%;C:\Program Files\nodejs"

    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo Installation fehlgeschlagen. Bitte PC neustarten
        echo und diese Datei erneut ausfuehren.
        echo.
        pause
        exit /b 1
    )

    echo Node.js wurde erfolgreich installiert!
    echo.
)

echo [1/3] Node.js gefunden:
node --version
echo.

echo [2/3] Installiere Abhaengigkeiten...
echo (Das kann beim ersten Mal einige Minuten dauern)
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo Fehler bei der Installation!
    pause
    exit /b 1
)

echo.
echo [3/3] Erstelle fertige App...
echo.
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo Fehler beim Build!
    pause
    exit /b 1
)

echo.
echo ============================================
echo    FERTIG!
echo.
echo    Die App liegt jetzt im Ordner "dist".
echo    Zum Starten einfach "start.bat" anklicken.
echo.
echo    Du kannst den "dist" Ordner auf jeden
echo    beliebigen PC kopieren - dort braucht
echo    man nur die index.html zu oeffnen.
echo ============================================
echo.
pause

@echo off
chcp 65001 >nul 2>&1
title BuchungsProfi - Buchhaltungssoftware
echo ============================================
echo    BuchungsProfi - Buchhaltungssoftware
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

    :: Node.js Installer herunterladen
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
    echo Bitte die Installation im Fenster bestaetigen.
    echo.

    :: Installer starten und warten bis fertig
    msiexec /i "%TEMP%\nodejs_installer.msi" /passive

    :: Installer aufraeumen
    del "%TEMP%\nodejs_installer.msi" >nul 2>&1

    :: PATH aktualisieren damit node/npm sofort verfuegbar sind
    set "PATH=%PATH%;C:\Program Files\nodejs"

    :: Nochmal pruefen
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo Installation scheint fehlgeschlagen zu sein.
        echo Bitte starte deinen PC neu und fuehre diese Datei erneut aus.
        echo.
        pause
        exit /b 1
    )

    echo.
    echo Node.js wurde erfolgreich installiert!
    echo.
)

echo Node.js gefunden:
node --version
echo npm gefunden:
call npm --version
echo.

echo Installiere Abhaengigkeiten...
echo (Das kann beim ersten Mal etwas dauern)
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo Fehler bei der Installation!
    echo Bitte starte die Datei erneut.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    App wird gestartet...
echo    Browser oeffnet sich gleich automatisch.
echo    Zum Beenden: Dieses Fenster schliessen
echo       oder STRG+C druecken.
echo ============================================
echo.

:: Kurz warten, dann Browser oeffnen
timeout /t 3 /nobreak >nul
start http://localhost:5173

call npm run dev

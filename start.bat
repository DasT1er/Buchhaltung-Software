@echo off
title BuchungsProfi - Buchhaltungssoftware
echo ============================================
echo    BuchungsProfi - Buchhaltungssoftware
echo ============================================
echo.
echo Installiere Abhaengigkeiten...
call npm install
echo.
echo Starte Anwendung...
echo Die App oeffnet sich gleich im Browser.
echo Zum Beenden dieses Fenster schliessen.
echo.
start http://localhost:5173
call npm run dev

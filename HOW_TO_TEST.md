# 🧪 Wie du die App richtig testest

## ✅ RICHTIG: Electron-Version (File-System)

### Option 1: Unpacked Version

```powershell
# Im Projektordner:
cd release\win-unpacked\
.\BuchungsProfi.exe
```

**→ Erstellt `data/` Ordner in `release/win-unpacked/data/`**

### Option 2: Portable EXE (nach vollständigem Build)

```powershell
npm run dist
cd release\
.\BuchungsProfi.exe
```

**→ Erstellt `data/` Ordner in `release/data/`**

### Option 3: Dev-Modus mit Electron

```powershell
npm run electron:dev
```

**→ Erstellt `data/` Ordner im Projekt-Root**

---

## ❌ FALSCH: Browser-Version (localStorage/IndexedDB)

```powershell
npm run dev        # ❌ NUR FÜR UI-ENTWICKLUNG!
```

**→ KEIN `data/` Ordner! Alles im Browser gespeichert!**

---

## 🔍 Wie erkennst du den Unterschied?

### Electron-Modus ✅
- App startet in eigenem Fenster (nicht im Browser)
- Kein Browser-Tab
- `data/` Ordner wird erstellt
- Console zeigt: "✅ Migrated data..." ODER keine Fehler

### Browser-Modus ❌
- App öffnet in Chrome/Edge/Firefox
- URL: `http://localhost:5173`
- KEIN `data/` Ordner
- DevTools Console: "Checked for data folder, none found"

---

## 📝 Debug-Tipps

Wenn du nicht sicher bist, öffne die **DevTools** (F12) und tippe:

```javascript
console.log('Electron?', !!window.electronAPI);
```

**Output:**
- `true` → ✅ Electron-Modus (File-System)
- `false` → ❌ Browser-Modus (localStorage)

---

## 🎯 EMPFEHLUNG

**Für Tests während der Entwicklung:**
```powershell
npm run electron:dev
```

**Für finale Tests:**
```powershell
npm run dist
cd release\win-unpacked\
.\BuchungsProfi.exe
```

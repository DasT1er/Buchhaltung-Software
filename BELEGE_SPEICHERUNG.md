# 📎 Beleg-Speicherung - Wie funktioniert das?

## 🗄️ Wo werden Belege gespeichert?

Die Buchungsprofi-App speichert **alle Belege direkt im Browser** in einer **IndexedDB-Datenbank**.

### Was ist IndexedDB?

- **Browser-interne Datenbank** (wie ein Mini-Dateisystem im Browser)
- **Sicher und verschlüsselt** (nur deine App kann darauf zugreifen)
- **Kein Ordner auf der Festplatte** - alles ist im Browser gespeichert
- **Funktioniert offline** - keine Internetverbindung nötig

---

## 📍 Technische Details

### Datenbank-Informationen:
```
Datenbank-Name: buchungsprofi-belege
Object Store: files
Speicherort: Browser IndexedDB (Chrome/Firefox/etc.)
```

### Gespeicherte Daten pro Beleg:
- **ID** (UUID)
- **Dateiname** (z.B. "Rechnung_123.pdf")
- **Dateityp** (z.B. "image/png", "application/pdf")
- **Dateigröße** (in Bytes)
- **Datei-Inhalt** (als ArrayBuffer)

---

## 🔍 Wo finde ich meine Belege?

### Im Browser (für Entwickler):

1. **Chrome DevTools öffnen:**
   - Rechtsklick → "Untersuchen"
   - Tab "Application" → "Storage" → "IndexedDB"
   - Datenbank `buchungsprofi-belege` → `files`

2. **Firefox DevTools:**
   - F12 → Tab "Speicher" → "IndexedDB"
   - `buchungsprofi-belege` → `files`

### Zugriff in der App:

- ✅ **Ansicht:** Klicke auf eine Einnahme/Ausgabe → Beleg-Liste → "Auge"-Symbol
- ✅ **Download:** Klicke auf das "Download"-Symbol neben dem Beleg
- ✅ **Export:** Die Belege werden im JSON-Backup **NICHT** exportiert (nur Metadaten!)

---

## ⚠️ WICHTIG: Backup & Sicherheit

### Was passiert beim Daten-Export?

Wenn du "Daten exportieren" nutzt, werden **NUR die Metadaten** exportiert:
```json
{
  "belege": [
    {
      "id": "abc-123",
      "name": "Rechnung.pdf",
      "type": "application/pdf",
      "size": 123456
    }
  ]
}
```

**Die eigentlichen Dateien (PDF, Bilder) sind NICHT im Export enthalten!**

### Wie sichere ich meine Belege?

1. **Manueller Download:**
   - Öffne jede Einnahme/Ausgabe
   - Klicke auf "Download" bei jedem Beleg
   - Speichere die Dateien in einem Ordner (z.B. `Belege_2026`)

2. **Browser-Daten sichern:**
   - Die IndexedDB ist Teil der Browser-Daten
   - Bei Browser-Neuinstallation **gehen die Belege verloren!**
   - Bei "Browserdaten löschen" **gehen die Belege verloren!**

---

## 🚀 Zukünftige Verbesserungen

### Option 1: Belege im Export einbinden

**Vorteil:** Vollständiges Backup inkl. Dateien
**Nachteil:** Sehr große Export-Dateien

**Implementierung:**
- Belege als Base64 im JSON speichern
- Beim Import wieder in IndexedDB laden

### Option 2: Lokaler Ordner (Desktop-App)

**Vorteil:** Direkter Zugriff auf Dateien im Dateisystem
**Nachteil:** Erfordert Electron (Desktop-App statt Web-App)

**Implementierung:**
- App mit Electron bauen
- Ordner: `~/Dokumente/Buchungsprofi/Belege/2026/`
- Dateien mit UUID: `abc-123_Rechnung.pdf`

### Option 3: Cloud-Speicher (Backend)

**Vorteil:** Geräteübergreifender Zugriff
**Nachteil:** Erfordert Server + Datenbank + Kosten

**Implementierung:**
- Backend-Server (Node.js/Python)
- Cloud-Storage (AWS S3, Google Cloud, etc.)
- Authentifizierung + Verschlüsselung

---

## 📋 Empfehlung für aktuellen Stand

### Für Kleinunternehmer:

1. **Regelmäßig Belege manuell sichern:**
   - Einmal im Monat alle Belege downloaden
   - In einem Ordner speichern: `Belege/2026/01_Januar/`

2. **Browser-Daten NICHT löschen:**
   - IndexedDB bleibt erhalten, solange du den Browser nutzt
   - Bei Neuinstallation: Vorher Belege sichern!

3. **Alternative:**
   - Belege direkt in einem Ordner speichern (außerhalb der App)
   - In der App nur Referenz-Nummern verwenden

---

## 🛠️ Code-Referenz

### Beleg speichern:
```typescript
// src/store/belegeDB.ts
await saveFile(id, file);  // Speichert in IndexedDB
```

### Beleg abrufen:
```typescript
const url = await getFileUrl(id);  // Erstellt Blob-URL
window.open(url, '_blank');  // Öffnet Beleg
```

### Beleg löschen:
```typescript
await deleteFile(id);  // Löscht aus IndexedDB
```

---

## 📞 Fragen?

Falls du eine andere Speicherlösung brauchst (z.B. Desktop-App mit lokalem Ordner), lass es mich wissen! 🚀

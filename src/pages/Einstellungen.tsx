import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Download, Upload, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../store/useStore';
import { exportAllDataJSON } from '../utils/exportUtils';
import type { AppState } from '../types';

const inputCls = 'w-full px-3 py-2 text-sm bg-input border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-heading transition-colors';
const labelCls = 'block text-sm font-medium text-heading mb-1';

export default function Einstellungen() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const store = useStore();

  const [firmenname, setFirmenname] = useState(store.firmenname);
  const [steuernummer, setSteuernummer] = useState(store.steuernummer);
  const [kleinunternehmer, setKleinunternehmer] = useState(store.kleinunternehmer);
  const [geschaeftsjahr, setGeschaeftsjahr] = useState(store.geschaeftsjahr);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');

  function handleSave() {
    store.updateEinstellungen({ firmenname, steuernummer, kleinunternehmer, geschaeftsjahr });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    exportAllDataJSON({
      einnahmen: store.einnahmen, ausgaben: store.ausgaben, kunden: store.kunden, fahrten: store.fahrten,
      firmenname: store.firmenname, steuernummer: store.steuernummer,
    });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string) as Partial<AppState>;
        store.importData(data);
        setImportError('');
        setFirmenname(data.firmenname ?? firmenname);
        setSteuernummer(data.steuernummer ?? steuernummer);
        alert('Daten erfolgreich importiert!');
      } catch {
        setImportError('Ungültiges Dateiformat. Bitte wähle eine gültige Backup-Datei.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <>
      <Header title="Einstellungen" subtitle="Firmendaten und App-Konfiguration" onMenuClick={onMenuClick} />

      <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
        <div className="bg-card rounded-xl shadow-sm border border-divider-light overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-divider">
            <h3 className="text-sm font-bold text-heading">Firmendaten</h3>
          </div>
          <div className="p-6 space-y-4">
            <div><label className={labelCls}>Firmenname</label><input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)} placeholder="z.B. Mustermann Transport" className={inputCls} /></div>
            <div><label className={labelCls}>Steuernummer</label><input type="text" value={steuernummer} onChange={e => setSteuernummer(e.target.value)} placeholder="z.B. 12/345/67890" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Geschäftsjahr</label>
              <select value={geschaeftsjahr} onChange={e => setGeschaeftsjahr(parseInt(e.target.value))} className={inputCls}>
                {years.map(y => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="kleinunternehmer" checked={kleinunternehmer} onChange={e => setKleinunternehmer(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-divider focus:ring-primary-500" />
              <div>
                <label htmlFor="kleinunternehmer" className="text-sm font-medium text-heading cursor-pointer">Kleinunternehmerregelung (§ 19 UStG)</label>
                <p className="text-xs text-muted">Umsatz unter 22.000 EUR/Jahr - keine Umsatzsteuer auf Rechnungen</p>
              </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
              <Save size={16} />{saved ? 'Gespeichert!' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-divider-light overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-divider">
            <h3 className="text-sm font-bold text-heading">Datensicherung</h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-body">Alle Daten werden lokal in Ihrem Browser gespeichert. Erstellen Sie regelmäßig Backups.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 transition-colors">
                <Download size={16} />Backup erstellen (JSON)
              </button>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-heading bg-card-alt rounded-lg hover:opacity-80 transition-colors cursor-pointer">
                <Upload size={16} />Backup importieren
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            {importError && (
              <div className="flex items-center gap-2 text-sm text-d-on-tint bg-d-tint p-3 rounded-lg">
                <AlertTriangle size={16} />{importError}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-divider-light overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-divider">
            <h3 className="text-sm font-bold text-heading">Über BuchungsProfi</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 text-sm text-body">
              <p><strong className="text-heading">Version:</strong> 1.0.0</p>
              <p><strong className="text-heading">Zweck:</strong> Einfache Buchhaltung für Kleingewerbe und Transportgewerbe</p>
              <p><strong className="text-heading">EÜR:</strong> Einnahmen-Überschuss-Rechnung nach § 4 Abs. 3 EStG</p>
              <p className="text-xs text-muted pt-2">Diese Software dient als Hilfsmittel zur Buchführung. Sie ersetzt keine professionelle steuerliche Beratung.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

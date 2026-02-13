import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Download, Upload, AlertTriangle, Shield, Info } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../store/useStore';
import { exportAllDataJSON } from '../utils/exportUtils';
import type { AppState } from '../types';

const inputCls = 'w-full px-3 py-2 text-sm glass rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all';
const labelCls = 'block text-xs font-bold text-heading mb-1 uppercase tracking-wide';

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

      <div className="p-4 sm:p-6 space-y-4 max-w-2xl">
        {/* Firmendaten */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 flex items-center gap-2.5 bg-card-alt/30">
            <div className="w-7 h-7 rounded-md bg-p-tint/80 flex items-center justify-center backdrop-blur-sm">
              <Info size={14} className="text-p-on-tint" />
            </div>
            <h3 className="text-xs font-black text-heading uppercase tracking-wide">Firmendaten</h3>
          </div>
          <div className="p-4 space-y-3">
            <div><label className={labelCls}>Firmenname</label><input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)} placeholder="z.B. Mustermann Transport" className={inputCls} /></div>
            <div><label className={labelCls}>Steuernummer</label><input type="text" value={steuernummer} onChange={e => setSteuernummer(e.target.value)} placeholder="z.B. 12/345/67890" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Geschäftsjahr</label>
              <select value={geschaeftsjahr} onChange={e => setGeschaeftsjahr(parseInt(e.target.value))} className={inputCls}>
                {years.map(y => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 glass rounded-lg">
              <input type="checkbox" id="kleinunternehmer" checked={kleinunternehmer} onChange={e => setKleinunternehmer(e.target.checked)} className="w-3.5 h-3.5 text-primary-600 rounded border-divider focus:ring-primary-500" />
              <div>
                <label htmlFor="kleinunternehmer" className="text-xs font-semibold text-heading cursor-pointer">Kleinunternehmerregelung (§ 19 UStG)</label>
                <p className="text-[10px] text-muted mt-0.5">Umsatz unter 22.000 EUR/Jahr — keine Umsatzsteuer auf Rechnungen</p>
              </div>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all ${saved ? 'bg-gradient-to-br from-success-500 to-success-700 shadow-lg shadow-success-500/30' : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:shadow-lg hover:shadow-primary-500/30'}`}>
              <Save size={14} />{saved ? 'Gespeichert!' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>

        {/* Datensicherung */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 flex items-center gap-2.5 bg-card-alt/30">
            <div className="w-7 h-7 rounded-md bg-s-tint/80 flex items-center justify-center backdrop-blur-sm">
              <Shield size={14} className="text-s-on-tint" />
            </div>
            <h3 className="text-xs font-black text-heading uppercase tracking-wide">Datensicherung</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-body leading-relaxed">Alle Daten werden lokal in Ihrem Browser gespeichert. Erstellen Sie regelmäßig Backups.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={handleExport} className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-br from-success-500 to-success-700 rounded-lg hover:shadow-lg hover:shadow-success-500/30 transition-all">
                <Download size={14} />Backup erstellen (JSON)
              </button>
              <label className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-heading glass rounded-lg hover:bg-card-alt/40 transition-colors cursor-pointer">
                <Upload size={14} />Backup importieren
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            {importError && (
              <div className="flex items-center gap-2 text-xs text-d-on-tint glass bg-d-tint/20 p-2.5 rounded-lg">
                <AlertTriangle size={14} className="shrink-0" />{importError}
              </div>
            )}
          </div>
        </div>

        {/* Über */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 bg-card-alt/30">
            <h3 className="text-xs font-black text-heading uppercase tracking-wide">Über BuchungsProfi</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2 text-xs text-body">
              <p><strong className="text-heading">Version:</strong> 1.0.0</p>
              <p><strong className="text-heading">Zweck:</strong> Einfache Buchhaltung für Kleingewerbe und Transportgewerbe</p>
              <p><strong className="text-heading">EÜR:</strong> Einnahmen-Überschuss-Rechnung nach § 4 Abs. 3 EStG</p>
              <p className="text-[10px] text-muted pt-1.5 leading-relaxed">Diese Software dient als Hilfsmittel zur Buchführung. Sie ersetzt keine professionelle steuerliche Beratung.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

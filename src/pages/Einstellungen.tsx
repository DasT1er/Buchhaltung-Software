import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Download, Upload, AlertTriangle, Shield, Info } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../store/useStore';
import { exportAllDataJSON } from '../utils/exportUtils';
import type { AppState } from '../types';

const inputCls = 'w-full px-3 py-2.5 text-sm bg-input border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors';
const labelCls = 'block text-[13px] font-medium text-heading mb-1.5';

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
        setImportError('Ung\u00fcltiges Dateiformat. Bitte w\u00e4hle eine g\u00fcltige Backup-Datei.');
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

      <div className="p-5 sm:p-8 space-y-6 max-w-2xl">
        {/* Firmendaten */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider-light flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-p-tint flex items-center justify-center">
              <Info size={16} className="text-p-on-tint" />
            </div>
            <h3 className="text-sm font-semibold text-heading">Firmendaten</h3>
          </div>
          <div className="p-6 space-y-4">
            <div><label className={labelCls}>Firmenname</label><input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)} placeholder="z.B. Mustermann Transport" className={inputCls} /></div>
            <div><label className={labelCls}>Steuernummer</label><input type="text" value={steuernummer} onChange={e => setSteuernummer(e.target.value)} placeholder="z.B. 12/345/67890" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Gesch\u00e4ftsjahr</label>
              <select value={geschaeftsjahr} onChange={e => setGeschaeftsjahr(parseInt(e.target.value))} className={inputCls}>
                {years.map(y => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card-alt rounded-xl">
              <input type="checkbox" id="kleinunternehmer" checked={kleinunternehmer} onChange={e => setKleinunternehmer(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-divider focus:ring-primary-500" />
              <div>
                <label htmlFor="kleinunternehmer" className="text-sm font-medium text-heading cursor-pointer">Kleinunternehmerregelung (\u00a7 19 UStG)</label>
                <p className="text-xs text-muted mt-0.5">Umsatz unter 22.000 EUR/Jahr \u2014 keine Umsatzsteuer auf Rechnungen</p>
              </div>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-sm ${saved ? 'bg-success-600 shadow-success-600/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'}`}>
              <Save size={16} />{saved ? 'Gespeichert!' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>

        {/* Datensicherung */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider-light flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-s-tint flex items-center justify-center">
              <Shield size={16} className="text-s-on-tint" />
            </div>
            <h3 className="text-sm font-semibold text-heading">Datensicherung</h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-body leading-relaxed">Alle Daten werden lokal in Ihrem Browser gespeichert. Erstellen Sie regelm\u00e4\u00dfig Backups.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleExport} className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-success-600 rounded-xl hover:bg-success-700 transition-colors shadow-sm shadow-success-600/20">
                <Download size={16} />Backup erstellen (JSON)
              </button>
              <label className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-heading bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors cursor-pointer">
                <Upload size={16} />Backup importieren
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            {importError && (
              <div className="flex items-center gap-2.5 text-sm text-d-on-tint bg-d-tint border border-d-tint-border p-3.5 rounded-xl">
                <AlertTriangle size={16} className="shrink-0" />{importError}
              </div>
            )}
          </div>
        </div>

        {/* \u00dcber */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider-light">
            <h3 className="text-sm font-semibold text-heading">\u00dcber BuchungsProfi</h3>
          </div>
          <div className="p-6">
            <div className="space-y-2.5 text-sm text-body">
              <p><strong className="text-heading">Version:</strong> 1.0.0</p>
              <p><strong className="text-heading">Zweck:</strong> Einfache Buchhaltung f\u00fcr Kleingewerbe und Transportgewerbe</p>
              <p><strong className="text-heading">E\u00dcR:</strong> Einnahmen-\u00dcberschuss-Rechnung nach \u00a7 4 Abs. 3 EStG</p>
              <p className="text-xs text-muted pt-2 leading-relaxed">Diese Software dient als Hilfsmittel zur Buchf\u00fchrung. Sie ersetzt keine professionelle steuerliche Beratung.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

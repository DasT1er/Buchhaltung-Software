import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Printer, FileText } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/formatters';
import { getEinnahmeKategorieLabel, getAusgabeKategorieLabel } from '../utils/categories';
import { exportEURBerichtCSV, printEURBericht } from '../utils/exportUtils';

export default function EURBericht() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { einnahmen, ausgaben, geschaeftsjahr, firmenname, steuernummer, kleinunternehmer } = useStore();

  const jahresEinnahmen = useMemo(() => einnahmen.filter(e => new Date(e.datum).getFullYear() === geschaeftsjahr), [einnahmen, geschaeftsjahr]);
  const jahresAusgaben = useMemo(() => ausgaben.filter(a => new Date(a.datum).getFullYear() === geschaeftsjahr), [ausgaben, geschaeftsjahr]);

  const einnahmenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresEinnahmen.forEach(e => { map[e.kategorie] = (map[e.kategorie] ?? 0) + e.betrag; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jahresEinnahmen]);

  const ausgabenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresAusgaben.forEach(a => { map[a.kategorie] = (map[a.kategorie] ?? 0) + a.betrag; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jahresAusgaben]);

  const gesamtEinnahmen = useMemo(() => jahresEinnahmen.reduce((s, e) => s + e.betrag, 0), [jahresEinnahmen]);
  const gesamtAusgaben = useMemo(() => jahresAusgaben.reduce((s, a) => s + a.betrag, 0), [jahresAusgaben]);
  const gewinn = gesamtEinnahmen - gesamtAusgaben;

  const quartalsDaten = useMemo(() => {
    const q = [
      { label: 'Q1 (Jan\u2013M\u00e4r)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q2 (Apr\u2013Jun)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q3 (Jul\u2013Sep)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q4 (Okt\u2013Dez)', einnahmen: 0, ausgaben: 0 },
    ];
    jahresEinnahmen.forEach(e => { q[Math.floor(new Date(e.datum).getMonth() / 3)].einnahmen += e.betrag; });
    jahresAusgaben.forEach(a => { q[Math.floor(new Date(a.datum).getMonth() / 3)].ausgaben += a.betrag; });
    return q;
  }, [jahresEinnahmen, jahresAusgaben]);

  return (
    <>
      <Header
        title="E\u00dcR-Bericht"
        subtitle={`Einnahmen-\u00dcberschuss-Rechnung ${geschaeftsjahr}`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button onClick={() => exportEURBerichtCSV(jahresEinnahmen, jahresAusgaben, geschaeftsjahr)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-body bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors">
              <Download size={15} /><span className="hidden sm:inline">CSV</span>
            </button>
            <button onClick={printEURBericht} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
              <Printer size={15} /><span className="hidden sm:inline">Drucken</span>
            </button>
          </div>
        }
      />

      <div className="p-5 sm:p-8 space-y-6">
        {/* Header Card */}
        <div className="bg-card rounded-2xl p-6 border border-divider-light transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-heading">Einnahmen-\u00dcberschuss-Rechnung (E\u00dcR)</h3>
              <p className="text-sm text-body mt-1">Gesch\u00e4ftsjahr {geschaeftsjahr} {firmenname && `\u2014 ${firmenname}`}</p>
              {steuernummer && <p className="text-sm text-muted">Steuernummer: {steuernummer}</p>}
              {kleinunternehmer && (
                <span className="inline-flex mt-2 px-3 py-1 text-xs font-medium bg-p-tint text-p-on-tint rounded-lg">
                  Kleinunternehmerregelung (\u00a7 19 UStG)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-s-tint border border-s-tint-border rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-s-on-tint">Betriebseinnahmen</p>
            <p className="text-2xl font-bold text-s-on-tint mt-1">{formatCurrency(gesamtEinnahmen)}</p>
          </div>
          <div className="bg-d-tint border border-d-tint-border rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-d-on-tint">Betriebsausgaben</p>
            <p className="text-2xl font-bold text-d-on-tint mt-1">{formatCurrency(gesamtAusgaben)}</p>
          </div>
          <div className={`${gewinn >= 0 ? 'bg-p-tint border-p-tint-border' : 'bg-d-tint border-d-tint-border'} border rounded-2xl p-5 text-center`}>
            <p className={`text-sm font-medium ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{gewinn >= 0 ? 'Gewinn' : 'Verlust'}</p>
            <p className={`text-2xl font-bold mt-1 ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{formatCurrency(gewinn)}</p>
          </div>
        </div>

        {/* Einnahmen Table */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider bg-s-tint/50">
            <h3 className="text-sm font-bold text-s-on-tint">I. Betriebseinnahmen</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Kategorie</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider-light">
              {einnahmenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-card-alt/50 transition-colors">
                  <td className="px-6 py-3.5 text-heading">{getEinnahmeKategorieLabel(kat as any)}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-heading">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {einnahmenByKat.length === 0 && (
                <tr><td colSpan={2} className="px-6 py-6 text-center text-muted">Keine Einnahmen</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-s-tint-border bg-s-tint/50">
                <td className="px-6 py-3.5 font-bold text-s-on-tint">Summe Betriebseinnahmen</td>
                <td className="px-6 py-3.5 text-right font-bold text-s-on-tint">{formatCurrency(gesamtEinnahmen)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ausgaben Table */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider bg-d-tint/50">
            <h3 className="text-sm font-bold text-d-on-tint">II. Betriebsausgaben</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Kategorie</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider-light">
              {ausgabenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-card-alt/50 transition-colors">
                  <td className="px-6 py-3.5 text-heading">{getAusgabeKategorieLabel(kat as any)}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-heading">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {ausgabenByKat.length === 0 && (
                <tr><td colSpan={2} className="px-6 py-6 text-center text-muted">Keine Ausgaben</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-d-tint-border bg-d-tint/50">
                <td className="px-6 py-3.5 font-bold text-d-on-tint">Summe Betriebsausgaben</td>
                <td className="px-6 py-3.5 text-right font-bold text-d-on-tint">{formatCurrency(gesamtAusgaben)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ergebnis */}
        <div className={`rounded-2xl p-6 border ${gewinn >= 0 ? 'bg-p-tint border-p-tint-border' : 'bg-d-tint border-d-tint-border'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-bold ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>III. Ergebnis (Gewinn / Verlust)</h3>
              <p className={`text-sm mt-1 ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>
                Betriebseinnahmen {formatCurrency(gesamtEinnahmen)} \u2212 Betriebsausgaben {formatCurrency(gesamtAusgaben)}
              </p>
            </div>
            <p className={`text-3xl font-bold ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{formatCurrency(gewinn)}</p>
          </div>
        </div>

        {/* Quartals\u00fcbersicht */}
        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 py-4 border-b border-divider">
            <h3 className="text-sm font-bold text-heading">Quartals\u00fcbersicht</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider bg-card-alt/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Quartal</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Einnahmen</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Ausgaben</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Ergebnis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider-light">
              {quartalsDaten.map(q => (
                <tr key={q.label} className="hover:bg-card-alt/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-heading">{q.label}</td>
                  <td className="px-6 py-3.5 text-right text-success-600 dark:text-success-400">{formatCurrency(q.einnahmen)}</td>
                  <td className="px-6 py-3.5 text-right text-danger-600 dark:text-danger-400">{formatCurrency(q.ausgaben)}</td>
                  <td className={`px-6 py-3.5 text-right font-semibold ${q.einnahmen - q.ausgaben >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-danger-600 dark:text-danger-400'}`}>
                    {formatCurrency(q.einnahmen - q.ausgaben)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hinweis */}
        <div className="bg-w-tint border border-w-tint-border rounded-2xl p-4">
          <p className="text-xs text-w-on-tint leading-relaxed">
            <strong>Hinweis:</strong> Diese \u00dcbersicht dient als Hilfe zur Erstellung Ihrer Einnahmen-\u00dcberschuss-Rechnung.
            Bitte besprechen Sie die Daten mit Ihrem Steuerberater, bevor Sie diese beim Finanzamt einreichen.
            Die offizielle E\u00dcR muss \u00fcber die Anlage E\u00dcR zur Einkommensteuererkl\u00e4rung (Formular) beim Finanzamt abgegeben werden.
          </p>
        </div>
      </div>
    </>
  );
}

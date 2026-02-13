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
      { label: 'Q1 (Jan–Mär)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q2 (Apr–Jun)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q3 (Jul–Sep)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q4 (Okt–Dez)', einnahmen: 0, ausgaben: 0 },
    ];
    jahresEinnahmen.forEach(e => { q[Math.floor(new Date(e.datum).getMonth() / 3)].einnahmen += e.betrag; });
    jahresAusgaben.forEach(a => { q[Math.floor(new Date(a.datum).getMonth() / 3)].ausgaben += a.betrag; });
    return q;
  }, [jahresEinnahmen, jahresAusgaben]);

  return (
    <>
      <Header
        title="EÜR-Bericht"
        subtitle={`Einnahmen-Überschuss-Rechnung ${geschaeftsjahr}`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button onClick={() => exportEURBerichtCSV(jahresEinnahmen, jahresAusgaben, geschaeftsjahr)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold glass rounded-lg hover:bg-card-alt/40 transition-colors">
              <Download size={13} /><span className="hidden sm:inline">CSV</span>
            </button>
            <button onClick={printEURBericht} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all">
              <Printer size={13} /><span className="hidden sm:inline">Drucken</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Header Card */}
        <div className="glass rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-heading">Einnahmen-Überschuss-Rechnung (EÜR)</h3>
              <p className="text-xs text-body mt-0.5">Geschäftsjahr {geschaeftsjahr} {firmenname && `— ${firmenname}`}</p>
              {steuernummer && <p className="text-xs text-muted">Steuernummer: {steuernummer}</p>}
              {kleinunternehmer && (
                <span className="inline-flex mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-p-tint/80 text-p-on-tint rounded-md backdrop-blur-sm">
                  Kleinunternehmerregelung (§ 19 UStG)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-s-on-tint uppercase tracking-wide">Betriebseinnahmen</p>
            <p className="text-xl font-black text-s-on-tint mt-1">{formatCurrency(gesamtEinnahmen)}</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-d-on-tint uppercase tracking-wide">Betriebsausgaben</p>
            <p className="text-xl font-black text-d-on-tint mt-1">{formatCurrency(gesamtAusgaben)}</p>
          </div>
          <div className={`glass rounded-lg p-4 text-center ${gewinn >= 0 ? 'bg-p-tint/20' : 'bg-d-tint/20'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{gewinn >= 0 ? 'Gewinn' : 'Verlust'}</p>
            <p className={`text-xl font-black mt-1 ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{formatCurrency(gewinn)}</p>
          </div>
        </div>

        {/* Einnahmen Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 bg-s-tint/30 backdrop-blur-sm">
            <h3 className="text-xs font-black text-s-on-tint uppercase tracking-wide">I. Betriebseinnahmen</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider/50">
                <th className="text-left px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Kategorie</th>
                <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/30">
              {einnahmenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-card-alt/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-heading">{getEinnahmeKategorieLabel(kat as any)}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-heading">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {einnahmenByKat.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-xs text-muted">Keine Einnahmen</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-s-tint-border/50 bg-s-tint/30 backdrop-blur-sm">
                <td className="px-4 py-2.5 text-xs font-black text-s-on-tint uppercase tracking-wide">Summe Betriebseinnahmen</td>
                <td className="px-4 py-2.5 text-right text-xs font-black text-s-on-tint">{formatCurrency(gesamtEinnahmen)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ausgaben Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 bg-d-tint/30 backdrop-blur-sm">
            <h3 className="text-xs font-black text-d-on-tint uppercase tracking-wide">II. Betriebsausgaben</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider/50">
                <th className="text-left px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Kategorie</th>
                <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/30">
              {ausgabenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-card-alt/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-heading">{getAusgabeKategorieLabel(kat as any)}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-heading">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {ausgabenByKat.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-xs text-muted">Keine Ausgaben</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-d-tint-border/50 bg-d-tint/30 backdrop-blur-sm">
                <td className="px-4 py-2.5 text-xs font-black text-d-on-tint uppercase tracking-wide">Summe Betriebsausgaben</td>
                <td className="px-4 py-2.5 text-right text-xs font-black text-d-on-tint">{formatCurrency(gesamtAusgaben)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ergebnis */}
        <div className={`glass rounded-lg p-4 ${gewinn >= 0 ? 'bg-p-tint/20' : 'bg-d-tint/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-black ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>III. Ergebnis (Gewinn / Verlust)</h3>
              <p className={`text-xs mt-0.5 ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>
                Betriebseinnahmen {formatCurrency(gesamtEinnahmen)} − Betriebsausgaben {formatCurrency(gesamtAusgaben)}
              </p>
            </div>
            <p className={`text-2xl font-black ${gewinn >= 0 ? 'text-p-on-tint' : 'text-d-on-tint'}`}>{formatCurrency(gewinn)}</p>
          </div>
        </div>

        {/* Quartalsübersicht */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider/50 bg-card-alt/30">
            <h3 className="text-xs font-black text-heading uppercase tracking-wide">Quartalsübersicht</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider/50 bg-card-alt/30">
                <th className="text-left px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Quartal</th>
                <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Einnahmen</th>
                <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Ausgaben</th>
                <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Ergebnis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/30">
              {quartalsDaten.map(q => (
                <tr key={q.label} className="hover:bg-card-alt/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-semibold text-heading">{q.label}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-success-600 dark:text-success-400">{formatCurrency(q.einnahmen)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-danger-600 dark:text-danger-400">{formatCurrency(q.ausgaben)}</td>
                  <td className={`px-4 py-2.5 text-right text-xs font-bold ${q.einnahmen - q.ausgaben >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-danger-600 dark:text-danger-400'}`}>
                    {formatCurrency(q.einnahmen - q.ausgaben)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hinweis */}
        <div className="glass rounded-lg p-3">
          <p className="text-[10px] text-w-on-tint leading-relaxed">
            <strong>Hinweis:</strong> Diese Übersicht dient als Hilfe zur Erstellung Ihrer Einnahmen-Überschuss-Rechnung.
            Bitte besprechen Sie die Daten mit Ihrem Steuerberater, bevor Sie diese beim Finanzamt einreichen.
            Die offizielle EÜR muss über die Anlage EÜR zur Einkommensteuererklärung (Formular) beim Finanzamt abgegeben werden.
          </p>
        </div>
      </div>
    </>
  );
}

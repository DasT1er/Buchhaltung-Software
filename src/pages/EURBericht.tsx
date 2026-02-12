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

  const jahresEinnahmen = useMemo(
    () => einnahmen.filter(e => new Date(e.datum).getFullYear() === geschaeftsjahr),
    [einnahmen, geschaeftsjahr],
  );

  const jahresAusgaben = useMemo(
    () => ausgaben.filter(a => new Date(a.datum).getFullYear() === geschaeftsjahr),
    [ausgaben, geschaeftsjahr],
  );

  const einnahmenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresEinnahmen.forEach(e => {
      map[e.kategorie] = (map[e.kategorie] ?? 0) + e.betrag;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jahresEinnahmen]);

  const ausgabenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresAusgaben.forEach(a => {
      map[a.kategorie] = (map[a.kategorie] ?? 0) + a.betrag;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jahresAusgaben]);

  const gesamtEinnahmen = useMemo(() => jahresEinnahmen.reduce((s, e) => s + e.betrag, 0), [jahresEinnahmen]);
  const gesamtAusgaben = useMemo(() => jahresAusgaben.reduce((s, a) => s + a.betrag, 0), [jahresAusgaben]);
  const gewinn = gesamtEinnahmen - gesamtAusgaben;

  // Quartalsübersicht
  const quartalsDaten = useMemo(() => {
    const quartale = [
      { label: 'Q1 (Jan-Mär)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q2 (Apr-Jun)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q3 (Jul-Sep)', einnahmen: 0, ausgaben: 0 },
      { label: 'Q4 (Okt-Dez)', einnahmen: 0, ausgaben: 0 },
    ];
    jahresEinnahmen.forEach(e => {
      const q = Math.floor(new Date(e.datum).getMonth() / 3);
      quartale[q].einnahmen += e.betrag;
    });
    jahresAusgaben.forEach(a => {
      const q = Math.floor(new Date(a.datum).getMonth() / 3);
      quartale[q].ausgaben += a.betrag;
    });
    return quartale;
  }, [jahresEinnahmen, jahresAusgaben]);

  return (
    <>
      <Header
        title="EÜR-Bericht"
        subtitle={`Einnahmen-Überschuss-Rechnung ${geschaeftsjahr}`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportEURBerichtCSV(jahresEinnahmen, jahresAusgaben, geschaeftsjahr)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={printEURBericht}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Drucken</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 rounded-xl">
              <FileText size={24} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Einnahmen-Überschuss-Rechnung (EÜR)
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Geschäftsjahr {geschaeftsjahr} {firmenname && `- ${firmenname}`}
              </p>
              {steuernummer && (
                <p className="text-sm text-slate-500">Steuernummer: {steuernummer}</p>
              )}
              {kleinunternehmer && (
                <span className="inline-flex mt-2 px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                  Kleinunternehmerregelung (§ 19 UStG)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ergebnis-Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-success-50 border border-success-100 rounded-xl p-5 text-center">
            <p className="text-sm font-medium text-success-700">Betriebseinnahmen</p>
            <p className="text-2xl font-bold text-success-700 mt-1">{formatCurrency(gesamtEinnahmen)}</p>
          </div>
          <div className="bg-danger-50 border border-danger-100 rounded-xl p-5 text-center">
            <p className="text-sm font-medium text-danger-700">Betriebsausgaben</p>
            <p className="text-2xl font-bold text-danger-700 mt-1">{formatCurrency(gesamtAusgaben)}</p>
          </div>
          <div className={`${gewinn >= 0 ? 'bg-primary-50 border-primary-100' : 'bg-danger-50 border-danger-100'} border rounded-xl p-5 text-center`}>
            <p className={`text-sm font-medium ${gewinn >= 0 ? 'text-primary-700' : 'text-danger-700'}`}>
              {gewinn >= 0 ? 'Gewinn' : 'Verlust'}
            </p>
            <p className={`text-2xl font-bold mt-1 ${gewinn >= 0 ? 'text-primary-700' : 'text-danger-700'}`}>
              {formatCurrency(gewinn)}
            </p>
          </div>
        </div>

        {/* Einnahmen Detail */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-success-50">
            <h3 className="text-sm font-bold text-success-800">I. Betriebseinnahmen</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Kategorie</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {einnahmenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-700">{getEinnahmeKategorieLabel(kat as any)}</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {einnahmenByKat.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-slate-400">Keine Einnahmen</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-success-200 bg-success-50">
                <td className="px-6 py-3 font-bold text-success-800">Summe Betriebseinnahmen</td>
                <td className="px-6 py-3 text-right font-bold text-success-800">{formatCurrency(gesamtEinnahmen)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ausgaben Detail */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-danger-50">
            <h3 className="text-sm font-bold text-danger-800">II. Betriebsausgaben</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Kategorie</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ausgabenByKat.map(([kat, betrag]) => (
                <tr key={kat} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-700">{getAusgabeKategorieLabel(kat as any)}</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-700">{formatCurrency(betrag)}</td>
                </tr>
              ))}
              {ausgabenByKat.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-slate-400">Keine Ausgaben</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-danger-200 bg-danger-50">
                <td className="px-6 py-3 font-bold text-danger-800">Summe Betriebsausgaben</td>
                <td className="px-6 py-3 text-right font-bold text-danger-800">{formatCurrency(gesamtAusgaben)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ergebnis */}
        <div className={`rounded-xl p-6 shadow-sm border ${gewinn >= 0 ? 'bg-primary-50 border-primary-200' : 'bg-danger-50 border-danger-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-bold ${gewinn >= 0 ? 'text-primary-800' : 'text-danger-800'}`}>
                III. Ergebnis (Gewinn / Verlust)
              </h3>
              <p className={`text-sm mt-1 ${gewinn >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
                Betriebseinnahmen {formatCurrency(gesamtEinnahmen)} - Betriebsausgaben {formatCurrency(gesamtAusgaben)}
              </p>
            </div>
            <p className={`text-3xl font-bold ${gewinn >= 0 ? 'text-primary-700' : 'text-danger-700'}`}>
              {formatCurrency(gewinn)}
            </p>
          </div>
        </div>

        {/* Quartalsübersicht */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Quartalsübersicht</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Quartal</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Einnahmen</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Ausgaben</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-600">Ergebnis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quartalsDaten.map(q => (
                <tr key={q.label} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{q.label}</td>
                  <td className="px-6 py-3 text-right text-success-600">{formatCurrency(q.einnahmen)}</td>
                  <td className="px-6 py-3 text-right text-danger-600">{formatCurrency(q.ausgaben)}</td>
                  <td className={`px-6 py-3 text-right font-semibold ${q.einnahmen - q.ausgaben >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
                    {formatCurrency(q.einnahmen - q.ausgaben)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hinweis */}
        <div className="bg-warning-50 border border-warning-100 rounded-xl p-4">
          <p className="text-xs text-warning-600">
            <strong>Hinweis:</strong> Diese Übersicht dient als Hilfe zur Erstellung Ihrer Einnahmen-Überschuss-Rechnung.
            Bitte besprechen Sie die Daten mit Ihrem Steuerberater, bevor Sie diese beim Finanzamt einreichen.
            Die offizielle EÜR muss über die Anlage EÜR zur Einkommensteuererklärung (Formular) beim Finanzamt abgegeben werden.
          </p>
        </div>
      </div>
    </>
  );
}

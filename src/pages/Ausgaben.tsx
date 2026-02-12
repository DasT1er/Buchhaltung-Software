import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ausgabeKategorien, zahlungsarten, getAusgabeKategorieLabel, getZahlungsartLabel } from '../utils/categories';
import { exportAusgabenCSV } from '../utils/exportUtils';
import type { Ausgabe, AusgabeKategorie, Zahlungsart } from '../types';

export default function Ausgaben() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { ausgaben, geschaeftsjahr, addAusgabe, updateAusgabe, deleteAusgabe } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Ausgabe | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState<string>('');

  const jahresAusgaben = useMemo(
    () => ausgaben
      .filter(a => new Date(a.datum).getFullYear() === geschaeftsjahr)
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()),
    [ausgaben, geschaeftsjahr],
  );

  const filtered = useMemo(() => {
    let result = jahresAusgaben;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.beschreibung.toLowerCase().includes(s) ||
        (a.belegnummer ?? '').toLowerCase().includes(s),
      );
    }
    if (filterKat) {
      result = result.filter(a => a.kategorie === filterKat);
    }
    return result;
  }, [jahresAusgaben, search, filterKat]);

  const gesamt = useMemo(() => filtered.reduce((s, a) => s + a.betrag, 0), [filtered]);

  function openNew() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(item: Ausgabe) {
    setEditItem(item);
    setShowModal(true);
  }

  function handleSave(data: Omit<Ausgabe, 'id'>) {
    if (editItem) {
      updateAusgabe({ ...data, id: editItem.id });
    } else {
      addAusgabe({ ...data, id: uuidv4() });
    }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Ausgaben"
        subtitle={`${geschaeftsjahr} - ${filtered.length} Einträge`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportAusgabenCSV(filtered)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Neue Ausgabe</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterKat}
            onChange={e => setFilterKat(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Alle Kategorien</option>
            {ausgabeKategorien.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="bg-danger-50 border border-danger-100 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-danger-700">Gesamt ({filtered.length} Einträge)</span>
          <span className="text-lg font-bold text-danger-700">{formatCurrency(gesamt)}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Beschreibung</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Kategorie</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Zahlung</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Betrag</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 w-24">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(item.datum)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-700">{item.beschreibung}</p>
                        {item.belegnummer && (
                          <p className="text-xs text-slate-400">Beleg: {item.belegnummer}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-warning-50 text-warning-600 rounded-full">
                        {getAusgabeKategorieLabel(item.kategorie)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{getZahlungsartLabel(item.zahlungsart)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-danger-600 whitespace-nowrap">
                      -{formatCurrency(item.betrag)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Keine Ausgaben gefunden. Klicke auf "Neue Ausgabe" um zu beginnen.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AusgabeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initial={editItem}
      />

      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteAusgabe(deleteId)}
      />
    </>
  );
}

function AusgabeModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Ausgabe, 'id'>) => void;
  initial: Ausgabe | null;
}) {
  const [datum, setDatum] = useState(initial?.datum ?? new Date().toISOString().slice(0, 10));
  const [beschreibung, setBeschreibung] = useState(initial?.beschreibung ?? '');
  const [betrag, setBetrag] = useState(initial?.betrag?.toString() ?? '');
  const [kategorie, setKategorie] = useState<AusgabeKategorie>(initial?.kategorie ?? 'kraftstoff');
  const [zahlungsart, setZahlungsart] = useState<Zahlungsart>(initial?.zahlungsart ?? 'ec-karte');
  const [belegnummer, setBelegnummer] = useState(initial?.belegnummer ?? '');
  const [notizen, setNotizen] = useState(initial?.notizen ?? '');

  useState(() => {
    if (isOpen) {
      setDatum(initial?.datum ?? new Date().toISOString().slice(0, 10));
      setBeschreibung(initial?.beschreibung ?? '');
      setBetrag(initial?.betrag?.toString() ?? '');
      setKategorie(initial?.kategorie ?? 'kraftstoff');
      setZahlungsart(initial?.zahlungsart ?? 'ec-karte');
      setBelegnummer(initial?.belegnummer ?? '');
      setNotizen(initial?.notizen ?? '');
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(betrag.replace(',', '.'));
    if (!beschreibung || isNaN(amount) || amount <= 0) return;
    onSave({
      datum,
      beschreibung,
      betrag: amount,
      kategorie,
      zahlungsart,
      belegnummer: belegnummer || undefined,
      notizen: notizen || undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Datum *</label>
            <input
              type="date"
              value={datum}
              onChange={e => setDatum(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Betrag (EUR) *</label>
            <input
              type="text"
              value={betrag}
              onChange={e => setBetrag(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung *</label>
          <input
            type="text"
            value={beschreibung}
            onChange={e => setBeschreibung(e.target.value)}
            placeholder="z.B. Tankrechnung Shell A2"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategorie</label>
            <select
              value={kategorie}
              onChange={e => setKategorie(e.target.value as AusgabeKategorie)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {ausgabeKategorien.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zahlungsart</label>
            <select
              value={zahlungsart}
              onChange={e => setZahlungsart(e.target.value as Zahlungsart)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {zahlungsarten.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Belegnummer</label>
          <input
            type="text"
            value={belegnummer}
            onChange={e => setBelegnummer(e.target.value)}
            placeholder="BEL-001"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
          <textarea
            value={notizen}
            onChange={e => setNotizen(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {initial ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

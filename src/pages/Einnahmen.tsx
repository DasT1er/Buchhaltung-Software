import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Download, Paperclip } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import BelegeUpload from '../components/BelegeUpload';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { einnahmeKategorien, zahlungsarten, getEinnahmeKategorieLabel, getZahlungsartLabel } from '../utils/categories';
import { exportEinnahmenCSV } from '../utils/exportUtils';
import type { Einnahme, EinnahmeKategorie, Zahlungsart, BelegMeta } from '../types';

const inputCls = 'w-full px-3 py-2.5 text-sm bg-input border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors';
const labelCls = 'block text-[13px] font-medium text-heading mb-1.5';

export default function Einnahmen() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { einnahmen, kunden, geschaeftsjahr, addEinnahme, updateEinnahme, deleteEinnahme } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Einnahme | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState<string>('');

  const jahresEinnahmen = useMemo(
    () => einnahmen
      .filter(e => new Date(e.datum).getFullYear() === geschaeftsjahr)
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()),
    [einnahmen, geschaeftsjahr],
  );

  const filtered = useMemo(() => {
    let result = jahresEinnahmen;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(e =>
        e.beschreibung.toLowerCase().includes(s) ||
        (e.kunde ?? '').toLowerCase().includes(s) ||
        (e.rechnungsnummer ?? '').toLowerCase().includes(s),
      );
    }
    if (filterKat) {
      result = result.filter(e => e.kategorie === filterKat);
    }
    return result;
  }, [jahresEinnahmen, search, filterKat]);

  const gesamt = useMemo(() => filtered.reduce((s, e) => s + e.betrag, 0), [filtered]);

  function openNew() { setEditItem(null); setShowModal(true); }
  function openEdit(item: Einnahme) { setEditItem(item); setShowModal(true); }

  function handleSave(data: Omit<Einnahme, 'id'>) {
    if (editItem) {
      updateEinnahme({ ...data, id: editItem.id });
    } else {
      addEinnahme({ ...data, id: uuidv4() });
    }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Einnahmen"
        subtitle={`${geschaeftsjahr} \u2022 ${filtered.length} Eintr\u00e4ge`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportEinnahmenCSV(filtered)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-body bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-success-600 rounded-xl hover:bg-success-700 transition-colors shadow-sm shadow-success-600/20"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Neue Einnahme</span>
            </button>
          </div>
        }
      />

      <div className="p-5 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors"
            />
          </div>
          <select
            value={filterKat}
            onChange={e => setFilterKat(e.target.value)}
            className="px-3 py-2.5 text-sm bg-card border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-heading transition-colors"
          >
            <option value="">Alle Kategorien</option>
            {einnahmeKategorien.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-s-tint border border-s-tint-border rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-s-on-tint">Gesamt ({filtered.length} Eintr\u00e4ge)</span>
          <span className="text-lg font-bold text-s-on-tint">{formatCurrency(gesamt)}</span>
        </div>

        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider bg-card-alt/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Datum</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Beschreibung</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Kategorie</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Zahlung</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Betrag</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider-light">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-card-alt/50 transition-colors">
                    <td className="px-5 py-3.5 text-body whitespace-nowrap">{formatDate(item.datum)}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-heading">{item.beschreibung}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.rechnungsnummer && <p className="text-xs text-muted">Re.Nr.: {item.rechnungsnummer}</p>}
                          {item.belege && item.belege.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-primary-600 dark:text-primary-400">
                              <Paperclip size={11} />{item.belege.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-p-tint text-p-on-tint rounded-lg">
                        {getEinnahmeKategorieLabel(item.kategorie)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted hidden lg:table-cell">{getZahlungsartLabel(item.zahlungsart)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-success-600 dark:text-success-400 whitespace-nowrap">
                      +{formatCurrency(item.betrag)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-muted hover:text-primary-600 hover:bg-p-tint rounded-lg transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted hover:text-danger-600 hover:bg-d-tint rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <TrendingUpEmpty />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EinnahmeModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editItem} kunden={kunden} />
      <DeleteConfirm isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteEinnahme(deleteId)} />
    </>
  );
}

function TrendingUpEmpty() {
  return (
    <div>
      <div className="w-12 h-12 mx-auto rounded-2xl bg-card-alt flex items-center justify-center mb-3">
        <Plus size={20} className="text-muted" />
      </div>
      <p className="text-sm font-medium text-muted">Keine Einnahmen gefunden</p>
      <p className="text-xs text-muted mt-1">Klicke auf &quot;Neue Einnahme&quot; um zu beginnen</p>
    </div>
  );
}

function EinnahmeModal({
  isOpen, onClose, onSave, initial, kunden,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Einnahme, 'id'>) => void;
  initial: Einnahme | null;
  kunden: { id: string; firma: string }[];
}) {
  const [datum, setDatum] = useState(initial?.datum ?? new Date().toISOString().slice(0, 10));
  const [beschreibung, setBeschreibung] = useState(initial?.beschreibung ?? '');
  const [betrag, setBetrag] = useState(initial?.betrag?.toString() ?? '');
  const [kategorie, setKategorie] = useState<EinnahmeKategorie>(initial?.kategorie ?? 'transportleistungen');
  const [zahlungsart, setZahlungsart] = useState<Zahlungsart>(initial?.zahlungsart ?? 'ueberweisung');
  const [rechnungsnummer, setRechnungsnummer] = useState(initial?.rechnungsnummer ?? '');
  const [kunde, setKunde] = useState(initial?.kunde ?? '');
  const [notizen, setNotizen] = useState(initial?.notizen ?? '');
  const [belege, setBelege] = useState<BelegMeta[]>(initial?.belege ?? []);

  useState(() => {
    if (isOpen) {
      setDatum(initial?.datum ?? new Date().toISOString().slice(0, 10));
      setBeschreibung(initial?.beschreibung ?? '');
      setBetrag(initial?.betrag?.toString() ?? '');
      setKategorie(initial?.kategorie ?? 'transportleistungen');
      setZahlungsart(initial?.zahlungsart ?? 'ueberweisung');
      setRechnungsnummer(initial?.rechnungsnummer ?? '');
      setKunde(initial?.kunde ?? '');
      setNotizen(initial?.notizen ?? '');
      setBelege(initial?.belege ?? []);
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(betrag.replace(',', '.'));
    if (!beschreibung || isNaN(amount) || amount <= 0) return;
    onSave({
      datum, beschreibung, betrag: amount, kategorie, zahlungsart,
      rechnungsnummer: rechnungsnummer || undefined,
      kunde: kunde || undefined,
      notizen: notizen || undefined,
      belege: belege.length > 0 ? belege : undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Einnahme bearbeiten' : 'Neue Einnahme'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Datum *</label>
            <input type="date" value={datum} onChange={e => setDatum(e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Betrag (EUR) *</label>
            <input type="text" value={betrag} onChange={e => setBetrag(e.target.value)} placeholder="0,00" className={inputCls} required />
          </div>
        </div>

        <div>
          <label className={labelCls}>Beschreibung *</label>
          <input type="text" value={beschreibung} onChange={e => setBeschreibung(e.target.value)} placeholder="z.B. Transportauftrag Berlin-Hamburg" className={inputCls} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Kategorie</label>
            <select value={kategorie} onChange={e => setKategorie(e.target.value as EinnahmeKategorie)} className={inputCls}>
              {einnahmeKategorien.map(k => (<option key={k.value} value={k.value}>{k.label}</option>))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Zahlungsart</label>
            <select value={zahlungsart} onChange={e => setZahlungsart(e.target.value as Zahlungsart)} className={inputCls}>
              {zahlungsarten.map(z => (<option key={z.value} value={z.value}>{z.label}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Rechnungsnummer</label>
            <input type="text" value={rechnungsnummer} onChange={e => setRechnungsnummer(e.target.value)} placeholder="RE-2026-001" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Kunde</label>
            <select value={kunde} onChange={e => setKunde(e.target.value)} className={inputCls}>
              <option value="">-- Kein Kunde --</option>
              {kunden.map(k => (<option key={k.id} value={k.firma}>{k.firma}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Notizen</label>
          <textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>

        <BelegeUpload belege={belege} onChange={setBelege} />

        <div className="flex justify-end gap-3 pt-3 border-t border-divider-light">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-heading bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors">
            Abbrechen
          </button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
            {initial ? 'Speichern' : 'Hinzuf\u00fcgen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

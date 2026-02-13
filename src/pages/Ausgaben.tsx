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
import { ausgabeKategorien, zahlungsarten, getAusgabeKategorieLabel, getZahlungsartLabel } from '../utils/categories';
import { exportAusgabenCSV } from '../utils/exportUtils';
import type { Ausgabe, AusgabeKategorie, Zahlungsart, BelegMeta } from '../types';

const inputCls = 'w-full px-3 py-2 text-xs glass rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all';
const labelCls = 'block text-[10px] font-bold text-heading mb-1 uppercase tracking-wide';

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

  function openNew() { setEditItem(null); setShowModal(true); }
  function openEdit(item: Ausgabe) { setEditItem(item); setShowModal(true); }

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
        subtitle={`${geschaeftsjahr} • ${filtered.length} Einträge`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportAusgabenCSV(filtered)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold glass rounded-lg hover:bg-card-alt/40 transition-colors"
            >
              <Download size={13} />
              CSV
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-br from-danger-500 to-danger-700 rounded-lg hover:shadow-lg hover:shadow-danger-500/30 transition-all"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Neue Ausgabe</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="glass w-full pl-9 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all"
            />
          </div>
          <select
            value={filterKat}
            onChange={e => setFilterKat(e.target.value)}
            className="glass px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all"
          >
            <option value="">Alle Kategorien</option>
            {ausgabeKategorien.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="glass rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-d-on-tint uppercase tracking-wide">Gesamt ({filtered.length})</span>
          <span className="text-base font-black text-d-on-tint">{formatCurrency(gesamt)}</span>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider/50 bg-card-alt/30">
                  <th className="text-left px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Datum</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Beschreibung</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-muted uppercase tracking-wider hidden md:table-cell">Kategorie</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-muted uppercase tracking-wider hidden lg:table-cell">Zahlung</th>
                  <th className="text-right px-3 py-2 text-[10px] font-black text-muted uppercase tracking-wider">Betrag</th>
                  <th className="text-right px-4 py-2 text-[10px] font-black text-muted uppercase tracking-wider w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/30">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-card-alt/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-body whitespace-nowrap">{formatDate(item.datum)}</td>
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="text-xs font-semibold text-heading">{item.beschreibung}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.belegnummer && <p className="text-[10px] text-muted">Beleg: {item.belegnummer}</p>}
                          {item.belege && item.belege.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-primary-600 dark:text-primary-400">
                              <Paperclip size={9} />{item.belege.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-bold bg-w-tint/80 text-w-on-tint rounded-md backdrop-blur-sm">
                        {getAusgabeKategorieLabel(item.kategorie)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-muted hidden lg:table-cell">{getZahlungsartLabel(item.zahlungsart)}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold text-danger-600 dark:text-danger-400 whitespace-nowrap">
                      -{formatCurrency(item.betrag)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button onClick={() => openEdit(item)} className="p-1 text-muted hover:text-primary-600 hover:bg-p-tint/60 rounded-md transition-colors backdrop-blur-sm">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1 text-muted hover:text-danger-600 hover:bg-d-tint/60 rounded-md transition-colors backdrop-blur-sm">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div>
                        <div className="w-12 h-12 mx-auto rounded-2xl glass flex items-center justify-center mb-3">
                          <Plus size={20} className="text-muted" />
                        </div>
                        <p className="text-sm font-medium text-muted">Keine Ausgaben gefunden</p>
                        <p className="text-xs text-muted mt-1">Klicke auf &quot;Neue Ausgabe&quot; um zu beginnen</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AusgabeModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editItem} />
      <DeleteConfirm isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteAusgabe(deleteId)} />
    </>
  );
}

function AusgabeModal({
  isOpen, onClose, onSave, initial,
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
  const [belege, setBelege] = useState<BelegMeta[]>(initial?.belege ?? []);

  useState(() => {
    if (isOpen) {
      setDatum(initial?.datum ?? new Date().toISOString().slice(0, 10));
      setBeschreibung(initial?.beschreibung ?? '');
      setBetrag(initial?.betrag?.toString() ?? '');
      setKategorie(initial?.kategorie ?? 'kraftstoff');
      setZahlungsart(initial?.zahlungsart ?? 'ec-karte');
      setBelegnummer(initial?.belegnummer ?? '');
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
      belegnummer: belegnummer || undefined,
      notizen: notizen || undefined,
      belege: belege.length > 0 ? belege : undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <input type="text" value={beschreibung} onChange={e => setBeschreibung(e.target.value)} placeholder="z.B. Tankrechnung Shell A2" className={inputCls} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Kategorie</label>
            <select value={kategorie} onChange={e => setKategorie(e.target.value as AusgabeKategorie)} className={inputCls}>
              {ausgabeKategorien.map(k => (<option key={k.value} value={k.value}>{k.label}</option>))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Zahlungsart</label>
            <select value={zahlungsart} onChange={e => setZahlungsart(e.target.value as Zahlungsart)} className={inputCls}>
              {zahlungsarten.map(z => (<option key={z.value} value={z.value}>{z.label}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Belegnummer</label>
          <input type="text" value={belegnummer} onChange={e => setBelegnummer(e.target.value)} placeholder="BEL-001" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Notizen</label>
          <textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>

        <BelegeUpload belege={belege} onChange={setBelege} />

        <div className="flex justify-end gap-2 pt-3 border-t border-divider/50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-heading glass rounded-lg hover:bg-card-alt/40 transition-colors">
            Abbrechen
          </button>
          <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all">
            {initial ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

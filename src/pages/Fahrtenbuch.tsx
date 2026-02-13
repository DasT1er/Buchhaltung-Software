import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Download, MapPin, Car } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/formatters';
import { exportFahrtenCSV } from '../utils/exportUtils';
import type { Fahrt } from '../types';

const inputCls = 'w-full px-3 py-2.5 text-sm bg-input border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors';
const labelCls = 'block text-[13px] font-medium text-heading mb-1.5';

export default function Fahrtenbuch() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { fahrten, kunden, geschaeftsjahr, addFahrt, updateFahrt, deleteFahrt } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Fahrt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const jahresFahrten = useMemo(
    () => fahrten.filter(f => new Date(f.datum).getFullYear() === geschaeftsjahr).sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()),
    [fahrten, geschaeftsjahr],
  );

  const filtered = useMemo(() => {
    if (!search) return jahresFahrten;
    const s = search.toLowerCase();
    return jahresFahrten.filter(f => f.startort.toLowerCase().includes(s) || f.zielort.toLowerCase().includes(s) || f.zweck.toLowerCase().includes(s) || (f.kunde ?? '').toLowerCase().includes(s));
  }, [jahresFahrten, search]);

  const gesamtKm = useMemo(() => filtered.reduce((s, f) => s + f.kilometer, 0), [filtered]);

  function openNew() { setEditItem(null); setShowModal(true); }
  function openEdit(item: Fahrt) { setEditItem(item); setShowModal(true); }

  function handleSave(data: Omit<Fahrt, 'id'>) {
    if (editItem) { updateFahrt({ ...data, id: editItem.id }); }
    else { addFahrt({ ...data, id: uuidv4() }); }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Fahrtenbuch"
        subtitle={`${geschaeftsjahr} \u2022 ${filtered.length} Fahrten`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button onClick={() => exportFahrtenCSV(filtered)} className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-body bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors">
              <Download size={15} />CSV
            </button>
            <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
              <Plus size={16} /><span className="hidden sm:inline">Neue Fahrt</span>
            </button>
          </div>
        }
      />

      <div className="p-5 sm:p-8 space-y-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="text" placeholder="Fahrten suchen..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors" />
        </div>

        <div className="bg-p-tint border border-p-tint-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20">
              <Car size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-p-on-tint">Gesamt: {filtered.length} Fahrten</span>
          </div>
          <span className="text-lg font-bold text-p-on-tint">{gesamtKm.toLocaleString('de-DE')} km</span>
        </div>

        <div className="bg-w-tint border border-w-tint-border rounded-2xl p-4">
          <p className="text-xs text-w-on-tint leading-relaxed">
            <strong>Tipp:</strong> Die Kilometerpauschale betr\u00e4gt 0,30 EUR/km (ab dem 21. km: 0,38 EUR/km bei Entfernungspauschale).
            Bei gesch\u00e4ftlichen Fahrten mit eigenem PKW k\u00f6nnen Sie {gesamtKm > 0 ? `bis zu ${(gesamtKm * 0.30).toFixed(2).replace('.', ',')} EUR` : 'die tats\u00e4chlichen Kosten oder die Pauschale'} als Betriebsausgabe geltend machen.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-divider-light overflow-hidden transition-colors" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider bg-card-alt/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Datum</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Zweck</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Kunde</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Kilometer</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider-light">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-card-alt/50 transition-colors">
                    <td className="px-5 py-3.5 text-body whitespace-nowrap">{formatDate(item.datum)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-p-tint flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-p-on-tint" />
                        </div>
                        <div>
                          <p className="font-medium text-heading">{item.startort}</p>
                          <p className="text-xs text-muted">nach {item.zielort}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-body hidden md:table-cell">{item.zweck}</td>
                    <td className="px-5 py-3.5 text-muted hidden lg:table-cell">{item.kunde || '\u2014'}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-heading whitespace-nowrap">{item.kilometer.toLocaleString('de-DE')} km</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-muted hover:text-primary-600 hover:bg-p-tint rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted hover:text-danger-600 hover:bg-d-tint rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-16 text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-card-alt flex items-center justify-center mb-3"><Car size={20} className="text-muted" /></div>
                    <p className="text-sm font-medium text-muted">Keine Fahrten gefunden</p>
                    <p className="text-xs text-muted mt-1">Klicke auf &quot;Neue Fahrt&quot; um zu beginnen</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FahrtModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editItem} kunden={kunden} />
      <DeleteConfirm isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteFahrt(deleteId)} title="Fahrt l\u00f6schen" />
    </>
  );
}

function FahrtModal({ isOpen, onClose, onSave, initial, kunden }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Fahrt, 'id'>) => void; initial: Fahrt | null; kunden: { id: string; firma: string }[] }) {
  const [datum, setDatum] = useState(initial?.datum ?? new Date().toISOString().slice(0, 10));
  const [startort, setStartort] = useState(initial?.startort ?? '');
  const [zielort, setZielort] = useState(initial?.zielort ?? '');
  const [kilometer, setKilometer] = useState(initial?.kilometer?.toString() ?? '');
  const [zweck, setZweck] = useState(initial?.zweck ?? '');
  const [kunde, setKunde] = useState(initial?.kunde ?? '');
  const [fahrzeug, setFahrzeug] = useState(initial?.fahrzeug ?? '');
  const [kennzeichen, setKennzeichen] = useState(initial?.kennzeichen ?? '');
  const [notizen, setNotizen] = useState(initial?.notizen ?? '');

  useState(() => {
    if (isOpen) {
      setDatum(initial?.datum ?? new Date().toISOString().slice(0, 10)); setStartort(initial?.startort ?? '');
      setZielort(initial?.zielort ?? ''); setKilometer(initial?.kilometer?.toString() ?? '');
      setZweck(initial?.zweck ?? ''); setKunde(initial?.kunde ?? '');
      setFahrzeug(initial?.fahrzeug ?? ''); setKennzeichen(initial?.kennzeichen ?? '');
      setNotizen(initial?.notizen ?? '');
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const km = parseFloat(kilometer.replace(',', '.'));
    if (!startort || !zielort || !zweck || isNaN(km) || km <= 0) return;
    onSave({ datum, startort, zielort, kilometer: km, zweck, kunde: kunde || undefined, fahrzeug: fahrzeug || undefined, kennzeichen: kennzeichen || undefined, notizen: notizen || undefined });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Fahrt bearbeiten' : 'Neue Fahrt'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Datum *</label><input type="date" value={datum} onChange={e => setDatum(e.target.value)} className={inputCls} required /></div>
          <div><label className={labelCls}>Kilometer *</label><input type="text" value={kilometer} onChange={e => setKilometer(e.target.value)} placeholder="z.B. 350" className={inputCls} required /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Startort *</label><input type="text" value={startort} onChange={e => setStartort(e.target.value)} placeholder="z.B. Berlin" className={inputCls} required /></div>
          <div><label className={labelCls}>Zielort *</label><input type="text" value={zielort} onChange={e => setZielort(e.target.value)} placeholder="z.B. Hamburg" className={inputCls} required /></div>
        </div>
        <div><label className={labelCls}>Zweck der Fahrt *</label><input type="text" value={zweck} onChange={e => setZweck(e.target.value)} placeholder="z.B. Warenlieferung an Kunde XY" className={inputCls} required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Kunde</label><select value={kunde} onChange={e => setKunde(e.target.value)} className={inputCls}><option value="">-- Keiner --</option>{kunden.map(k => (<option key={k.id} value={k.firma}>{k.firma}</option>))}</select></div>
          <div><label className={labelCls}>Fahrzeug</label><input type="text" value={fahrzeug} onChange={e => setFahrzeug(e.target.value)} placeholder="z.B. Sprinter" className={inputCls} /></div>
          <div><label className={labelCls}>Kennzeichen</label><input type="text" value={kennzeichen} onChange={e => setKennzeichen(e.target.value)} placeholder="B-XX 1234" className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Notizen</label><textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
        <div className="flex justify-end gap-3 pt-3 border-t border-divider-light">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-heading bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors">Abbrechen</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">{initial ? 'Speichern' : 'Hinzuf\u00fcgen'}</button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { useStore } from '../store/useStore';
import type { Kunde } from '../types';

const inputCls = 'w-full px-3 py-2.5 text-sm bg-input border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors';
const labelCls = 'block text-[13px] font-medium text-heading mb-1.5';

export default function Kunden() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { kunden, addKunde, updateKunde, deleteKunde } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Kunde | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return kunden;
    const s = search.toLowerCase();
    return kunden.filter(k =>
      k.firma.toLowerCase().includes(s) ||
      (k.ansprechpartner ?? '').toLowerCase().includes(s) ||
      (k.ort ?? '').toLowerCase().includes(s) ||
      (k.email ?? '').toLowerCase().includes(s),
    );
  }, [kunden, search]);

  function openNew() { setEditItem(null); setShowModal(true); }
  function openEdit(item: Kunde) { setEditItem(item); setShowModal(true); }

  function handleSave(data: Omit<Kunde, 'id'>) {
    if (editItem) { updateKunde({ ...data, id: editItem.id }); }
    else { addKunde({ ...data, id: uuidv4() }); }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Kunden"
        subtitle={`${kunden.length} Kunden gespeichert`}
        onMenuClick={onMenuClick}
        actions={
          <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
            <Plus size={16} /><span className="hidden sm:inline">Neuer Kunde</span>
          </button>
        }
      />

      <div className="p-5 sm:p-8 space-y-5">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Kunden suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-card border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-heading transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(kunde => (
            <div key={kunde.id} className="bg-card rounded-2xl p-5 border border-divider-light hover:border-divider transition-all" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-heading truncate">{kunde.firma}</h4>
                    {kunde.ansprechpartner && <p className="text-xs text-muted">{kunde.ansprechpartner}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <button onClick={() => openEdit(kunde)} className="p-1.5 text-muted hover:text-primary-600 hover:bg-p-tint rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteId(kunde.id)} className="p-1.5 text-muted hover:text-danger-600 hover:bg-d-tint rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {(kunde.strasse || kunde.plz || kunde.ort) && (
                  <p className="text-body text-xs">{[kunde.strasse, `${kunde.plz ?? ''} ${kunde.ort ?? ''}`.trim()].filter(Boolean).join(', ')}</p>
                )}
                {kunde.email && (
                  <div className="flex items-center gap-2 text-body"><Mail size={13} className="text-muted shrink-0" /><span className="text-xs truncate">{kunde.email}</span></div>
                )}
                {kunde.telefon && (
                  <div className="flex items-center gap-2 text-body"><Phone size={13} className="text-muted shrink-0" /><span className="text-xs">{kunde.telefon}</span></div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-card-alt flex items-center justify-center mb-3">
                <Building2 size={24} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-muted">Keine Kunden gefunden</p>
              <p className="text-xs text-muted mt-1">Klicke auf &quot;Neuer Kunde&quot; um zu beginnen</p>
            </div>
          )}
        </div>
      </div>

      <KundeModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editItem} />
      <DeleteConfirm isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteKunde(deleteId)} title="Kunde l\u00f6schen" message="M\u00f6chten Sie diesen Kunden wirklich l\u00f6schen?" />
    </>
  );
}

function KundeModal({ isOpen, onClose, onSave, initial }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Kunde, 'id'>) => void; initial: Kunde | null }) {
  const [firma, setFirma] = useState(initial?.firma ?? '');
  const [ansprechpartner, setAnsprechpartner] = useState(initial?.ansprechpartner ?? '');
  const [strasse, setStrasse] = useState(initial?.strasse ?? '');
  const [plz, setPlz] = useState(initial?.plz ?? '');
  const [ort, setOrt] = useState(initial?.ort ?? '');
  const [telefon, setTelefon] = useState(initial?.telefon ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [steuernummer, setSteuernummer] = useState(initial?.steuernummer ?? '');
  const [notizen, setNotizen] = useState(initial?.notizen ?? '');

  useState(() => {
    if (isOpen) {
      setFirma(initial?.firma ?? ''); setAnsprechpartner(initial?.ansprechpartner ?? '');
      setStrasse(initial?.strasse ?? ''); setPlz(initial?.plz ?? ''); setOrt(initial?.ort ?? '');
      setTelefon(initial?.telefon ?? ''); setEmail(initial?.email ?? '');
      setSteuernummer(initial?.steuernummer ?? ''); setNotizen(initial?.notizen ?? '');
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firma) return;
    onSave({
      firma, ansprechpartner: ansprechpartner || undefined, strasse: strasse || undefined,
      plz: plz || undefined, ort: ort || undefined, telefon: telefon || undefined,
      email: email || undefined, steuernummer: steuernummer || undefined, notizen: notizen || undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Kunde bearbeiten' : 'Neuer Kunde'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelCls}>Firma / Name *</label><input type="text" value={firma} onChange={e => setFirma(e.target.value)} placeholder="z.B. Spedition M\u00fcller GmbH" className={inputCls} required /></div>
        <div><label className={labelCls}>Ansprechpartner</label><input type="text" value={ansprechpartner} onChange={e => setAnsprechpartner(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Stra\u00dfe</label><input type="text" value={strasse} onChange={e => setStrasse(e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelCls}>PLZ</label><input type="text" value={plz} onChange={e => setPlz(e.target.value)} className={inputCls} /></div>
          <div className="col-span-2"><label className={labelCls}>Ort</label><input type="text" value={ort} onChange={e => setOrt(e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Telefon</label><input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>E-Mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Steuernummer / USt-IdNr.</label><input type="text" value={steuernummer} onChange={e => setSteuernummer(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Notizen</label><textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
        <div className="flex justify-end gap-3 pt-3 border-t border-divider-light">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-heading bg-card-alt border border-divider rounded-xl hover:bg-divider-light transition-colors">Abbrechen</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">{initial ? 'Speichern' : 'Hinzuf\u00fcgen'}</button>
        </div>
      </form>
    </Modal>
  );
}

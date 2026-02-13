import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { useStore } from '../store/useStore';
import type { Kunde } from '../types';

const inputCls = 'w-full px-3 py-2 text-sm glass rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all';
const labelCls = 'block text-xs font-bold text-heading mb-1 uppercase tracking-wide';

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
          <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all">
            <Plus size={14} /><span className="hidden sm:inline">Neuer Kunde</span>
          </button>
        }
      />

      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Kunden suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-heading transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(kunde => (
            <div key={kunde.id} className="glass rounded-lg p-4 hover:bg-card-alt/40 transition-all">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                    <Building2 size={16} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-heading truncate">{kunde.firma}</h4>
                    {kunde.ansprechpartner && <p className="text-xs text-muted">{kunde.ansprechpartner}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <button onClick={() => openEdit(kunde)} className="p-1.5 text-muted hover:text-primary-600 hover:bg-p-tint/60 rounded-md transition-colors backdrop-blur-sm"><Edit2 size={15} /></button>
                  <button onClick={() => setDeleteId(kunde.id)} className="p-1.5 text-muted hover:text-danger-600 hover:bg-d-tint/60 rounded-md transition-colors backdrop-blur-sm"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                {(kunde.strasse || kunde.plz || kunde.ort) && (
                  <p className="text-body text-xs">{[kunde.strasse, `${kunde.plz ?? ''} ${kunde.ort ?? ''}`.trim()].filter(Boolean).join(', ')}</p>
                )}
                {kunde.email && (
                  <div className="flex items-center gap-1.5 text-body"><Mail size={11} className="text-muted shrink-0" /><span className="text-xs truncate">{kunde.email}</span></div>
                )}
                {kunde.telefon && (
                  <div className="flex items-center gap-1.5 text-body"><Phone size={11} className="text-muted shrink-0" /><span className="text-xs">{kunde.telefon}</span></div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl glass flex items-center justify-center mb-3">
                <Building2 size={24} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-muted">Keine Kunden gefunden</p>
              <p className="text-xs text-muted mt-1">Klicke auf &quot;Neuer Kunde&quot; um zu beginnen</p>
            </div>
          )}
        </div>
      </div>

      <KundeModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editItem} />
      <DeleteConfirm isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteKunde(deleteId)} title="Kunde löschen" message="Möchten Sie diesen Kunden wirklich löschen?" />
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className={labelCls}>Firma / Name *</label><input type="text" value={firma} onChange={e => setFirma(e.target.value)} placeholder="z.B. Spedition Müller GmbH" className={inputCls} required /></div>
        <div><label className={labelCls}>Ansprechpartner</label><input type="text" value={ansprechpartner} onChange={e => setAnsprechpartner(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Straße</label><input type="text" value={strasse} onChange={e => setStrasse(e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>PLZ</label><input type="text" value={plz} onChange={e => setPlz(e.target.value)} className={inputCls} /></div>
          <div className="col-span-2"><label className={labelCls}>Ort</label><input type="text" value={ort} onChange={e => setOrt(e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>Telefon</label><input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>E-Mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Steuernummer / USt-IdNr.</label><input type="text" value={steuernummer} onChange={e => setSteuernummer(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Notizen</label><textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
        <div className="flex justify-end gap-2 pt-3 border-t border-divider/50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-heading glass rounded-lg hover:bg-card-alt/40 transition-colors">Abbrechen</button>
          <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all">{initial ? 'Speichern' : 'Hinzufügen'}</button>
        </div>
      </form>
    </Modal>
  );
}

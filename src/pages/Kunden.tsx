import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import Modal from '../components/Modal';
import DeleteConfirm from '../components/DeleteConfirm';
import { useStore } from '../store/useStore';
import type { Kunde } from '../types';

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

  function openNew() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(item: Kunde) {
    setEditItem(item);
    setShowModal(true);
  }

  function handleSave(data: Omit<Kunde, 'id'>) {
    if (editItem) {
      updateKunde({ ...data, id: editItem.id });
    } else {
      addKunde({ ...data, id: uuidv4() });
    }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Kunden"
        subtitle={`${kunden.length} Kunden gespeichert`}
        onMenuClick={onMenuClick}
        actions={
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Neuer Kunde</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kunden suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(kunde => (
            <div
              key={kunde.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Building2 size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{kunde.firma}</h4>
                    {kunde.ansprechpartner && (
                      <p className="text-xs text-slate-500">{kunde.ansprechpartner}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(kunde)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(kunde.id)}
                    className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                {(kunde.strasse || kunde.plz || kunde.ort) && (
                  <p className="text-slate-500 text-xs">
                    {[kunde.strasse, `${kunde.plz ?? ''} ${kunde.ort ?? ''}`.trim()].filter(Boolean).join(', ')}
                  </p>
                )}
                {kunde.email && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={13} />
                    <span className="text-xs truncate">{kunde.email}</span>
                  </div>
                )}
                {kunde.telefon && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={13} />
                    <span className="text-xs">{kunde.telefon}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Keine Kunden gefunden. Klicke auf "Neuer Kunde" um zu beginnen.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <KundeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initial={editItem}
      />

      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteKunde(deleteId)}
        title="Kunde löschen"
        message="Möchten Sie diesen Kunden wirklich löschen?"
      />
    </>
  );
}

function KundeModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Kunde, 'id'>) => void;
  initial: Kunde | null;
}) {
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
      setFirma(initial?.firma ?? '');
      setAnsprechpartner(initial?.ansprechpartner ?? '');
      setStrasse(initial?.strasse ?? '');
      setPlz(initial?.plz ?? '');
      setOrt(initial?.ort ?? '');
      setTelefon(initial?.telefon ?? '');
      setEmail(initial?.email ?? '');
      setSteuernummer(initial?.steuernummer ?? '');
      setNotizen(initial?.notizen ?? '');
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firma) return;
    onSave({
      firma,
      ansprechpartner: ansprechpartner || undefined,
      strasse: strasse || undefined,
      plz: plz || undefined,
      ort: ort || undefined,
      telefon: telefon || undefined,
      email: email || undefined,
      steuernummer: steuernummer || undefined,
      notizen: notizen || undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Kunde bearbeiten' : 'Neuer Kunde'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Name *</label>
          <input
            type="text"
            value={firma}
            onChange={e => setFirma(e.target.value)}
            placeholder="z.B. Spedition Müller GmbH"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ansprechpartner</label>
          <input
            type="text"
            value={ansprechpartner}
            onChange={e => setAnsprechpartner(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Straße</label>
          <input
            type="text"
            value={strasse}
            onChange={e => setStrasse(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
            <input
              type="text"
              value={plz}
              onChange={e => setPlz(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
            <input
              type="text"
              value={ort}
              onChange={e => setOrt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Steuernummer / USt-IdNr.</label>
          <input
            type="text"
            value={steuernummer}
            onChange={e => setSteuernummer(e.target.value)}
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

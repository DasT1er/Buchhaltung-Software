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

export default function Fahrtenbuch() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { fahrten, kunden, geschaeftsjahr, addFahrt, updateFahrt, deleteFahrt } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Fahrt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const jahresFahrten = useMemo(
    () => fahrten
      .filter(f => new Date(f.datum).getFullYear() === geschaeftsjahr)
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()),
    [fahrten, geschaeftsjahr],
  );

  const filtered = useMemo(() => {
    if (!search) return jahresFahrten;
    const s = search.toLowerCase();
    return jahresFahrten.filter(f =>
      f.startort.toLowerCase().includes(s) ||
      f.zielort.toLowerCase().includes(s) ||
      f.zweck.toLowerCase().includes(s) ||
      (f.kunde ?? '').toLowerCase().includes(s),
    );
  }, [jahresFahrten, search]);

  const gesamtKm = useMemo(() => filtered.reduce((s, f) => s + f.kilometer, 0), [filtered]);

  function openNew() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(item: Fahrt) {
    setEditItem(item);
    setShowModal(true);
  }

  function handleSave(data: Omit<Fahrt, 'id'>) {
    if (editItem) {
      updateFahrt({ ...data, id: editItem.id });
    } else {
      addFahrt({ ...data, id: uuidv4() });
    }
    setShowModal(false);
  }

  return (
    <>
      <Header
        title="Fahrtenbuch"
        subtitle={`${geschaeftsjahr} - ${filtered.length} Fahrten`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => exportFahrtenCSV(filtered)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Neue Fahrt</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Fahrten suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Summary */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car size={20} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              Gesamt: {filtered.length} Fahrten
            </span>
          </div>
          <span className="text-lg font-bold text-primary-700">
            {gesamtKm.toLocaleString('de-DE')} km
          </span>
        </div>

        {/* Hinweis Kilometerpauschale */}
        <div className="bg-warning-50 border border-warning-100 rounded-xl p-4">
          <p className="text-xs text-warning-600">
            <strong>Tipp:</strong> Die Kilometerpauschale beträgt 0,30 EUR/km (ab dem 21. km: 0,38 EUR/km bei Entfernungspauschale).
            Bei geschäftlichen Fahrten mit eigenem PKW können Sie {gesamtKm > 0 ? `bis zu ${(gesamtKm * 0.30).toFixed(2).replace('.', ',')} EUR` : 'die tatsächlichen Kosten oder die Pauschale'} als Betriebsausgabe geltend machen.
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Route</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Zweck</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Kunde</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Kilometer</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 w-24">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(item.datum)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-700">{item.startort}</p>
                          <p className="text-xs text-slate-400">nach {item.zielort}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{item.zweck}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{item.kunde || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {item.kilometer.toLocaleString('de-DE')} km
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
                      Keine Fahrten gefunden. Klicke auf "Neue Fahrt" um zu beginnen.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <FahrtModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initial={editItem}
        kunden={kunden}
      />

      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteFahrt(deleteId)}
        title="Fahrt löschen"
      />
    </>
  );
}

function FahrtModal({
  isOpen,
  onClose,
  onSave,
  initial,
  kunden,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Fahrt, 'id'>) => void;
  initial: Fahrt | null;
  kunden: { id: string; firma: string }[];
}) {
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
      setDatum(initial?.datum ?? new Date().toISOString().slice(0, 10));
      setStartort(initial?.startort ?? '');
      setZielort(initial?.zielort ?? '');
      setKilometer(initial?.kilometer?.toString() ?? '');
      setZweck(initial?.zweck ?? '');
      setKunde(initial?.kunde ?? '');
      setFahrzeug(initial?.fahrzeug ?? '');
      setKennzeichen(initial?.kennzeichen ?? '');
      setNotizen(initial?.notizen ?? '');
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const km = parseFloat(kilometer.replace(',', '.'));
    if (!startort || !zielort || !zweck || isNaN(km) || km <= 0) return;
    onSave({
      datum,
      startort,
      zielort,
      kilometer: km,
      zweck,
      kunde: kunde || undefined,
      fahrzeug: fahrzeug || undefined,
      kennzeichen: kennzeichen || undefined,
      notizen: notizen || undefined,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Fahrt bearbeiten' : 'Neue Fahrt'} maxWidth="max-w-xl">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometer *</label>
            <input
              type="text"
              value={kilometer}
              onChange={e => setKilometer(e.target.value)}
              placeholder="z.B. 350"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Startort *</label>
            <input
              type="text"
              value={startort}
              onChange={e => setStartort(e.target.value)}
              placeholder="z.B. Berlin"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zielort *</label>
            <input
              type="text"
              value={zielort}
              onChange={e => setZielort(e.target.value)}
              placeholder="z.B. Hamburg"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Zweck der Fahrt *</label>
          <input
            type="text"
            value={zweck}
            onChange={e => setZweck(e.target.value)}
            placeholder="z.B. Warenlieferung an Kunde XY"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kunde</label>
            <select
              value={kunde}
              onChange={e => setKunde(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Keiner --</option>
              {kunden.map(k => (
                <option key={k.id} value={k.firma}>{k.firma}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fahrzeug</label>
            <input
              type="text"
              value={fahrzeug}
              onChange={e => setFahrzeug(e.target.value)}
              placeholder="z.B. Sprinter"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kennzeichen</label>
            <input
              type="text"
              value={kennzeichen}
              onChange={e => setKennzeichen(e.target.value)}
              placeholder="B-XX 1234"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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

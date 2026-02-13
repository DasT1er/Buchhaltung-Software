import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, FileText, User, Eye, Download, Paperclip, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getEinnahmeKategorieLabel, getAusgabeKategorieLabel, getZahlungsartLabel } from '../utils/categories';
import { getFileUrl } from '../store/belegeDB';
import type { Einnahme, Ausgabe, BelegMeta } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: Einnahme | Ausgabe | null;
  type: 'einnahme' | 'ausgabe';
}

export default function BuchungDetails({ isOpen, onClose, data, type }: Props) {
  if (!data) return null;

  const isEinnahme = type === 'einnahme';
  const einnahme = isEinnahme ? (data as Einnahme) : null;
  const ausgabe = !isEinnahme ? (data as Ausgabe) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Details" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className={`glass rounded-lg p-4 ${isEinnahme ? 'bg-s-tint/20' : 'bg-d-tint/20'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-heading">{data.beschreibung}</h3>
              <p className="text-xs text-muted mt-0.5">
                {isEinnahme ? 'Einnahme' : 'Ausgabe'} • {formatDate(data.datum)}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black ${isEinnahme ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {isEinnahme ? '+' : '-'}{formatCurrency(data.betrag)}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailItem icon={Calendar} label="Datum" value={formatDate(data.datum)} />
          <DetailItem icon={DollarSign} label="Betrag" value={formatCurrency(data.betrag)} />
          <DetailItem
            icon={Tag}
            label="Kategorie"
            value={isEinnahme ? getEinnahmeKategorieLabel(data.kategorie) : getAusgabeKategorieLabel(data.kategorie)}
          />
          <DetailItem icon={CreditCard} label="Zahlungsart" value={getZahlungsartLabel(data.zahlungsart)} />

          {einnahme?.rechnungsnummer && (
            <DetailItem icon={FileText} label="Rechnungsnummer" value={einnahme.rechnungsnummer} />
          )}
          {einnahme?.kunde && (
            <DetailItem icon={User} label="Kunde" value={einnahme.kunde} />
          )}
          {ausgabe?.belegnummer && (
            <DetailItem icon={FileText} label="Belegnummer" value={ausgabe.belegnummer} />
          )}
        </div>

        {/* Notizen */}
        {data.notizen && (
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-bold text-heading mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={12} />
              Notizen
            </h4>
            <p className="text-sm text-body whitespace-pre-wrap">{data.notizen}</p>
          </div>
        )}

        {/* Belege */}
        {data.belege && data.belege.length > 0 && (
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-bold text-heading mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Paperclip size={12} />
              Belege ({data.belege.length})
            </h4>
            <div className="space-y-2">
              {data.belege.map(beleg => (
                <BelegItem key={beleg.id} beleg={beleg} />
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-divider/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            Schließen
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-p-tint/80 flex items-center justify-center shrink-0">
          <Icon size={13} className="text-p-on-tint" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted uppercase tracking-wide font-bold">{label}</p>
          <p className="text-sm font-semibold text-heading truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BelegItem({ beleg }: { beleg: BelegMeta }) {
  const [url, setUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    getFileUrl(beleg.id).then(setUrl);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [beleg.id]);

  const isImage = beleg.type.startsWith('image/');

  function handleView() {
    if (isImage) {
      setShowPreview(true);
    } else if (url) {
      window.open(url, '_blank');
    }
  }

  function handleDownload() {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = beleg.name;
    a.click();
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-2 bg-card-alt rounded-lg hover:bg-card-alt/70 transition-colors">
        <div className={`w-8 h-8 rounded-md ${isImage ? 'bg-s-tint/80' : 'bg-p-tint/80'} flex items-center justify-center shrink-0`}>
          {isImage ? (
            <ImageIcon size={14} className="text-s-on-tint" />
          ) : (
            <FileText size={14} className="text-p-on-tint" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-heading truncate">{beleg.name}</p>
          <p className="text-[10px] text-muted">{formatSize(beleg.size)}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleView}
            className="p-1.5 text-muted hover:text-primary-600 hover:bg-p-tint rounded-md transition-colors"
            title={isImage ? "Vorschau" : "Öffnen"}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-muted hover:text-success-600 hover:bg-s-tint rounded-md transition-colors"
            title="Download"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && url && isImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={url}
            alt={beleg.name}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

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
    <Modal isOpen={isOpen} onClose={onClose} title="Details" maxWidth="max-w-5xl">
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
            value={isEinnahme ? getEinnahmeKategorieLabel(einnahme!.kategorie) : getAusgabeKategorieLabel(ausgabe!.kategorie)}
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

  // FIX: Prevent flickering by properly cleaning up blob URLs
  useEffect(() => {
    let objectUrl: string | null = null;

    getFileUrl(beleg.id).then(u => {
      if (u) {
        objectUrl = u;
        setUrl(u);
      }
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
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
      <div className="flex flex-col gap-4 p-4 bg-card-alt rounded-xl hover:bg-card-alt/70 group">
        {/* HUGE Preview Thumbnail */}
        <div
          className={`relative rounded-lg overflow-hidden shrink-0 cursor-pointer ${
            isImage ? 'w-80 h-80' : 'w-12 h-12'
          }`}
          onClick={handleView}
        >
          {isImage && url ? (
            <img
              src={url}
              alt={beleg.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${isImage ? 'bg-s-tint/80' : 'bg-p-tint/80'} flex items-center justify-center`}>
              {isImage ? (
                <ImageIcon size={isImage ? 80 : 20} className="text-s-on-tint" />
              ) : (
                <FileText size={20} className="text-p-on-tint" />
              )}
            </div>
          )}

          {/* Hover overlay for images - BIGGER */}
          {isImage && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Eye size={60} className="text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* File info and actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-heading truncate">{beleg.name}</p>
            <p className="text-sm text-muted mt-1">{formatSize(beleg.size)}</p>
            {isImage && (
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-2 font-medium">
                👆 Klicken für Vollansicht
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleView}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg hover:shadow-lg transition-all"
              title={isImage ? "Vorschau" : "Öffnen"}
            >
              <Eye size={18} />
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-success-500 to-success-700 rounded-lg hover:shadow-lg transition-all"
              title="Download"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal - HUGE AND NO FLICKER */}
      {showPreview && url && isImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-lg"
          onClick={() => setShowPreview(false)}
        >
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 p-3 text-white hover:bg-white/20 rounded-full z-10"
          >
            <X size={32} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={url}
              alt={beleg.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />

            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-white font-semibold text-sm truncate">{beleg.name}</p>
              <p className="text-white/70 text-xs">{formatSize(beleg.size)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

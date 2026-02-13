import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag, CreditCard, FileText, User, Download, Paperclip, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Zoom controls
  function handleZoomIn() {
    setZoom(prev => Math.min(prev + 0.5, 5));
  }

  function handleZoomOut() {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  }

  // Drag/Pan controls
  function handleMouseDown(e: React.MouseEvent) {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-card-alt rounded-xl">
      {/* File info header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-heading truncate">{beleg.name}</p>
          <p className="text-sm text-muted mt-1">{formatSize(beleg.size)}</p>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-br from-success-500 to-success-700 rounded-lg hover:shadow-lg transition-all shrink-0"
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>

      {/* HUGE PREVIEW BOX WITH ZOOM - No separate modal! */}
      {isImage ? (
        <div className="relative">
          {/* Zoom controls - ALWAYS VISIBLE */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="p-3 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition-all"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition-all"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
              className="p-3 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-md transition-all"
              title="Reset zoom"
            >
              <Maximize2 size={20} />
            </button>
            <div className="px-3 py-2 text-white bg-black/50 rounded-full backdrop-blur-md text-sm font-bold text-center">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* HUGE IMAGE BOX with zoom & pan */}
          <div
            className="relative w-full h-[700px] rounded-lg overflow-hidden bg-black/20"
            onWheel={handleWheel}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {url ? (
                <img
                  src={url}
                  alt={beleg.name}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-s-tint/80 flex items-center justify-center">
                  <ImageIcon size={80} className="text-s-on-tint" />
                </div>
              )}
            </div>

            {/* Hint overlay */}
            {zoom > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                <p className="text-white/70 text-sm">💡 Ziehen zum Verschieben • Mausrad zum Zoomen</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Non-image files - small icon */
        <div className="w-16 h-16 bg-p-tint/80 rounded-lg flex items-center justify-center">
          <FileText size={24} className="text-p-on-tint" />
        </div>
      )}
    </div>
  );
}

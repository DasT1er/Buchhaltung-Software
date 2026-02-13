import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Eye } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { BelegMeta } from '../types';
import { saveFile, deleteFile, getFileUrl } from '../store/belegeDB';

interface Props {
  belege: BelegMeta[];
  onChange: (belege: BelegMeta[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function BelegeUpload({ belege, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const newBelege: BelegMeta[] = [...belege];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) { alert(`"${file.name}" ist zu groß (max. 10 MB)`); continue; }
      const id = uuidv4();
      await saveFile(id, file);
      newBelege.push({ id, name: file.name, type: file.type, size: file.size });
    }
    onChange(newBelege);
  }

  async function handleRemove(id: string) {
    await deleteFile(id);
    onChange(belege.filter(b => b.id !== id));
  }

  async function handleView(id: string) {
    const url = await getFileUrl(id);
    if (url) window.open(url, '_blank');
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-1.5">Belege anhängen</label>
      <div
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-primary-400 bg-p-tint scale-[1.01]' : 'border-divider hover:border-primary-300 hover:bg-p-tint/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-card-alt flex items-center justify-center">
          <Upload size={18} className="text-muted" />
        </div>
        <p className="text-xs font-medium text-body">Dateien hierher ziehen oder klicken</p>
        <p className="text-[10px] text-muted mt-1">PDF, Bilder, Dokumente &mdash; max. 10 MB</p>
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFiles(e.target.files)} className="hidden" />
      </div>

      {belege.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {belege.map(b => (
            <li key={b.id} className="flex items-center gap-2.5 px-3 py-2 bg-card-alt rounded-xl text-xs">
              {b.type.startsWith('image/') ? (
                <Image size={14} className="text-primary-500 shrink-0" />
              ) : (
                <FileText size={14} className="text-body shrink-0" />
              )}
              <span className="flex-1 truncate text-body font-medium">{b.name}</span>
              <span className="text-muted shrink-0">{formatSize(b.size)}</span>
              <button type="button" onClick={() => handleView(b.id)} className="p-1 text-muted hover:text-primary-500 transition-colors rounded-md hover:bg-p-tint">
                <Eye size={13} />
              </button>
              <button type="button" onClick={() => handleRemove(b.id)} className="p-1 text-muted hover:text-danger-500 transition-colors rounded-md hover:bg-d-tint">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

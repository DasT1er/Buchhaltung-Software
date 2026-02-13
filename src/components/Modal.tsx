import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--overlay-bg)' }} onClick={onClose} />
      <div className={`relative bg-card rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-divider-light transition-colors`} style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)' }}>
        <div className="sticky top-0 bg-card flex items-center justify-between px-6 py-4 border-b border-divider rounded-t-2xl z-10">
          <h3 className="text-base font-semibold text-heading">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-card-alt transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = 'Eintrag löschen',
  message = 'Möchten Sie diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
}: DeleteConfirmProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="text-center py-2">
        <div className="mx-auto w-12 h-12 bg-d-tint rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-danger-600 dark:text-danger-400" />
        </div>
        <p className="text-sm text-body mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-heading bg-card-alt rounded-lg hover:opacity-80 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 transition-colors"
          >
            Löschen
          </button>
        </div>
      </div>
    </Modal>
  );
}

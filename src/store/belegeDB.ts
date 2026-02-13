// PORTABLE FILE-SYSTEM BASED STORAGE (Electron + Browser fallback)

const DB_NAME = 'buchungsprofi-belege';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Check if we're in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// ============================================
// ELECTRON: File-System Storage (PORTABLE!)
// ============================================

async function saveFileElectron(id: string, file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  const result = await window.electronAPI!.saveBeleg(id, buffer, file.name);
  if (!result.success) {
    throw new Error(result.error || 'Failed to save beleg');
  }
}

async function getFileElectron(id: string): Promise<{ name: string; type: string; size: number; data: ArrayBuffer } | null> {
  const result = await window.electronAPI!.readBeleg(id);
  if (!result.success || !result.buffer) {
    return null;
  }
  // Convert number array back to ArrayBuffer
  const buffer = new Uint8Array(result.buffer).buffer;
  // We don't have metadata, so we'll return generic data
  return {
    name: id,
    type: 'application/octet-stream',
    size: buffer.byteLength,
    data: buffer,
  };
}

async function deleteFileElectron(id: string): Promise<void> {
  const result = await window.electronAPI!.deleteBeleg(id);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete beleg');
  }
}

// ============================================
// BROWSER: IndexedDB Fallback (Development)
// ============================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFileBrowser(id: string, file: File): Promise<void> {
  const db = await openDB();
  const data = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, name: file.name, type: file.type, size: file.size, data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getFileBrowser(id: string): Promise<{ name: string; type: string; size: number; data: ArrayBuffer } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFileBrowser(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ============================================
// PUBLIC API (Auto-detects Electron vs Browser)
// ============================================

export async function saveFile(id: string, file: File): Promise<void> {
  if (isElectron) {
    return saveFileElectron(id, file);
  } else {
    return saveFileBrowser(id, file);
  }
}

export async function getFile(id: string): Promise<{ name: string; type: string; size: number; data: ArrayBuffer } | null> {
  if (isElectron) {
    return getFileElectron(id);
  } else {
    return getFileBrowser(id);
  }
}

export async function deleteFile(id: string): Promise<void> {
  if (isElectron) {
    return deleteFileElectron(id);
  } else {
    return deleteFileBrowser(id);
  }
}

export async function getFileUrl(id: string): Promise<string | null> {
  const file = await getFile(id);
  if (!file) return null;
  const blob = new Blob([file.data], { type: file.type });
  return URL.createObjectURL(blob);
}

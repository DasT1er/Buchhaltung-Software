const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  readData: () => ipcRenderer.invoke('read-data'),
  writeData: (data) => ipcRenderer.invoke('write-data', data),

  // Beleg file operations
  saveBeleg: (id, buffer, name) => ipcRenderer.invoke('save-beleg', { id, buffer, name }),
  readBeleg: (id) => ipcRenderer.invoke('read-beleg', id),
  deleteBeleg: (id) => ipcRenderer.invoke('delete-beleg', id),

  // Utility
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
});

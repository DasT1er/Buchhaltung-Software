export interface ElectronAPI {
  // Data operations
  readData: () => Promise<any>;
  writeData: (data: any) => Promise<{ success: boolean; error?: string }>;

  // Beleg file operations
  saveBeleg: (id: string, buffer: ArrayBuffer, name: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  readBeleg: (id: string) => Promise<{ success: boolean; buffer?: number[]; error?: string }>;
  deleteBeleg: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Utility
  getDataPath: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

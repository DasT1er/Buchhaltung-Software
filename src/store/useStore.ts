import { useState, useEffect, useCallback } from 'react';
import type { AppState, Einnahme, Ausgabe, Kunde, Fahrt } from '../types';
import { getCurrentYear } from '../utils/formatters';

const STORAGE_KEY = 'buchungsprofi-data';

const defaultState: AppState = {
  einnahmen: [],
  ausgaben: [],
  kunden: [],
  fahrten: [],
  geschaeftsjahr: getCurrentYear(),
  firmenname: '',
  steuernummer: '',
  kleinunternehmer: true,
};

// Check if we're in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

async function loadState(): Promise<AppState> {
  try {
    if (isElectron) {
      // ELECTRON: Load from file system (PORTABLE!)
      const data = await window.electronAPI!.readData();
      if (data) {
        return { ...defaultState, ...data };
      }

      // MIGRATION: Check if there's old localStorage data
      const oldData = localStorage.getItem(STORAGE_KEY);
      if (oldData) {
        const parsed = JSON.parse(oldData);
        // Save to file system and clear localStorage
        await window.electronAPI!.writeData(parsed);
        localStorage.removeItem(STORAGE_KEY);
        console.log('✅ Migrated data from localStorage to file system!');
        return { ...defaultState, ...parsed };
      }
    } else {
      // BROWSER: Fallback to localStorage (for development)
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...defaultState, ...JSON.parse(data) };
      }
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return defaultState;
}

async function saveState(state: AppState): Promise<void> {
  try {
    if (isElectron) {
      // ELECTRON: Save to file system (PORTABLE!)
      await window.electronAPI!.writeData(state);
    } else {
      // BROWSER: Fallback to localStorage (for development)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

export function useStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setIsLoading(false);
    });
  }, []);

  // Save state whenever it changes (debounced)
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        saveState(state);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeout);
    }
  }, [state, isLoading]);

  // Einnahmen
  const addEinnahme = useCallback((einnahme: Einnahme) => {
    setState(prev => ({ ...prev, einnahmen: [...prev.einnahmen, einnahme] }));
  }, []);

  const updateEinnahme = useCallback((einnahme: Einnahme) => {
    setState(prev => ({
      ...prev,
      einnahmen: prev.einnahmen.map(e => (e.id === einnahme.id ? einnahme : e)),
    }));
  }, []);

  const deleteEinnahme = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      einnahmen: prev.einnahmen.filter(e => e.id !== id),
    }));
  }, []);

  // Ausgaben
  const addAusgabe = useCallback((ausgabe: Ausgabe) => {
    setState(prev => ({ ...prev, ausgaben: [...prev.ausgaben, ausgabe] }));
  }, []);

  const updateAusgabe = useCallback((ausgabe: Ausgabe) => {
    setState(prev => ({
      ...prev,
      ausgaben: prev.ausgaben.map(a => (a.id === ausgabe.id ? ausgabe : a)),
    }));
  }, []);

  const deleteAusgabe = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      ausgaben: prev.ausgaben.filter(a => a.id !== id),
    }));
  }, []);

  // Kunden
  const addKunde = useCallback((kunde: Kunde) => {
    setState(prev => ({ ...prev, kunden: [...prev.kunden, kunde] }));
  }, []);

  const updateKunde = useCallback((kunde: Kunde) => {
    setState(prev => ({
      ...prev,
      kunden: prev.kunden.map(k => (k.id === kunde.id ? kunde : k)),
    }));
  }, []);

  const deleteKunde = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      kunden: prev.kunden.filter(k => k.id !== id),
    }));
  }, []);

  // Fahrten
  const addFahrt = useCallback((fahrt: Fahrt) => {
    setState(prev => ({ ...prev, fahrten: [...prev.fahrten, fahrt] }));
  }, []);

  const updateFahrt = useCallback((fahrt: Fahrt) => {
    setState(prev => ({
      ...prev,
      fahrten: prev.fahrten.map(f => (f.id === fahrt.id ? fahrt : f)),
    }));
  }, []);

  const deleteFahrt = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      fahrten: prev.fahrten.filter(f => f.id !== id),
    }));
  }, []);

  // Einstellungen
  const updateEinstellungen = useCallback(
    (data: { firmenname?: string; steuernummer?: string; kleinunternehmer?: boolean; geschaeftsjahr?: number }) => {
      setState(prev => ({ ...prev, ...data }));
    },
    [],
  );

  // Daten importieren
  const importData = useCallback((data: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...data }));
  }, []);

  // Filter helpers
  const getEinnahmenByJahr = useCallback(
    (jahr: number) => state.einnahmen.filter(e => new Date(e.datum).getFullYear() === jahr),
    [state.einnahmen],
  );

  const getAusgabenByJahr = useCallback(
    (jahr: number) => state.ausgaben.filter(a => new Date(a.datum).getFullYear() === jahr),
    [state.ausgaben],
  );

  const getFahrtenByJahr = useCallback(
    (jahr: number) => state.fahrten.filter(f => new Date(f.datum).getFullYear() === jahr),
    [state.fahrten],
  );

  return {
    ...state,
    addEinnahme,
    updateEinnahme,
    deleteEinnahme,
    addAusgabe,
    updateAusgabe,
    deleteAusgabe,
    addKunde,
    updateKunde,
    deleteKunde,
    addFahrt,
    updateFahrt,
    deleteFahrt,
    updateEinstellungen,
    importData,
    getEinnahmenByJahr,
    getAusgabenByJahr,
    getFahrtenByJahr,
  };
}

import type { Einnahme, Ausgabe, Fahrt } from '../types';
import { formatDate } from './formatters';
import { getEinnahmeKategorieLabel, getAusgabeKategorieLabel, getZahlungsartLabel } from './categories';

export function exportEinnahmenCSV(einnahmen: Einnahme[]): void {
  const headers = ['Datum', 'Beschreibung', 'Betrag', 'Kategorie', 'Rechnungsnr.', 'Zahlungsart', 'Kunde', 'Notizen'];
  const rows = einnahmen.map(e => [
    formatDate(e.datum),
    e.beschreibung,
    e.betrag.toFixed(2).replace('.', ','),
    getEinnahmeKategorieLabel(e.kategorie),
    e.rechnungsnummer ?? '',
    getZahlungsartLabel(e.zahlungsart),
    e.kunde ?? '',
    e.notizen ?? '',
  ]);
  downloadCSV('Einnahmen', headers, rows);
}

export function exportAusgabenCSV(ausgaben: Ausgabe[]): void {
  const headers = ['Datum', 'Beschreibung', 'Betrag', 'Kategorie', 'Belegnr.', 'Zahlungsart', 'Notizen'];
  const rows = ausgaben.map(a => [
    formatDate(a.datum),
    a.beschreibung,
    a.betrag.toFixed(2).replace('.', ','),
    getAusgabeKategorieLabel(a.kategorie),
    a.belegnummer ?? '',
    getZahlungsartLabel(a.zahlungsart),
    a.notizen ?? '',
  ]);
  downloadCSV('Ausgaben', headers, rows);
}

export function exportFahrtenCSV(fahrten: Fahrt[]): void {
  const headers = ['Datum', 'Startort', 'Zielort', 'Kilometer', 'Zweck', 'Kunde', 'Fahrzeug', 'Kennzeichen', 'Notizen'];
  const rows = fahrten.map(f => [
    formatDate(f.datum),
    f.startort,
    f.zielort,
    f.kilometer.toString().replace('.', ','),
    f.zweck,
    f.kunde ?? '',
    f.fahrzeug ?? '',
    f.kennzeichen ?? '',
    f.notizen ?? '',
  ]);
  downloadCSV('Fahrtenbuch', headers, rows);
}

export function exportEURBerichtCSV(
  einnahmen: Einnahme[],
  ausgaben: Ausgabe[],
  jahr: number,
): void {
  const gesamtEinnahmen = einnahmen.reduce((sum, e) => sum + e.betrag, 0);
  const gesamtAusgaben = ausgaben.reduce((sum, a) => sum + a.betrag, 0);

  const headers = ['Position', 'Betrag'];
  const rows: string[][] = [
    ['=== EINNAHMEN ===', ''],
  ];

  const einnahmenByKat = groupByKategorie(einnahmen, 'kategorie');
  for (const [kat, betrag] of Object.entries(einnahmenByKat)) {
    rows.push([getEinnahmeKategorieLabel(kat as any), betrag.toFixed(2).replace('.', ',')]);
  }
  rows.push(['Gesamteinnahmen', gesamtEinnahmen.toFixed(2).replace('.', ',')]);
  rows.push(['', '']);
  rows.push(['=== AUSGABEN ===', '']);

  const ausgabenByKat = groupByKategorie(ausgaben, 'kategorie');
  for (const [kat, betrag] of Object.entries(ausgabenByKat)) {
    rows.push([getAusgabeKategorieLabel(kat as any), betrag.toFixed(2).replace('.', ',')]);
  }
  rows.push(['Gesamtausgaben', gesamtAusgaben.toFixed(2).replace('.', ',')]);
  rows.push(['', '']);
  rows.push(['=== ERGEBNIS ===', '']);
  rows.push(['Gewinn / Verlust', (gesamtEinnahmen - gesamtAusgaben).toFixed(2).replace('.', ',')]);

  downloadCSV(`EUR_Bericht_${jahr}`, headers, rows);
}

function groupByKategorie<T extends { kategorie: string; betrag: number }>(
  items: T[],
  _key: string,
): Record<string, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.kategorie] = (acc[item.kategorie] ?? 0) + item.betrag;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function downloadCSV(filename: string, headers: string[], rows: string[][]): void {
  const BOM = '\uFEFF';
  const separator = ';';
  const csvContent = [
    headers.join(separator),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(separator)),
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printEURBericht(): void {
  window.print();
}

export function exportAllDataJSON(data: {
  einnahmen: Einnahme[];
  ausgaben: Ausgabe[];
  kunden: any[];
  fahrten: Fahrt[];
  firmenname: string;
  steuernummer: string;
}): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Buchhaltung_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

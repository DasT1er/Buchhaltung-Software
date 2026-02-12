import type { EinnahmeKategorie, AusgabeKategorie, Zahlungsart } from '../types';

export const einnahmeKategorien: { value: EinnahmeKategorie; label: string }[] = [
  { value: 'transportleistungen', label: 'Transportleistungen' },
  { value: 'kurierfahrten', label: 'Kurierfahrten' },
  { value: 'umzuege', label: 'Umzüge' },
  { value: 'lagerung', label: 'Lagerung' },
  { value: 'beratung', label: 'Beratung' },
  { value: 'vermietung', label: 'Vermietung' },
  { value: 'provision', label: 'Provision' },
  { value: 'sonstige-einnahmen', label: 'Sonstige Einnahmen' },
];

export const ausgabeKategorien: { value: AusgabeKategorie; label: string }[] = [
  { value: 'kraftstoff', label: 'Kraftstoff / Tankkosten' },
  { value: 'fahrzeugreparatur', label: 'Fahrzeugreparatur & Wartung' },
  { value: 'fahrzeugversicherung', label: 'Fahrzeugversicherung' },
  { value: 'fahrzeugleasing', label: 'Fahrzeugleasing / -finanzierung' },
  { value: 'kfz-steuer', label: 'Kfz-Steuer' },
  { value: 'maut', label: 'Mautgebühren' },
  { value: 'parkgebuehren', label: 'Parkgebühren' },
  { value: 'buerokosten', label: 'Bürokosten / Material' },
  { value: 'telekommunikation', label: 'Telefon / Internet' },
  { value: 'versicherungen', label: 'Versicherungen (allg.)' },
  { value: 'steuerberater', label: 'Steuerberater' },
  { value: 'werbung', label: 'Werbung / Marketing' },
  { value: 'fortbildung', label: 'Fortbildung' },
  { value: 'arbeitsmittel', label: 'Arbeitsmittel / Werkzeug' },
  { value: 'miete', label: 'Miete / Pacht' },
  { value: 'reisekosten', label: 'Reisekosten' },
  { value: 'bewirtung', label: 'Bewirtungskosten' },
  { value: 'abschreibungen', label: 'Abschreibungen (AfA)' },
  { value: 'sonstige-ausgaben', label: 'Sonstige Ausgaben' },
];

export const zahlungsarten: { value: Zahlungsart; label: string }[] = [
  { value: 'bar', label: 'Barzahlung' },
  { value: 'ueberweisung', label: 'Überweisung' },
  { value: 'ec-karte', label: 'EC-Karte' },
  { value: 'kreditkarte', label: 'Kreditkarte' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'sonstige', label: 'Sonstige' },
];

export function getEinnahmeKategorieLabel(value: EinnahmeKategorie): string {
  return einnahmeKategorien.find(k => k.value === value)?.label ?? value;
}

export function getAusgabeKategorieLabel(value: AusgabeKategorie): string {
  return ausgabeKategorien.find(k => k.value === value)?.label ?? value;
}

export function getZahlungsartLabel(value: Zahlungsart): string {
  return zahlungsarten.find(z => z.value === value)?.label ?? value;
}

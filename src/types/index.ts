export interface BelegMeta {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Einnahme {
  id: string;
  datum: string;
  beschreibung: string;
  betrag: number;
  kategorie: EinnahmeKategorie;
  kunde?: string;
  rechnungsnummer?: string;
  zahlungsart: Zahlungsart;
  notizen?: string;
  belege?: BelegMeta[];
}

export interface Ausgabe {
  id: string;
  datum: string;
  beschreibung: string;
  betrag: number;
  kategorie: AusgabeKategorie;
  belegnummer?: string;
  zahlungsart: Zahlungsart;
  notizen?: string;
  belege?: BelegMeta[];
}

export interface Kunde {
  id: string;
  firma: string;
  ansprechpartner?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
  steuernummer?: string;
  notizen?: string;
}

export interface Fahrt {
  id: string;
  datum: string;
  startort: string;
  zielort: string;
  kilometer: number;
  zweck: string;
  kunde?: string;
  fahrzeug?: string;
  kennzeichen?: string;
  notizen?: string;
}

export interface Geschaeftsjahr {
  jahr: number;
  einnahmen: Einnahme[];
  ausgaben: Ausgabe[];
}

export type Zahlungsart = 'bar' | 'ueberweisung' | 'ec-karte' | 'kreditkarte' | 'paypal' | 'sonstige';

export type EinnahmeKategorie =
  | 'transportleistungen'
  | 'kurierfahrten'
  | 'umzuege'
  | 'lagerung'
  | 'beratung'
  | 'vermietung'
  | 'provision'
  | 'sonstige-einnahmen';

export type AusgabeKategorie =
  | 'kraftstoff'
  | 'fahrzeugreparatur'
  | 'fahrzeugversicherung'
  | 'fahrzeugleasing'
  | 'kfz-steuer'
  | 'maut'
  | 'parkgebuehren'
  | 'buerokosten'
  | 'telekommunikation'
  | 'versicherungen'
  | 'steuerberater'
  | 'werbung'
  | 'fortbildung'
  | 'arbeitsmittel'
  | 'miete'
  | 'reisekosten'
  | 'bewirtung'
  | 'abschreibungen'
  | 'sonstige-ausgaben';

export interface EURBericht {
  jahr: number;
  betriebseinnahmen: {
    kategorie: string;
    betrag: number;
  }[];
  betriebsausgaben: {
    kategorie: string;
    betrag: number;
  }[];
  gesamtEinnahmen: number;
  gesamtAusgaben: number;
  gewinnVerlust: number;
}

export interface AppState {
  einnahmen: Einnahme[];
  ausgaben: Ausgabe[];
  kunden: Kunde[];
  fahrten: Fahrt[];
  geschaeftsjahr: number;
  firmenname: string;
  steuernummer: string;
  kleinunternehmer: boolean;
}

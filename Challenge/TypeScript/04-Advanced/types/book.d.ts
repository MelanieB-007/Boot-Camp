// ── Primitive Bausteine ───────────────────────────────────────────────────────

/** Akzeptiert eine numerische oder string-basierte ID */
export type EntityId = number | string;

/** Gemeinsame Zeitstempel-Felder für persistierte Entitäten */
export type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

/** Jede Entität mit einer eindeutigen ID */
export type HasId = {
  id: EntityId;
};

// ── Book ──────────────────────────────────────────────────────────────────────

type BookFields = {
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
};

/** Vollständiges Book-Objekt, zusammengesetzt aus wiederverwendbaren Bausteinen */
export type Book = HasId & Timestamped & BookFields;

/** Die drei positionsbasierten Bestandteile einer ISBN: [Gruppe, Verlag, Titelkennung] */
export type IsbnParts = [group: number, publisher: string, titleCode: string];

// ── Abgeleitete Payload-Typen (keine manuell duplizierten Properties) ─────────

/** Felder, die der Client beim Anlegen eines Buches sendet (ohne serverseitige Felder) */
export type BookCreatePayload = Omit<Book, "id" | "createdAt" | "updatedAt">;

/** Felder für ein partielles Update – alle optional */
export type BookUpdatePayload = Partial<BookCreatePayload>;

/** Schlanke Vorschau für Listenansichten */
export type BookPreview = Pick<Book, "id" | "title" | "author">;

// ── Generischer Response-Wrapper ──────────────────────────────────────────────

/** Einheitliche API-Antwort für jeden Endpunkt */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

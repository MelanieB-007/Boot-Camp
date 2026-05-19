import type { Book, EntityId } from "./types/book";

// ── Generischer EventEmitter ──────────────────────────────────────────────────

/**
 * Typsicherer EventEmitter.
 * Events ist ein Record, der Ereignisnamen auf ihre Payload-Typen abbildet.
 */
export class EventEmitter<Events extends Record<string, unknown>> {
  // Map von Ereignisname → Liste der Handler
  private handlers: {
    [K in keyof Events]?: Array<(payload: Events[K]) => void>;
  } = {};

  /** Registriert einen Handler für ein bestimmtes Ereignis */
  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  /** Löst ein Ereignis aus und übergibt den Payload an alle registrierten Handler */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        handler(payload);
      }
    }
  }
}

// ── BookShelf-Ereignisse ──────────────────────────────────────────────────────

type BookEvents = {
  bookAdded: Book;
  bookRemoved: { id: EntityId };
  searchPerformed: { query: string; resultCount: number };
};

// ── Verwendungsbeispiel (vollständig typgeprüft) ──────────────────────────────

const emitter = new EventEmitter<BookEvents>();

// ✅ Handler erhalten den korrekten Payload-Typ
emitter.on("bookAdded", (book) => {
  console.log(`Neues Buch hinzugefügt: ${book.title} von ${book.author}`);
});

emitter.on("bookRemoved", ({ id }) => {
  console.log(`Buch entfernt: ID ${id}`);
});

emitter.on("searchPerformed", ({ query, resultCount }) => {
  console.log(`Suche nach "${query}" ergab ${resultCount} Treffer`);
});

// ✅ emit akzeptiert nur den korrekten Payload-Typ pro Ereignis
emitter.emit("bookAdded", {
  id: 1,
  title: "Clean Code",
  author: "Robert C. Martin",
  isbn: "978-0132350884",
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

emitter.emit("bookRemoved", { id: 42 });

emitter.emit("searchPerformed", { query: "Martin Fowler", resultCount: 3 });

// ❌ Diese Zeilen würden zu Kompilierfehlern führen (auskommentiert):
// emitter.emit("bookAdded", { id: 1 });
//   → Fehler: Fehlende Pflichtfelder (title, author, isbn, ...)
//
// emitter.on("searchPerformed", (payload: { query: string }) => {});
//   → Fehler: resultCount fehlt im Handler-Typ
//
// emitter.emit("unknownEvent", {});
//   → Fehler: "unknownEvent" ist kein Schlüssel von BookEvents

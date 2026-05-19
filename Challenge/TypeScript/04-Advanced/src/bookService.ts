import type {
  ApiResponse,
  Book,
  BookCreatePayload,
  BookPreview,
  BookUpdatePayload,
  EntityId,
  IsbnParts,
} from "../types/book";

// ── Service-Funktionen ────────────────────────────────────────────────────────

/** Gibt eine paginierte Liste aller Bücher als Vorschau zurück */
export async function fetchBooks(): Promise<ApiResponse<BookPreview[]>> {
  return {
    status: 200,
    message: "Bücher erfolgreich abgerufen",
    data: [],
  };
}

/** Gibt ein einzelnes Buch anhand seiner ID zurück */
export async function fetchBook(id: EntityId): Promise<ApiResponse<Book>> {
  return {
    status: 200,
    message: `Buch ${id} gefunden`,
    data: {
      id,
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "978-0132350884",
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

/** Legt ein neues Buch an und gibt das gespeicherte Objekt zurück */
export async function createBook(
  payload: BookCreatePayload,
): Promise<ApiResponse<Book>> {
  return {
    status: 201,
    message: "Buch erfolgreich erstellt",
    data: {
      id: 1,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

/** Aktualisiert ein bestehendes Buch partiell */
export async function updateBook(
  id: EntityId,
  changes: BookUpdatePayload,
): Promise<ApiResponse<Book>> {
  const existing = (await fetchBook(id)).data;
  return {
    status: 200,
    message: "Buch erfolgreich aktualisiert",
    data: { ...existing, ...changes, updatedAt: new Date() },
  };
}

/** Zerlegt einen ISBN-String in seine drei Bestandteile */
export function parseIsbn(isbn: string): IsbnParts {
  const clean = isbn.replace(/-/g, "");
  // Format: 978 | 0132 | 350884  (vereinfachte Aufteilung für das Beispiel)
  return [
    Number(clean.slice(0, 3)),
    clean.slice(3, 7),
    clean.slice(7),
  ];
}

// ── Generische Collection-Utilities ──────────────────────────────────────────

/**
 * Gruppiert ein Array nach dem Wert einer bestimmten Eigenschaft.
 * Beispiel: groupBy(books, "author") → { "Martin Fowler": [...], ... }
 */
export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K,
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

/**
 * Extrahiert eine einzelne Eigenschaft aus jedem Element eines Arrays.
 * Beispiel: pluck(books, "title") → ["Clean Code", "Refactoring", ...]
 */
export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

/**
 * Wendet ein partielles Update auf ein Basisobjekt an und gibt ein neues Objekt zurück.
 * Beispiel: merge(book, { title: "Clean Code 2nd Ed." })
 */
export function merge<T>(base: T, updates: Partial<T>): T {
  return { ...base, ...updates };
}

// ── Verwendungsbeispiele (werden zur Kompilierzeit geprüft) ───────────────────

const sampleBooks: Book[] = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Refactoring",
    author: "Martin Fowler",
    isbn: "978-0201485677",
    isAvailable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "The Clean Coder",
    author: "Robert C. Martin",
    isbn: "978-0137081073",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const byAuthor = groupBy(sampleBooks, "author");
// { "Robert C. Martin": [book1, book3], "Martin Fowler": [book2] }

const titles = pluck(sampleBooks, "title");
// ["Clean Code", "Refactoring", "The Clean Coder"]

const updatedBook = merge(sampleBooks[0], { title: "Clean Code 2nd Ed.", isAvailable: false });
// { id: 1, title: "Clean Code 2nd Ed.", isAvailable: false, ... }

// Typen werden genutzt, damit tsc nicht optimiert
console.log(byAuthor, titles, updatedBook);

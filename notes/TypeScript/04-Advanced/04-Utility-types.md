# TypeScript Advanced – Utility Types

Dein BookShelf-`Book`-Interface hat sieben Eigenschaften: `id`, `title`, `author`, `isbn`, `isAvailable`, `createdAt` und `updatedAt`. Wenn ein Benutzer ein neues Buch anlegt, sollte die Anfrage keine `id`, `createdAt` oder `updatedAt` enthalten, da diese vom Server generiert werden. Bei einer Aktualisierung sollte jedes Feld optional sein, weil möglicherweise nur der Titel geändert wird. In Suchergebnissen werden nur `id`, `title` und `author` benötigt.

Du könntest für jeden dieser Fälle ein eigenes Interface definieren. Aber alle würden Eigenschaften von `Book` übernehmen, und wenn du dem Basis-Interface ein neues Feld hinzufügst, müsstest du jede Variante manuell aktualisieren. Vergisst du eine, driften die Typen stillschweigend auseinander.

Genau hier kommen **Utility Types** ins Spiel – eingebaute Generics, die neue Typen aus bestehenden ableiten. Sie nehmen einen Quelltyp und geben eine transformierte Version davon zurück. Utility Types sind keine spezielle Syntax, sondern reguläre generische Typen – genau wie `ApiResponse<T>`. TypeScript liefert sie als Teil der Standardbibliothek mit. Sie zu verstehen bedeutet einerseits zu lernen, was jeder einzelne tut – vor allem aber zu erkennen, wann der eigene Code eine Typdefinition dupliziert, und stattdessen die richtige Transformation einzusetzen.

---

## Partial und Required

`Partial<T>` nimmt einen Typ und macht jede Eigenschaft optional. Das ist nützlich bei Update-Operationen, bei denen der Aufrufer nur die Felder sendet, die er ändern möchte:

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type BookUpdate = Partial<Book>;
```

`BookUpdate` hat dieselben Eigenschaften wie `Book`, aber jede davon hat einen `?`-Modifier. Eine Funktion, die Aktualisierungen anwendet, kann eine beliebige Teilmenge von Feldern entgegennehmen:

```typescript
function updateBook(id: number, changes: Partial<Book>): void {
  // changes kann title, author, beides oder keines davon enthalten
}

updateBook(1, { title: "Clean Code, 2nd Edition" });
updateBook(1, { isAvailable: false, title: "Refactoring" });
```

`Required<T>` macht das Gegenteil: Es entfernt den `?`-Modifier von jeder Eigenschaft und macht alle Felder verpflichtend. Das ist nützlich, wenn ein Konfigurationstyp während der Einrichtung optionale Felder hat, vor der Verwendung aber vollständig aufgelöst sein muss:

```typescript
interface AppConfig {
  port?: number;
  debug?: boolean;
  dbUrl?: string;
}

type ResolvedConfig = Required<AppConfig>;
```

`ResolvedConfig` verlangt alle drei Eigenschaften. Ein Objekt, bei dem eine davon fehlt, führt zu einem Kompilierfehler.

`Readonly<T>` ist ein verwandter Utility Type, der jede Eigenschaft als `readonly` markiert und eine Neuzuweisung nach der Erstellung verhindert:

```typescript
type FrozenBook = Readonly<Book>;

const book: FrozenBook = {
  id: 1,
  title: "Clean Code",
  author: "Robert C. Martin",
  isbn: "978-0132350884",
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

book.title = "Neuer Titel";
// Kompilierfehler: Cannot assign to 'title' because it is a read-only property
```

> 💡 **Gut zu wissen:** `Readonly<T>` ist das typseitige Äquivalent von `Object.freeze()`. Die Runtime-Funktion verhindert Änderungen zur Ausführungszeit; der Utility Type verhindert sie zur Kompilierzeit.

---

## Pick und Omit

`Pick<T, K>` erstellt einen neuen Typ, indem bestimmte Eigenschaften aus dem Quelltyp ausgewählt werden. `K` ist eine Union von Eigenschaftsnamen.

Eine Suchergebnisseite benötigt nur `id`, `title` und `author`. Statt ein neues Interface mit drei Eigenschaften zu schreiben, werden diese direkt aus `Book` ausgewählt:

```typescript
type BookPreview = Pick<Book, "id" | "title" | "author">;
```

`BookPreview` hat genau diese drei Eigenschaften mit denselben Typen wie in `Book`. Wenn du später `id` von `number` auf `string` änderst, übernimmt `BookPreview` die Änderung automatisch.

`Omit<T, K>` ist das Gegenteil: Es erstellt einen neuen Typ, indem bestimmte Eigenschaften entfernt werden. Ein Erstellungs-Payload sollte serverseitig generierte Felder ausschließen:

```typescript
type BookCreatePayload = Omit<Book, "id" | "createdAt" | "updatedAt">;
```

`BookCreatePayload` enthält `title`, `author`, `isbn` und `isAvailable` – genau die Felder, die der Client bereitstellen soll. Die serverseitigen Felder sind ausgeschlossen.

> ⚠️ **Achtung:** Die Eigenschaftsnamen in `K` müssen tatsächlich in `T` existieren. Ein falsch geschriebener Schlüssel wie `"Id"` statt `"id"` führt zu einem Kompilierfehler. Das ist ein Feature: Es fängt Tippfehler ab, bevor sie in Produktion gelangen.

---

## Record

`Record<K, T>` erstellt einen Objekttyp, bei dem jeder Schlüssel vom Typ `K` und jeder Wert vom Typ `T` ist. Das ist nützlich für Lookup-Tabellen, Dictionaries und Maps.

Eine BookShelf-Lookup-Tabelle, indiziert nach ISBN:

```typescript
type BookLookup = Record<string, Book>;

const catalog: BookLookup = {
  "978-0132350884": {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
```

Wenn `K` eine Union von String-Literalen ist, erzwingt `Record`, dass jeder Schlüssel der Union vorhanden ist:

```typescript
type Shelf = "fiction" | "non-fiction" | "technical";
type ShelfCounts = Record<Shelf, number>;

const counts: ShelfCounts = {
  fiction: 120,
  "non-fiction": 85,
  technical: 200,
};
```

Fehlt einer der drei Regalnamen, entsteht ein Kompilierfehler. `Record` garantiert, dass jeder Schlüssel der Union einen entsprechenden Wert hat.

---

## Utility Types kombinieren

Utility Types können verschachtelt werden, um spezifischere Transformationen auszudrücken. Ein Update-Payload sollte serverseitig generierte Felder ausschließen **und** die verbleibenden Felder optional machen:

```typescript
type BookUpdatePayload = Partial<Omit<Book, "id" | "createdAt" | "updatedAt">>;
```

Von innen nach außen lesen: Zuerst entfernt `Omit` drei Eigenschaften, dann macht `Partial` die verbleibenden optional. Das Ergebnis ist ein Typ, bei dem `title`, `author`, `isbn` und `isAvailable` alle vorhanden, aber keines davon verpflichtend ist.

Hier ist das vollständige BookShelf-Typgerüst, abgeleitet aus einer einzigen `Book`-Definition:

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// POST /books: schließt serverseitig generierte Felder aus
type BookCreatePayload = Omit<Book, "id" | "createdAt" | "updatedAt">;

// PATCH /books/:id: schließt Serverfelder aus, alles andere optional
type BookUpdatePayload = Partial<Omit<Book, "id" | "createdAt" | "updatedAt">>;

// GET /books (Listenansicht): nur die für die Anzeige benötigten Felder
type BookPreview = Pick<Book, "id" | "title" | "author">;

// Anwendungszustand
interface AppState {
  books: Book[];
  isLoading: boolean;
  filterByAuthor: string | null;
}
```

Fünf Typen, abgeleitet aus einem einzigen Interface. Wenn `Book` ein `publisher`-Feld erhält, übernimmt der Create-Payload es automatisch, der Update-Payload macht es optional, und die Vorschau bleibt unverändert. Nichts driftet auseinander.

---

## Ressourcen

- [Utility Types im TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/utility-types.html)
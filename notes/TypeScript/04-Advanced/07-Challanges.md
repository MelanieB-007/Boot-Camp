# TypeScript Fortgeschritten – Deklarationsdateien – Aufgaben

## Die BookShelf-Typschicht aufbauen

Du erstellst die Typschicht für eine Bibliotheksverwaltungs-API. Ziel ist es, eine vollständige Sammlung von Typen in einer Deklarationsdatei zu definieren und diese dann in einem Service-Modul zu verwenden.

### Basistypen

Eine Datei `types/book.d.ts` mit folgendem Inhalt erstellen:

- Einen Typalias `EntityId`, der entweder `number` oder `string` akzeptiert.
- Einen Typ `Timestamped` mit `createdAt: Date` und `updatedAt: Date`.
- Einen Typ `HasId` mit `id: EntityId`.
- Einen `Book`-Typ, der `HasId`, `Timestamped` und buchspezifische Felder (`title`, `author`, `isbn`, `isAvailable`) mit Intersection Types kombiniert.
- Einen Tupel-Typ `IsbnParts`, der die drei Komponenten einer ISBN repräsentiert: Gruppe (`number`), Verlag (`string`) und Titelkennzeichen (`string`).

### Abgeleitete Payload-Typen

In derselben Datei folgende Typen mit Utility Types definieren. Eigenschaften nicht manuell wiederholen:

- `BookCreatePayload`: alle `Book`-Eigenschaften außer `id`, `createdAt` und `updatedAt`.
- `BookUpdatePayload`: wie `BookCreatePayload`, aber jedes Feld ist optional.
- `BookPreview`: nur `id`, `title` und `author` aus `Book`.

### Generischer Antwort-Wrapper

Ein generisches `ApiResponse<T>`-Interface mit `status: number`, `message: string` und `data: T` definieren.

### Service-Modul

Eine Datei `src/bookService.ts` erstellen, die die Typen aus der Deklarationsdatei mit `import type` importiert. Folgende Funktionssignaturen schreiben (Stub-Implementierungen sind in Ordnung):

- `fetchBooks(): Promise<ApiResponse<BookPreview[]>>`
- `fetchBook(id: EntityId): Promise<ApiResponse<Book>>`
- `createBook(payload: BookCreatePayload): Promise<ApiResponse<Book>>`
- `updateBook(id: EntityId, changes: BookUpdatePayload): Promise<ApiResponse<Book>>`
- `parseIsbn(isbn: string): IsbnParts`

Überprüfen, dass der Compiler den Code akzeptiert, indem `tsc --noEmit` ausgeführt wird.

---

## Generische Collection-Hilfsfunktionen

Drei generische Hilfsfunktionen schreiben, die mit beliebigen Objekttypen funktionieren. Jede mit einem Array von `Book`-Objekten testen.

- **`groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]>`** nimmt ein Array und einen Property-Namen entgegen und gibt ein Objekt zurück, bei dem jeder Schlüssel ein eindeutiger Wert dieser Property ist und jeder Wert ein Array der passenden Elemente. Beispiel: Bücher nach Autor gruppieren.

- **`pluck<T, K extends keyof T>(items: T[], key: K): T[K][]`** nimmt ein Array und einen Property-Namen entgegen und gibt ein Array zurück, das nur den Wert dieser Property aus jedem Element enthält. Beispiel: alle Buchtitel extrahieren.

- **`merge<T>(base: T, updates: Partial<T>): T`** nimmt ein Basisobjekt und ein partielles Update entgegen und gibt ein neues Objekt mit den angewendeten Updates zurück. Beispiel: einen `BookUpdatePayload` auf ein `Book` anwenden.

Jede Funktion muss generisch, vollständig annotiert und mit beliebigen Objekttypen einsetzbar sein – nicht nur mit `Book`.

---

## Stretch-Ziel: Typsicherer Event-Emitter

Eine generische Klasse `EventEmitter<Events>` erstellen, bei der `Events` ein `Record` ist, der Event-Namen auf ihre Payload-Typen abbildet:

```typescript
type BookEvents = {
  bookAdded: Book;
  bookRemoved: { id: EntityId };
  searchPerformed: { query: string; resultCount: number };
};

const emitter = new EventEmitter<BookEvents>();
```

Zwei Methoden implementieren:

- `on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`
- `emit<K extends keyof Events>(event: K, payload: Events[K]): void`

Der Compiler soll erzwingen, dass `emit("bookAdded", payload)` nur ein `Book` als Payload akzeptiert, und dass `on("searchPerformed", handler)` `{ query: string; resultCount: number }` an die Handler-Funktion übergibt.
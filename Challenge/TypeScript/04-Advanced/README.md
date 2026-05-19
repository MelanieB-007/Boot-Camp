# Aufgabe: BookShelf-Typschicht aufbauen

Du baust die Typschicht für eine Bibliotheksverwaltungs-API. Ziel ist es, einen vollständigen Satz an Typen in einer Deklarationsdatei zu definieren und diese anschließend in einem Service-Modul zu verwenden.

---

## Basistypen

Erstelle eine Datei `types/book.d.ts` mit folgenden Typen:

- Einen Typ-Alias `EntityId`, der entweder eine `number` oder einen `string` akzeptiert
- Einen Typ `Timestamped` mit den Feldern `createdAt: Date` und `updatedAt: Date`
- Einen Typ `HasId` mit dem Feld `id: EntityId`
- Einen Typ `Book`, der `HasId`, `Timestamped` und buchspezifische Felder (`title`, `author`, `isbn`, `isAvailable`) mithilfe von Intersection Types zusammensetzt
- Einen Tuple-Typ `IsbnParts`, der die drei Bestandteile einer ISBN repräsentiert: Gruppe (`number`), Verlag (`string`) und Titelkennung (`string`)

---

## Abgeleitete Payload-Typen

Definiere in derselben Datei die folgenden Typen mithilfe von Utility Types. Eigenschaften dürfen **nicht** manuell dupliziert werden:

- `BookCreatePayload`: alle `Book`-Eigenschaften außer `id`, `createdAt` und `updatedAt`
- `BookUpdatePayload`: wie `BookCreatePayload`, aber jedes Feld ist optional
- `BookPreview`: nur `id`, `title` und `author` aus `Book`

---

## Generischer Response-Wrapper

Definiere ein generisches Interface `ApiResponse<T>` mit den Feldern `status: number`, `message: string` und `data: T`.

---

## Service-Modul

Erstelle eine Datei `src/bookService.ts`, die die Typen aus der Deklarationsdatei per `import type` importiert. Schreibe die folgenden Funktionssignaturen (Stub-Implementierungen sind ausreichend):

- `fetchBooks(): Promise<ApiResponse<BookPreview[]>>`
- `fetchBook(id: EntityId): Promise<ApiResponse<Book>>`
- `createBook(payload: BookCreatePayload): Promise<ApiResponse<Book>>`
- `updateBook(id: EntityId, changes: BookUpdatePayload): Promise<ApiResponse<Book>>`
- `parseIsbn(isbn: string): IsbnParts`

Überprüfe, ob der Compiler deinen Code akzeptiert, indem du `tsc --noEmit` ausführst.

---

## Generische Collection-Utilities

Schreibe drei generische Hilfsfunktionen, die mit beliebigen Objekttypen funktionieren. Teste jede davon mit einem Array aus `Book`-Objekten.

- `groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]>` – nimmt ein Array und einen Eigenschaftsnamen und gibt ein Objekt zurück, bei dem jeder Schlüssel ein eindeutiger Wert dieser Eigenschaft ist und jeder Wert ein Array mit den passenden Elementen. Beispiel: Bücher nach Autor gruppieren.

- `pluck<T, K extends keyof T>(items: T[], key: K): T[K][]` – nimmt ein Array und einen Eigenschaftsnamen und gibt ein Array zurück, das nur den Wert dieser Eigenschaft aus jedem Element enthält. Beispiel: alle Buchtitel extrahieren.

- `merge<T>(base: T, updates: Partial<T>): T` – nimmt ein Basisobjekt und ein partielles Update und gibt ein neues Objekt mit den angewendeten Änderungen zurück. Beispiel: einen `BookUpdatePayload` auf ein `Book` anwenden.

Jede Funktion muss generisch, vollständig annotiert und mit beliebigen Objekttypen verwendbar sein – nicht nur mit `Book`.

---

## Stretch Goal: Typsicherer EventEmitter

Erstelle eine generische Klasse `EventEmitter<Events>`, bei der `Events` ein `Record` ist, der Ereignisnamen auf ihre Payload-Typen abbildet:

```typescript
type BookEvents = {
  bookAdded: Book;
  bookRemoved: { id: EntityId };
  searchPerformed: { query: string; resultCount: number };
};

const emitter = new EventEmitter<BookEvents>();
```

Implementiere zwei Methoden:

- `on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`
- `emit<K extends keyof Events>(event: K, payload: Events[K]): void`

Der Compiler soll sicherstellen, dass `emit("bookAdded", payload)` nur ein `Book` als Payload akzeptiert und dass `on("searchPerformed", handler)` dem Handler `{ query: string; resultCount: number }` übergibt.
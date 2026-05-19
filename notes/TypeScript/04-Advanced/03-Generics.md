# TypeScript Advanced – Generics

Deine BookShelf-API hat mehrere Endpunkte. Einer gibt eine Liste von Büchern zurück, ein anderer einen einzelnen Autor, und ein dritter ein Fehlerobjekt. Alle drei Antworten teilen dieselbe Wrapper-Struktur: ein `status`-Feld, ein `message`-Feld und ein `data`-Feld. Das Einzige, was sich von Endpunkt zu Endpunkt ändert, ist der Typ von `data`.

Du könntest für jede Antwort ein eigenes Interface schreiben. `BookListResponse` hätte `data: Book[]`, `AuthorResponse` hätte `data: Author`, und `ErrorResponse` hätte `data: ApiError`. Das funktioniert, aber du duplizierst den Wrapper jedes Mal. Wenn du später allen Antworten ein `timestamp`-Feld hinzufügst, musst du drei Interfaces statt einem aktualisieren.

Generics lösen dieses Problem, indem sie einen Platzhalter für einen Typ einführen. Du schreibst ein einziges `ApiResponse`-Interface mit einer Typvariable – üblicherweise `T` – anstelle des Datentyps. Wenn du das Interface verwendest, füllst du `T` mit dem tatsächlich benötigten Typ aus. Der Compiler stellt dann sicher, dass das `data`-Feld dem entspricht, was du angegeben hast. Du schreibst eine Definition und verwendest sie überall – mit voller Typsicherheit.

Das Konzept geht über Interfaces hinaus. Generische Funktionen nehmen Werte entgegen und geben sie zurück, wobei deren Typen durch eine Typvariable verknüpft sind. Generische Constraints schränken ein, welche Typen erlaubt sind. Und einige TypeScript-Features, die du bereits kennst – wie `Array<T>` und `Promise<T>` – sind intern Generics. Diesen Mechanismus zu verstehen erschließt die Utility Types aus einem späteren Abschnitt, denn Typen wie `Partial<T>` und `Pick<T, K>` sind selbst eingebaute generische Typen.

---

## Generische Interfaces

Generics sind nützlich, wenn ein Teil einer Datenstruktur variiert. Der API-Response-Wrapper der BookShelf-API ist ein natürliches Beispiel:

```typescript
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
```

`T` steht für den Datentyp. Beim Verwenden des Interfaces füllst du `T` aus:

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
}

interface ApiError {
  code: string;
  detail: string;
}

const bookList: ApiResponse<Book[]> = {
  status: 200,
  message: "Books fetched",
  data: [
    { id: 1, title: "Clean Code", author: "Robert C. Martin" },
    { id: 2, title: "Refactoring", author: "Martin Fowler" },
  ],
};

const error: ApiResponse<ApiError> = {
  status: 404,
  message: "Resource not found",
  data: { code: "NOT_FOUND", detail: "No book with that ID" },
};
```

Der Compiler stellt sicher, dass `data` in `bookList` ein `Book[]` ist und in `error` ein `ApiError`. Eine einzige Interface-Definition deckt beide Fälle ab – und jeden weiteren Antworttyp, den du künftig hinzufügst.

> ✎ **Hinweis:** Du hast vielleicht schon generische Interfaces verwendet, ohne es zu merken. Die `fetch`-API gibt zum Beispiel `Promise<Response>` zurück, und async-Funktionen werden oft mit `Promise<User[]>` typisiert. `Promise<T>` ist ein eingebautes generisches Interface, bei dem `T` der Typ ist, zu dem das Promise aufgelöst wird.

---

## Eingebaute generische Typen

TypeScript liefert mehrere generische Typen mit, die häufig verwendet werden – oft ohne dass man über den dahinterliegenden Mechanismus nachdenkt.

`Array<T>` ist die generische Form der `T[]`-Kurzschreibweise. Diese beiden Deklarationen sind identisch:

```typescript
const books: Array<Book> = [];
const alsoBooks: Book[] = [];
```

Die Kurzschreibweise ist im Alltag gebräuchlicher, aber `Array<T>` taucht in Bibliotheks-Typsignaturen und Fehlermeldungen auf.

`Promise<T>` repräsentiert eine asynchrone Operation, die zu einem Wert vom Typ `T` aufgelöst wird. Jede async-Funktion gibt ein Promise zurück:

```typescript
async function fetchBooks(): Promise<Book[]> {
  const response = await fetch("/api/books");
  const data = await response.json();
  return data as Book[];
}
```

`ReadonlyArray<T>` ist ein Array, bei dem Elemente nach der Erstellung weder hinzugefügt, entfernt noch neu zugewiesen werden können:

```typescript
const featured: ReadonlyArray<Book> = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin" },
];

featured.push(anotherBook);
// Kompilierfehler: Property 'push' does not exist on type 'readonly Book[]'
```

Das ist nützlich, wenn sichergestellt werden soll, dass eine Liste nach ihrer Erstellung unverändert bleibt.

---

## Generische Funktionen

Eine normale Funktion legt ihre Typen zum Zeitpunkt des Schreibens fest. Eine generische Funktion verschiebt diese Entscheidung auf den Aufrufer.

Betrachte eine Funktion, die das erste Element eines Arrays zurückgibt. Ohne Generics geht die Typinformation verloren:

```typescript
function getFirst(items: unknown[]): unknown {
  return items[0];
}

const title = getFirst(["Clean Code", "Refactoring"]);
// title ist unknown, obwohl ein string-Array übergeben wurde
```

Eine Typvariable `T` in spitzen Klammern nach dem Funktionsnamen löst dieses Problem:

```typescript
function getFirst<T>(items: T[]): T {
  return items[0];
}
```

`T` erfasst den Typ der Array-Elemente. Beim Aufruf leitet TypeScript `T` aus dem Argument ab:

```typescript
const title = getFirst(["Clean Code", "Refactoring"]);
// title ist string

const id = getFirst([1, 2, 3]);
// id ist number
```

Du kannst `T` auch explizit setzen, wenn die Ableitung mehrdeutig ist oder du präzise sein möchtest:

```typescript
const title = getFirst<string>(["Clean Code", "Refactoring"]);
```

Eingabe- und Rückgabetyp sind durch `T` verknüpft. Was hineingeht, bestimmt was herauskommt – und der Compiler erzwingt das.

---

## Generische Constraints

Standardmäßig kann eine Typvariable `T` alles sein: ein String, eine Zahl, ein Objekt oder sogar `null`. Manchmal muss das eingeschränkt werden. Das Schlüsselwort `extends` innerhalb der spitzen Klammern legt fest, welche Typen erlaubt sind:

```typescript
function getEntityId<T extends { id: number | string }>(
  entity: T,
): number | string {
  return entity.id;
}
```

Diese Funktion akzeptiert jedes Objekt mit einer `id`-Eigenschaft. Ein Objekt ohne `id` führt zu einem Kompilierfehler:

```typescript
getEntityId({ id: 1, title: "Clean Code" });
// funktioniert, das Objekt hat eine id

getEntityId({ name: "keine id hier" });
// Kompilierfehler: property 'id' is missing
```

---

## Mehrere Typparameter

Manchmal arbeitet eine Funktion mit zwei unabhängigen Typen. Eine Funktion, die ein Schlüssel-Wert-Paar erstellt, benötigt separate Variablen für Schlüssel und Wert. Mehrere Generics werden durch Kommas getrennt:

```typescript
function createEntry<K extends string, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const entry = createEntry("isbn", "978-0132350884");
```

Der Rückgabetyp ist ein Tuple `[K, V]` – das Tuple-Konzept aus dem vorherigen Abschnitt.

---

## Standard-Typparameter

Du kannst einen Fallback-Typ angeben, wenn der Aufrufer keinen spezifiziert:

```typescript
interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}
```

Wenn `ApiResponse` ohne spitze Klammern verwendet wird, ist `T` standardmäßig `unknown`:

```typescript
const raw: ApiResponse = { status: 200, message: "OK", data: null };
// data ist unknown

const typed: ApiResponse<Book> = { status: 200, message: "OK", data: book };
// data ist Book
```

Standardwerte sind am nützlichsten in generischen Interfaces, bei denen ein häufiger Fall existiert und nicht jeder Verwender gezwungen werden soll, den Typparameter anzugeben.

---

## Ressourcen

- [Generics im TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [keyof-Typoperator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
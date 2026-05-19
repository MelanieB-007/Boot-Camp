# TypeScript Advanced – Intersection Types und Tuples

In der Grundlagensitzung hast du Typen und Interfaces einzeln definiert – jeder für sich. Das funktioniert bei einfachen Daten, aber in echten Anwendungen wiederholen sich strukturelle Muster über viele Entitäten hinweg. Ein Buch, ein Autor und ein Verlag benötigen möglicherweise alle ein `id`-Feld und ein Paar Zeitstempel. Diese Eigenschaften in jedes Interface zu kopieren bedeutet, bei einer Änderung drei Stellen aktualisieren zu müssen. Vergisst man eine davon, driften die Typen lautlos auseinander.

Intersection Types und Tuples bieten zwei Möglichkeiten, Typen aus kleineren Bausteinen zusammenzusetzen – eine für Objekte, eine für positionsbasierte Daten.

---

## Intersection Types

Intersection Types lösen dieses Problem, indem sie mehrere Typen zu einem einzigen zusammenfügen. Statt `id`, `createdAt` und `updatedAt` in jedem Interface zu wiederholen, definierst du sie einmal und kombinierst sie mit dem `&`-Operator. Das Ergebnis ist ein Typ, der alle Eigenschaften jedes kombinierten Typs besitzt.

> Der `&`-Operator kombiniert zwei oder mehr Typen zu einem. Der resultierende Typ muss alle kombinierten Typen gleichzeitig erfüllen. Denk daran als „dieses UND jenes".

Beginne mit zwei kleinen Typen, die gemeinsame Muster deiner `BookShelf`-Entitäten beschreiben:

```typescript
type HasId = {
  id: string;
};

type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};
```

Setze nun einen `Book`-Typ zusammen, indem du diese mit buchspezifischen Feldern schneidest:

```typescript
type BookFields = {
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
};

type Book = HasId & Timestamped & BookFields;
```

Ein Wert vom Typ `Book` muss alle Eigenschaften aller drei Typen enthalten. Fehlt auch nur eine, entsteht ein Kompilierfehler:

```typescript
const book: Book = {
  id: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  title: "Clean Code",
  author: "Robert C. Martin",
  isbn: "978-0132350884",
  isAvailable: true,
};
```

Der Vorteil zeigt sich, wenn du weitere Entitäten hinzufügst. Ein `Author`-Typ kann `HasId` und `Timestamped` wiederverwenden, ohne deren Eigenschaften zu duplizieren:

```typescript
type AuthorFields = {
  name: string;
  bio: string;
};

type Author = HasId & Timestamped & AuthorFields;
```

Fügst du `Timestamped` später ein `deletedAt`-Feld hinzu, übernehmen es `Book` und `Author` automatisch.

> ✎ **Hinweis:** Intersection Types sind der Standardweg, um einen Typ-Alias zu erweitern. Interfaces nutzen dafür das Schlüsselwort `extends`, aber Typ-Aliase können `extends` nicht verwenden. Nutze `&` wenn du mit Typdefinitionen arbeitest.

---

## Intersection Types vs. Union Types

Intersection Types (`&`) und Union Types (`|`) sehen ähnlich aus, bedeuten aber das Gegenteil. Eine Intersection verlangt, dass ein Wert alle kombinierten Typen erfüllt. Eine Union erlaubt es, einen davon zu erfüllen.

```typescript
type StringOrNumber = string | number;
type HasNameAndAge = { name: string } & { age: number };
```

Eine Variable vom Typ `StringOrNumber` kann ein `string` oder eine `number` sein, aber nicht beides gleichzeitig. Eine Variable vom Typ `HasNameAndAge` muss sowohl `name` als auch `age` besitzen.

Union Types können auch innerhalb von Objekttypen verwendet werden:

```typescript
type HasId = {
  id: number | string;
};
```

> ⚠️ **Achtung:** Die Überschneidung zweier inkompatibler primitiver Typen ergibt den Typ `never`. `string & number` ergibt `never`, weil kein Wert gleichzeitig ein `string` und eine `number` sein kann.

---

## Tuple-Typen

Tuples lösen eine andere Art der Komposition als reguläre Arrays. Ein reguläres typisiertes Array (z. B. `string[]`) kann beliebig viele Elemente desselben Typs enthalten, sagt aber nichts über die Länge oder die Bedeutung jeder Position aus. Tuples schließen diese Lücke, indem sie eine feste Struktur definieren: ein Array mit bekannter Länge, bei dem jede Position ihren eigenen Typ hat.

Eine ISBN zum Beispiel hat eine feste Struktur, bei der die Reihenfolge wichtig ist. Sie besteht aus drei Komponenten: einer Registrierungsgruppe (`number`), einem Verlagscode (`string`) und einer Titelkennung (`string`). Ein Tuple drückt genau diese Art positionsbasierter Daten aus:

```typescript
type IsbnParts = [number, string, string];

const cleanCodeIsbn: IsbnParts = [978, "0132", "350884"];
```

TypeScript erzwingt sowohl die Länge als auch den Typ an jeder Position. Ein viertes Element hinzuzufügen oder eine Zahl durch einen String zu ersetzen führt zu einem Kompilierfehler.

Destructuring funktioniert bei Tuples genauso wie bei Arrays, aber jede Variable erhält den Typ ihrer Position:

```typescript
const [group, publisher, titleCode] = cleanCodeIsbn;
```

`group` hat den Typ `number`, `publisher` und `titleCode` sind beide `string`. Der Compiler weiß dies aus der Tuple-Definition, nicht aus den Werten.

Tuples sind am nützlichsten für kleine, positionsbasierte Daten, bei denen das Erstellen eines benannten Objekts übertrieben wäre. Rückgabewerte von Funktionen sind ein häufiger Anwendungsfall:

```typescript
type BookResult = [Book | null, Error | null];

function findBook(id: number): BookResult {
  // gibt [book, null] bei Erfolg zurück, oder [null, error] bei Misserfolg
}
```

> 💡 **Gut zu wissen:** Du bist Tuple-ähnlichen Strukturen bereits begegnet, ohne es zu wissen. Wenn du den Rückgabewert von `useState` in React destrukturierst (`const [count, setCount] = useState(0)`), ist der Rückgabetyp ein Tuple: `[number, Dispatch<SetStateAction<number>>]`.

Bei größeren Strukturen mit mehr als drei oder vier Feldern sind Objekte mit benannten Eigenschaften vorzuziehen. Die positionsbasierte Natur von Tuples wird bei vielen Elementen unübersichtlich.

---

## Der `keyof`-Operator

Der `keyof`-Operator nimmt einen Objekttyp und extrahiert alle seine Eigenschaftsschlüssel als Union von String-Literalen. Das ist nützlich, wenn ein Wert auf gültige Schlüssel eines bestimmten Objekttyps beschränkt werden soll.

```typescript
type GenreDescriptions = {
  horror: string;
  romance: string;
  scienceFiction: string;
};

const descriptions: GenreDescriptions = {
  horror: "Gruselige und spannende Geschichten",
  romance: "Bücher über Liebe und Beziehungen",
  scienceFiction: "Zukunfts- und Weltraumabenteuer",
};

function getGenreDescription(genre: keyof GenreDescriptions): string {
  return descriptions[genre];
}

getGenreDescription("horror");
// gibt "Gruselige und spannende Geschichten" zurück

getGenreDescription("fantasy");
// Kompilierfehler: Argument vom Typ '"fantasy"' ist nicht dem Parameter
// vom Typ '"horror" | "romance" | "scienceFiction"' zuweisbar.
```

`keyof GenreDescriptions` ergibt die Union `"horror" | "romance" | "scienceFiction"`. Durch die Typisierung des Parameters als `keyof GenreDescriptions` akzeptiert die Funktion nur Schlüssel, die tatsächlich im Typ vorhanden sind. Das verhindert Tippfehler und hält die erlaubten Parameter automatisch aktuell, wenn sich der Typ `GenreDescriptions` ändert.

---

## Ressourcen

- [Intersection Types im TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Tuple-Typen im TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)
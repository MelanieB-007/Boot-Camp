# TypeScript Client-seitig – Fetch API

Bei HTTP-Anfragen über die `fetch`-API wird ein `Response`-Objekt zurückgegeben. Der Aufruf von `.json()` darauf liefert jedoch den Typ `any`. TypeScript kann die Struktur von Daten, die zur Laufzeit asynchron über das Netzwerk abgerufen werden, nicht ableiten. Der geparste Wert trägt daher so lange keine Typinformation, bis du sie explizit angibst.

Ohne zusätzliche Typinformationen ist jede Eigenschaft, auf die du bei abgerufenen Daten zugreifst, untypisiert. TypeScript warnt dich nicht, wenn du einen Feldnamen falsch schreibst oder auf eine Eigenschaft zugreifst, die in der Antwort gar nicht existiert. Jeder Tippfehler oder strukturelle Mismatch wird so zu einem stillen Laufzeitfehler statt zu einem Compiler-Fehler.

Der Standardansatz besteht darin, die Datenstruktur mithilfe eines TypeScript-`interface` zu definieren, den Rückgabetyp der Funktion entsprechend zu annotieren und eine Type Assertion zu verwenden, um dem Compiler mitzuteilen, dass das geparste JSON dieser Struktur entspricht.

## Datenstrukturen definieren

Ein `interface` beschreibt die Struktur eines Objekts: seine Eigenschaftsnamen und deren Typen. Für einen Fetch-Aufruf definierst du ein Interface, das der JSON-Struktur entspricht, die du von der API erwartest.

```ts
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}
```

Dieses Interface ist ein Vertrag zur Kompilierzeit. TypeScript nutzt es, um sicherzustellen, dass du nur auf Eigenschaften zugreifst, die auf `User`-Objekten existieren. Es validiert die tatsächliche Netzwerkantwort zur Laufzeit **nicht**. Wenn die API etwas anderes zurückgibt, wird TypeScript es nicht erkennen.

## Async-Funktionen typisieren

Da wir beim Datenabruf von einem Webserver mit asynchronen Daten arbeiten, kapselt eine `async`-Funktion ihren Rückgabewert immer in einem Promise. Um das zu annotieren, verwendest du die Promise-Syntax, wobei `Type` dem definierten Interface entspricht. Da `response.json()` einen untypisierten Wert (`any`) zurückgibt, musst du das geparste JSON außerdem über eine Type Assertion mit deinem Interface verknüpfen.

```ts
async function fetchAllUsers(url: string): Promise<User[]> {
  const response = await fetch(url);
  const data = await response.json();

  return data as User[];
}
```

Die zwei Bestandteile dieser Funktion:

- Der Rückgabetyp `Promise<User[]>` deklariert die genaue Struktur der Daten, die die Funktion letztendlich liefern wird.
- `data as User[]` assertiert das geparste JSON als die erwartete Struktur und stellt sicher, dass TypeScript alle nachgelagerten Verwendungen typprüfen kann.

Wenn du den Funktionsaufruf nun mit `await` aufrufst, behandelt TypeScript das Ergebnis als `User[]`. Der Zugriff auf die Eigenschaft `name` funktioniert einwandfrei, da sie im `User`-Interface definiert ist. Der Zugriff auf `age` hingegen löst einen Compiler-Fehler aus, da keine solche Eigenschaft definiert ist.

```ts
const users = await fetchAllUsers("https://jsonplaceholder.typicode.com/users");

console.log(users[0].name);
console.log(users[0].age); // Compiler-Fehler – das User-Interface hat keine Eigenschaft 'age'
```

## Ressourcen

- [MDN: Fetch API](https://developer.mozilla.org/de/docs/Web/API/Fetch_API)
- [TypeScript-Handbuch: Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
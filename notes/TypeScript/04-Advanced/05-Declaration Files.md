# TypeScript Fortgeschritten – Deklarationsdateien

Dein BookShelf-Projekt hat nun `Book`, `BookCreatePayload`, `BookUpdatePayload`, `BookPreview`, `ApiResponse<T>` und `AppState`. In einem kleinen Projekt leben diese Typen in denselben Dateien wie die Funktionen, die sie verwenden. Das funktioniert, wenn eine oder zwei Dateien einen Typ referenzieren. Aber mit wachsendem Projekt werden dieselben Typen von Route-Handlern, Service-Funktionen, Validierungslogik und Tests importiert. Wenn `Book` innerhalb von `bookService.ts` definiert ist, hängt jede Datei, die ihn benötigt, von einem Service-Modul ab – obwohl sie nur die Typdefinition braucht.

Deklarationsdateien lösen dieses Problem, indem sie Typen ein eigenes Zuhause geben. Eine Datei mit der Erweiterung `.d.ts` enthält ausschließlich Typinformationen: Interfaces, Typaliasse und Typexporte. Kein Laufzeitcode, keine Funktionskörper, keine Variablenzuweisungen. Der TypeScript-Compiler verwendet diese Dateien für die Typprüfung und Autovervollständigung im Editor, entfernt sie aber vollständig beim Kompilieren. Sie fügen deinem produktiven JavaScript null Bytes hinzu.

Deklarationsdateien erfüllen zwei Zwecke. Innerhalb des eigenen Projekts ermöglichen sie, Typverträge vom implementierenden Code zu trennen. Ein `types/`-Verzeichnis mit `.d.ts`-Dateien wird zur einzigen Quelle der Wahrheit für das Datenmodell. Außerhalb des Projekts ist es die Art, wie TypeScript JavaScript-Bibliotheken versteht, die nicht in TypeScript geschrieben wurden. Wenn du `@types/node` installierst, installierst du `.d.ts`-Dateien, die beschreiben, wie `process`, `fs` und jede andere Node.js-API aussieht. In der Grundlagen-Einheit hast du diese Pakete verwendet, ohne zu schauen, was darin steckt. Dieses Handout öffnet die Box.

## Deklarationsdateien

Eine `.d.ts`-Datei enthält ausschließlich Typdeklarationen. Sie darf keinen ausführbaren Code enthalten: keine Funktionsimplementierungen, keine Variablenzuweisungen, keine `console.log`-Aufrufe.

Der TypeScript-Compiler liest `.d.ts`-Dateien während der Typprüfung und verwendet sie, um sicherzustellen, dass dein Code den deklarierten Typen entspricht. Beim Kompilieren werden alle Typinformationen gelöscht. Die `.d.ts`-Dateien selbst werden nie in die JavaScript-Ausgabe aufgenommen.

Deklarationsdateien haben keine Laufzeitkosten. Sie existieren ausschließlich, um dem Compiler und deinem Editor zu helfen, die Form deiner Daten zu verstehen.

## Typen für das eigene Projekt deklarieren

Für projektinterne Typen ein `types/`-Verzeichnis erstellen und die Typdefinitionen in `.d.ts`-Dateien ablegen. Diese genauso exportieren wie in einer regulären `.ts`-Datei:

```typescript
// types/book.d.ts

export type EntityId = number | string;

export interface Book {
  id: EntityId;
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ... und alle anderen Typen
```

Diese Datei enthält alle Typen, die das BookShelf-Projekt benötigt, an einem einzigen Ort. Das `Book`-Interface wird einmalig definiert, und die Payload-Typen werden daraus mit den Utility Types aus dem vorherigen Handout abgeleitet.

Die Typen in Quelldateien mit `import type` importieren:

```typescript
// src/bookService.ts
import type { Book, BookCreatePayload, ApiResponse } from "../types/book";

async function createBook(
  payload: BookCreatePayload,
): Promise<ApiResponse<Book>> {
  const response = await fetch("/api/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return (await response.json()) as ApiResponse<Book>;
}
```

Das Schlüsselwort `import type` teilt TypeScript und dem Bundler mit, dass dieser Import nur für Typen gedacht ist. Das kompilierte JavaScript wird ihn nicht enthalten. Es gibt keine Laufzeitabhängigkeit von der Deklarationsdatei.

## Deklarationsdateien für externe Bibliotheken

Nicht jede JavaScript-Bibliothek wird mit eingebauten Typdefinitionen ausgeliefert. Bibliotheken, die vor TypeScript existierten oder in reinem JavaScript gepflegt werden, haben keine eigenen `.d.ts`-Dateien. Wenn du eine solche Bibliothek importierst, hat der TypeScript-Compiler keine Informationen darüber, wie ihre Funktionen aufgerufen werden sollten oder was sie zurückgeben.

Hier kommt das Schlüsselwort `declare` ins Spiel. Es teilt dem Compiler mit: „Dieses Ding existiert zur Laufzeit, aber ich definiere es hier nicht. Vertrau mir in Bezug auf seine Form." Hier ist eine vereinfachte Version dessen, was `@types/node` für das globale `process`-Objekt deklariert:

```typescript
// Innerhalb von @types/node (vereinfacht)

declare var process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  cwd(): string;
};
```

Das Schlüsselwort `declare` bedeutet: „Diese Variable existiert in der Laufzeitumgebung, und hier ist ihr Typ." Es gibt keine Zuweisung, keinen Funktionskörper. Der Compiler verwendet diese Deklaration, um Code zu prüfen, der auf `process.env` oder `process.exit()` verweist.

Du schreibst diese Deklarationen nicht von Hand für populäre Bibliotheken. Das Community-Projekt DefinitelyTyped pflegt Typdefinitionen für Tausende von JavaScript-Paketen, die unter dem `@types/`-Scope auf npm veröffentlicht werden. In der Grundlagen-Einheit hast du `@types/node` installiert, um Typprüfung für Node.js-APIs zu erhalten. Dieses Paket enthält `.d.ts`-Dateien, die jedes Modul und jede globale Funktion in Node.js beschreiben.

Wenn TypeScript auf einen Import wie `import fs from "fs"` trifft, sucht es nach einer passenden `.d.ts`-Datei in `@types/node`. Wird eine gefunden, verwendet es diese Typdeklarationen für die Kompilierzeit-Prüfung. Das eigentliche `fs`-Modul kommt zur Ausführungszeit von der Node.js-Laufzeitumgebung. Die Deklarationsdatei stellt lediglich die Typschicht darüber bereit.

> ⚠️ **Achtung:** Interne und externe Deklarationsdateien verwenden unterschiedliche Muster. Für eigene Projekttypen reguläre `export`-Anweisungen verwenden. Das Schlüsselwort `declare` ist nur nötig, um Code zu beschreiben, der zur Laufzeit existiert, aber nicht in TypeScript geschrieben wurde. Diese Muster zu vermischen führt zu verwirrenden Compiler-Fehlern.

## Ressourcen

- [Deklarationsdateien im TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [DefinitelyTyped-Repository](https://github.com/DefinitelyTyped/DefinitelyTyped)
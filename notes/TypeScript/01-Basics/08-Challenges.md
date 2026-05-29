# TypeScript Grundlagen – Aufgaben

## Code Along: Musikbibliothek

Dieses Code-Along baut Schritt für Schritt eine kleine Musikbibliothek-Anwendung auf – ein Konzept nach dem anderen. Jeder Teil entspricht direkt dem Lernmaterial der Einheit. Am Ende hast du ein funktionierendes, mehrere Dateien umfassendes TypeScript-Projekt mit typisierten Daten, Interfaces und Modulgrenzen.

### Teil 1: TypeScript installieren und eine Datei kompilieren

Den TypeScript-Compiler global installieren:

```bash
npm install -g typescript
```

Die Installation überprüfen:

```bash
tsc -v
```

Die Ausgabe sollte die Versionsnummer zeigen, z. B. `4.7.4`.

Eine Datei namens `hello.ts` in einem leeren Verzeichnis erstellen:

```typescript
const greeting: string = "Hello from TypeScript!";
console.log(greeting);
```

Kompilieren und die Ausgabe ausführen:

```bash
tsc hello.ts
node hello.js
```

`hello.js` öffnen und mit `hello.ts` vergleichen. Die Annotation `: string` ist verschwunden. Die erzeugte Datei ist reines JavaScript.

### Teil 2: Ein Projekt einrichten

Diese Ordnerstruktur erstellen:

```
music-library/
  src/
  dist/
  tsconfig.json
```

Die `tsconfig.json` aus dem Basis-Setup hinzufügen.

### Teil 3: Typannotationen und Aliasse

`src/index.ts` erstellen. Annotierte Variablen und einen Typalias für das zentrale Datenmodell hinzufügen:

```typescript
type TrackId = number;
type ArtistName = string;

type Track = {
  id: TrackId;
  title: string;
  artist: ArtistName;
  liked: boolean;
};

function describeTrack(track: Track): string {
  return `${track.title} by ${track.artist}`;
}

const tracks: Track[] = [
  { id: 1, title: "Blue Light", artist: "Jorja Smith", liked: true },
  { id: 2, title: "Nights", artist: "Frank Ocean", liked: false },
];

console.log(describeTrack(tracks[0]));
```

Kompilieren und ausführen:

```bash
tsc
node dist/tracks.js
```

Jetzt absichtlich einen Typfehler einbauen: `liked: true` aus dem ersten Track entfernen und `tsc` erneut ausführen. Den Fehler lesen, dann beheben, bevor es weitergeht.

### Teil 4: Typinferenz

Den folgenden Block zu `src/index.ts` hinzufügen:

```typescript
const label = "My Library";
const trackCount = tracks.length;

function formatId(id: number): string {
  return `TRK-${id}`;
}

const ids = tracks.map((t) => formatId(t.id));
console.log(ids, label, trackCount);
```

Keine dieser Variablen benötigt explizite Annotationen. Im Editor über `label`, `trackCount`, `ids` und den `t`-Parameter hovern, um zu bestätigen, was TypeScript inferiert hat.

Dann diese Zeile hinzufügen und versuchen zu kompilieren:

```typescript
const count: string = trackCount;
```

Der Fehler zeigt den inferierten Typ von `trackCount`. Die Zeile entfernen, bevor es weitergeht.

### Teil 5: Interfaces

Den Typalias `Track` durch ein Interface ersetzen und es mit einer spezifischeren Form erweitern. Die alte `type Track`-Deklaration entfernen und folgendes hinzufügen:

```typescript
interface Media {
  id: number;
  title: string;
}

interface Track extends Media {
  artist: string;
  liked: boolean;
}

interface FeaturedTrack extends Track {
  curatedBy: string;
  readonly addedDate: string;
}
```

Das `tracks`-Array verwendet bereits `Track`, daher muss dort nichts geändert werden. Ein `FeaturedTrack`-Objekt hinzufügen:

```typescript
const pick: FeaturedTrack = {
  id: 3,
  title: "Golden",
  artist: "Jill Scott",
  liked: true,
  curatedBy: "editorial",
  addedDate: "2024-01-15",
};

console.log(`${pick.title} — featured since ${pick.addedDate}`);
```

Versuche, `pick.addedDate` nach der Objekterstellung neu zuzuweisen, und beobachte den Compiler-Fehler. Die Zeile vor dem Fortfahren entfernen.

### Teil 6: ES-Module

Das Projekt in separate Dateien aufteilen. `src/types.ts` erstellen und die Interfaces sowie `formatId` dorthin verschieben:

```typescript
// src/types.ts
export interface Media {
  id: number;
  title: string;
}

export interface Track extends Media {
  artist: string;
  liked: boolean;
}

export interface FeaturedTrack extends Track {
  curatedBy: string;
  readonly addedDate: string;
}

export function formatId(id: number): string {
  return `TRK-${id}`;
}
```

`src/main.ts` als neuen Einstiegspunkt erstellen. Die Laufzeitfunktion mit einem regulären Import und die Interfaces mit Typ-only-Imports importieren:

```typescript
// src/main.ts
import { formatId } from "./track.js";
import type { Track, FeaturedTrack } from "./track.js";

const libraryName = "Late Night Listening";

function describeTrack(title: string, artist: string): string {
  return `${title} by ${artist}`;
}

const tracks: Track[] = [
  { id: 1, title: "Blue Light", artist: "Jorja Smith", liked: true },
  { id: 2, title: "Nights", artist: "Frank Ocean", liked: false },
];

const pick: FeaturedTrack = {
  id: 3,
  title: "Golden",
  artist: "Jill Scott",
  liked: true,
  curatedBy: "editorial",
  addedDate: "2024-01-15",
};

console.log(`Library: ${libraryName}`);
console.log(describeTrack(tracks[0]));
tracks.forEach((t) => console.log(formatId(t.id)));
console.log(`Featured: ${pick.title} — added ${pick.addedDate}`);
```

`src/index.ts` löschen. Den neuen Einstiegspunkt kompilieren und ausführen:

```bash
tsc
node dist/main.js
```

Fehlen den Importpfaden die `.js`-Erweiterung, erscheint zur Laufzeit ein „module-not-found"-Fehler, auch wenn die Kompilierung erfolgreich war. Sicherstellen, dass die Importpfade dem Muster `"./track.js"` entsprechen.

---

## Rezeptbuch

Eine einzelne TypeScript-Datei namens `recipes.ts` erstellen. Nur mit dem bisher Gelernten – Typannotationen, Typaliasse und Funktionssignaturen – folgendes implementieren:

- Einen Typalias `Ingredient` mit `name` (String) und `amountGrams` (Zahl).
- Einen Typalias `Recipe` mit `name`, `servings` (Zahl), `vegetarian` (Boolean) und `ingredients` (ein Array von `Ingredient`).
- Zwei als `Recipe` annotierte Variablen, die jeweils ein realistisches Rezept mit mindestens zwei Zutaten enthalten.
- Eine Funktion `summarize(recipe: Recipe): string`, die eine lesbare einzeilige Beschreibung des Rezepts zurückgibt.
- Einen Aufruf von `summarize` für jedes Rezept, der in der Konsole ausgegeben wird.

Kompilieren und ausführen:

```bash
tsc recipes.ts
node recipes.js
```

Der Compiler muss ohne Fehler beenden. Im Editor über die Variablen hovern und bestätigen, dass die inferierten Typen mit den deklarierten übereinstimmen.

---

## Film-Watchlist

Eine Film-Watchlist in TypeScript modellieren. Die Anforderungen sind:

- Ein `Watchable`-Basis-Interface mit einer `readonly id`, einem `title` und einem `year`.
- Ein `Film`-Interface, das `Watchable` erweitert, mit `watched: boolean` und einem optionalen `rating` zwischen 1 und 5.
- Ein `Playlist`-Interface mit einem `name` und einem Array von Filmen.
- Eine Funktion `formatFilm(film: Film): string`, die eine einzeilige Beschreibung zurückgibt – das Rating nur einschließen, wenn eines gesetzt ist.
- Eine Funktion `getUnwatched(playlist: Playlist): Film[]`, die nur Filme zurückgibt, bei denen `watched` `false` ist.

Den Code auf zwei Dateien aufteilen: eine, die die Interfaces und Funktionen definiert und exportiert, eine weitere, die sie importiert und das Programm ausführt. Der Einstiegspunkt soll eine Playlist mit mindestens drei Filmen definieren und die Ausgabe beider Funktionen in der Konsole ausgeben.

`import type` wo angemessen verwenden. Eine `tsconfig.json` mit aktiviertem Strict-Modus einrichten.

---

## Online-Shop

Ein kleiner Online-Shop verkauft Produkte, die in Kategorien organisiert sind. Kunden geben Bestellungen auf. Jede Bestellung enthält eine oder mehrere Positionen.

Das TypeScript-Typsystem für diesen Shop von Grund auf entwerfen. Anforderungen:

- Ein Produkt hat einen Namen, einen Preis in Euro und einen Lagerbestand. Seine `id` darf nach der Erstellung nicht neu zugewiesen werden.
- Produkte gehören zu einer Kategorie. Eine Kategorie hat einen Namen und eine optionale Beschreibung.
- Ein Kunde hat eine `id`, einen Namen und eine E-Mail-Adresse.
- Eine Bestellung verknüpft einen Kunden mit einer Liste von Positionen. Jede Position referenziert ein Produkt und eine Menge. Bestellungen haben einen Status von entweder `"pending"`, `"confirmed"` oder `"shipped"`.

Mindestens diese drei Funktionen implementieren:

- `orderTotal(order: Order): number` – der Gesamtpreis über alle Positionen hinweg.
- `formatOrder(order: Order): string` – eine lesbare Zusammenfassung der Bestellung.
- `isInStock(product: Product): boolean` – ob das Produkt verfügbaren Lagerbestand hat.

Den Code auf mindestens drei Dateien aufteilen. Strict-Modus verwenden. Das Projekt muss ohne Fehler kompilieren und beim Ausführen des Einstiegspunkts sinnvolle Ausgaben in der Konsole produzieren.
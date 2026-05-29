# TypeScript Advanced – Type Packages

Die nächste praktische Herausforderung ist die sichere Integration von externem Code. Viele TypeScript-Projekte stoßen hier auf Probleme: Ein Paket wird korrekt installiert, der Runtime-Code funktioniert, aber der Compiler meldet fehlende Deklarationen oder fällt auf `any` zurück. Damit verlierst du viele der Vorteile, für die du TypeScript überhaupt eingeführt hast. Type Packages schließen diese Lücke, indem sie Bibliotheks-APIs zur Kompilierzeit beschreiben.

Im TypeScript-Ökosystem werden die meisten Community-Typdeklarationen unter dem `@types`-Namespace veröffentlicht und über DefinitelyTyped gepflegt. Diese Pakete enthalten kein ausführbares JavaScript – sie sind Metadaten für bereits existierende JavaScript-Bibliotheken. Dasselbe Modell gilt für Node.js-Projekte: Node-Runtime-APIs wie `process`, `fs` und `path` werden ebenfalls über `@types/node` typisiert. Wer diese Trennung zwischen Runtime- und Type-Paket versteht, kann Abhängigkeitsprobleme viel leichter debuggen und externe Integrationen konsistent gestalten.

---

## Was `@types`-Pakete bereitstellen

`@types`-Pakete enthalten Deklarationsdateien (`.d.ts`), die die Form einer API beschreiben.

```bash
npm install lodash
npm install --save-dev @types/lodash
```

- `lodash` ist die Runtime-Bibliothek, die zur Ausführungszeit verwendet wird.
- `@types/lodash` stellt Typinformationen zur Kompilierzeit bereit.
- Das Type-Paket fügt keinen ausführbaren JavaScript-Code hinzu.

---

## Wann zusätzliche Type-Pakete benötigt werden

Folge dieser Faustregel:

- Installiere zuerst das Hauptpaket und lass TypeScript es prüfen.
- Wenn das Paket bereits eigene Deklarationen mitliefert, ist kein zusätzliches `@types/*`-Paket erforderlich.
- Wenn Deklarationen fehlen, installiere das passende `@types/*`-Paket als Dev-Dependency.

Das hält die Abhängigkeiten minimal und vermeidet veraltete oder unnötige Deklarationspakete.

---

## Typisierte Drittbibliotheken verwenden

Mit installierten Typdeklarationen kann TypeScript die Verwendung von Bibliotheken validieren:

```typescript
import * as _ from "lodash";

const grouped = _.groupBy(["cat", "dog", "crow"], "length");
```

- Parameter und Rückgabetypen von `groupBy` sind dem Compiler jetzt bekannt.
- IDE-Autovervollständigung wird für verfügbare Funktionen und Signaturen zuverlässig.
- Falsche Argumenttypen werden vor der Laufzeit erkannt.

---

## Node.js-Runtime-APIs mit `@types/node` typisieren

Node-Projekte sollten Node-Runtime-Deklarationen explizit installieren:

```bash
npm install --save-dev @types/node
```

```typescript
import fs from "node:fs";
import path from "node:path";

const appEnv: string | undefined = process.env.APP_ENV;
const filePath = path.join("data", "volunteers.json");
const raw = fs.readFileSync(filePath, "utf8");
```

- `process.env` und andere globale Objekte erhalten genaue Typinformationen.
- Eingebaute Module wie `fs` und `path` stellen typisierte Signaturen und Überladungen bereit.
- Häufige Backend-Fehler werden vor der Ausführung abgefangen.

---

## Typumgebungen in `tsconfig.json` eingrenzen

In gemischten Umgebungen sollten verfügbare globale Typen explizit eingeschränkt werden:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

- `types` steuert, welche Ambient-Deklarationspakete geladen werden.
- Explizite Eingrenzung verhindert unbeabsichtigtes Durchsickern globaler Typen.
- Das ist besonders nützlich, wenn Browser- und Node-Code nebeneinander existieren.

---

## Fehlende Deklarationsfehler beheben

Wenn TypeScript fehlende Deklarationsdateien meldet:

- Prüfe zuerst, ob die Bibliothek eigene Typen mitliefert, bevor du `@types/*` installierst.
- Falls nicht, installiere das passende `@types`-Paket als Dev-Dependency.
- Wenn Versionen auseinanderdriften, stimme die Hauptversionen von Runtime- und Type-Paket so weit wie möglich ab.
- Vermeide es, auf `any` zurückzufallen – behandle fehlende Deklarationen als Konfigurationsproblem.

---

## Ressourcen

- [TypeScript-Handbuch – Type Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [npm – @types/node](https://www.npmjs.com/package/@types/node)
- [DefinitelyTyped Repository](https://github.com/DefinitelyTyped/DefinitelyTyped)
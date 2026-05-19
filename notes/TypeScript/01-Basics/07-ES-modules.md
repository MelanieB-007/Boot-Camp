# TypeScript Grundlagen – ES Module

Sobald TypeScript-Code auf mehrere Dateien aufgeteilt wird, sind Module kein optionales Extra mehr, sondern die Struktur, die das Projekt verständlich hält. Ohne Module fühlt sich jede Datei wie ein großes Skript an, in dem Daten und Verhalten ineinanderfließen. Mit Modulen kann jede Datei eine klare öffentliche Schnittstelle (API) bereitstellen und interne Details verbergen.

Das ist besonders wichtig in der hier verwendeten Konfiguration, bei der `module` und `moduleResolution` als `NodeNext` eingestellt sind. Diese Konfiguration folgt dem modernen Node.js-Modulverhalten und erwartet, dass bewusst entschieden wird, was exportiert, was importiert und wie Pfade zur Laufzeit aufgelöst werden.

Viele Einsteiger lernen die `import`- und `export`-Syntax schnell, haben aber noch Schwierigkeiten mit dem praktischen Unterschied zwischen Typinformationen und Laufzeitwerten. Außerdem stoßen sie auf Pfadfehler, wenn Modulbezeichner nicht zum Verhalten des erzeugten JavaScripts passen.

ES Module lösen diese Probleme, wenn sie bewusst eingesetzt werden: Sie schaffen klare Grenzen, reduzieren ungewollte Kopplungen und machen Refactoring sicherer, da Abhängigkeiten in jeder Datei sichtbar sind. Ohne Module ist jede Datei praktisch ein Skript, in dem Namen und Werte zwischen Dateien durchsickern. Mit Modulen kontrolliert jede Datei genau, was sie nach außen gibt. Alles, was nicht exportiert wird, ist privat – interne Details können also geändert werden, ohne andere Teile des Projekts zu beeinträchtigen.

Gutes Moduldesign schafft stabile Nahtstellen zwischen Teilen der Codebasis – das macht größere TypeScript-Projekte refaktorierbar, ohne dass alles auf einmal bricht. Ziel ist es nicht, jedes Import-Muster auswendig zu lernen, sondern ein verlässliches mentales Modell für das Exportieren, Importieren und Organisieren von TypeScript-Modulen aufzubauen, damit das Projekt auch beim Wachsen vorhersehbar bleibt.

---

## Werte und Typen exportieren

Mit Exporten wird festgelegt, was ein Modul anderen Dateien zur Verfügung stellt.

```typescript
// volunteer.ts
export interface Volunteer {
  id: number;
  name: string;
}

export function formatVolunteer(name: string): string {
  return name.trim().toUpperCase();
}
```

- `Volunteer` ist ein Typ-Export, der zur Kompilierzeit verwendet wird.
- `formatVolunteer` ist ein Wert-Export, der zur Laufzeit verwendet wird.
- Beides in einem Modul zu halten ist üblich, wenn beide dasselbe Feature abbilden.

---

## Werte importieren mit typ-exklusiven Importen

Für Laufzeitwerte werden reguläre Importe verwendet, für Verweise, die nur zur Kompilierzeit benötigt werden, `import type`.

```typescript
import { formatVolunteer } from "./volunteer.js";
import type { Volunteer } from "./volunteer.js";

const lead: Volunteer = { id: 1, name: "Mina" };
console.log(formatVolunteer(lead.name));
```

- `formatVolunteer` bleibt im erzeugten JavaScript, da es ausgeführt wird.
- `Volunteer` wird bei der Kompilierung entfernt, da es nur ein Typ ist.
- Diese Trennung hält Laufzeit-Abhängigkeiten explizit.

---

## Modulpfade in NodeNext-Projekten

In NodeNext-Setups importieren TypeScript-Quelldateien lokale Module häufig mit der Dateiendung `.js`.

```typescript
import { loadConfig } from "./config.js";
```

- Quelldateien sind `.ts`, aber erzeugte Dateien sind `.js`.
- Die Verwendung von `.js` in Import-Bezeichnern stellt eine konsistente Laufzeitauflösung sicher.
- Falsche Pfade sind eine häufige Ursache für Laufzeitfehler des Typs „Modul nicht gefunden".

---

## Modul-APIs re-exportieren

Es lässt sich ein zentraler Modul-Einstiegspunkt erstellen, um Importe zu vereinfachen.

```typescript
// index.ts
export { formatVolunteer } from "./volunteer.js";
export type { Volunteer } from "./volunteer.js";
```

- Re-Exporte reduzieren wiederholte tiefe relative Importe.
- `export type` hält die Grenze zwischen Typen und Werten klar.
- Dieses Muster skaliert gut, wenn ein Ordner mehrere verwandte Module bereitstellt.

---

## Häufige Fehler mit Modulen und Importen

Diese Probleme treten häufig in frühen TypeScript-Modul-Setups auf.

### Laufzeitwerte importieren, obwohl nur Typinformationen benötigt werden

```typescript
// Beide landen im erzeugten JavaScript, auch wenn formatVolunteer nie aufgerufen wird
import { Volunteer, formatVolunteer } from "./volunteer.js";

const lead: Volunteer = { id: 1, name: "Mina" };
```

`Volunteer` ist ein Typ – er hat keine Laufzeitdarstellung. Ihn zusammen mit einem Laufzeitwert zu importieren, zieht eine unnötige Abhängigkeit in das erzeugte JavaScript. `import type` sollte für alles verwendet werden, das nur in Typpositionen referenziert wird:

```typescript
import { formatVolunteer } from "./volunteer.js";
import type { Volunteer } from "./volunteer.js";
```

### Fehlende `.js`-Erweiterungen in NodeNext-Projekten

```typescript
// Kompiliert erfolgreich, schlägt aber zur Laufzeit fehl
import { formatVolunteer } from "./volunteer";
```

TypeScript kompiliert `.ts`-Dateien zu `.js`. Zur Laufzeit sucht Node.js nach `.js`-Dateien. Fehlt die Erweiterung im Import-Bezeichner, schlägt die Auflösung fehl. In allen lokalen Importpfaden sollte `.js` verwendet werden, auch wenn die Quelldatei `.ts` ist:

```typescript
import { formatVolunteer } from "./volunteer.js";
```

### Typdefinitionen über mehrere Dateien duplizieren

```typescript
// volunteers.ts
interface Volunteer { id: number; name: string; }

// reports.ts
interface Volunteer { id: number; name: string; } // manuell kopiert
```

Wenn dieselbe Form in mehreren Dateien definiert wird, weichen sie im Laufe der Projektentwicklung voneinander ab. Der Typ sollte einmal definiert und überall dort importiert werden, wo er benötigt wird:

```typescript
import type { Volunteer } from "./volunteer.js";
```

---

## Ressourcen

- [TypeScript Handbuch – Module](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [TypeScript Handbuch – Typ-exklusive Importe und Exporte](https://www.typescriptlang.org/docs/handbook/2/modules.html#type-only-imports-and-exports)
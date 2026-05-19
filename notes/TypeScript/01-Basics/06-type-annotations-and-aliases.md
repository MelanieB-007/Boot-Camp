# TypeScript Grundlagen – Typ-Annotierungen und Aliasse

TypeScripts Kernaufgabe besteht darin, Variablen und Funktionsdefinitionen mit Typ-Annotierungen zu versehen. Eine Annotierung legt fest, was eine Variable sein soll: Diese Variable enthält Text, diese Funktion erwartet Zahlen, dieser Rückgabewert muss ein bestimmtes Objekt sein.

Doch Annotierungen haben ein Benennungsproblem, sobald ein Projekt wächst. Dieselbe Objektform in mehreren Dateien von Hand auszuschreiben ist fehleranfällig – die verschiedenen Annotierungen können sich im Laufe der Zeit in unterschiedliche Richtungen entwickeln. Dieses Phänomen nennt man **Drift**: Eine Datei bekommt eine neue Eigenschaft, die in den anderen fehlt, eine Umbenennung an einer Stelle wird nicht überall nachgezogen, oder zwei Dateien definieren dieselbe Form leicht unterschiedlich. **Typ-Aliasse** lösen dieses Problem: Das Schlüsselwort `type` gibt einer Typdefinition einen Namen, sodass dieser überall verwendet werden kann, statt ihn zu wiederholen. Ein einmal definierter `Volunteer`-Typ wird zum einheitlichen Vertrag für dieses Objekt in der gesamten Codebasis.

Die meisten echten TypeScript-Dateien verwenden beides. Annotierungen legen an einer bestimmten Stelle im Code fest, was etwas ist. Aliasse machen diese Definition wiederverwendbar und benennbar. Beide arbeiten zusammen: Funktionsgrenzen und exportierte Werte werden mit den benannten Typen annotiert, die als Aliasse definiert wurden.

---

## Variablen-Annotierungen

Variablen-Annotierungen sind die direkteste Möglichkeit, eine Absicht zu deklarieren.

```typescript
let shelterName: string = "Sunflower Commons";
let adoptableCats: number = 7;
let hasCommunityGarden: boolean = true;
```

Jede Annotierung legt eine erlaubte Wertkategorie fest:

- `string` beschränkt `shelterName` auf Textwerte.
- `number` beschränkt `adoptableCats` auf numerische Werte.
- `boolean` beschränkt `hasCommunityGarden` auf `true` oder `false`.

Wird später ein Wert des falschen Typs zugewiesen, meldet der Compiler dies noch vor der Laufzeit.

```typescript
hasCommunityGarden = "ja"; // Fehler – es können nur boolesche Werte zugewiesen werden, keine Strings
```

Für jede primitive Wertkategorie gibt es einen Typ: `string`, `number`, `boolean`, `undefined` und `null`. Darüber hinaus stehen Sondertypen wie `never`, `unknown` und `any` zur Verfügung.

---

## Funktions-Signaturen

Funktions-Annotierungen definieren sowohl die erwarteten Typen der Parameter als auch den Rückgabetyp – dies ist womöglich das nützlichste Feature in TypeScript. Kein Rätseln mehr und kein erneutes Durchlesen von Implementierungen.

```typescript
function splitIceCreamCups(totalCups: number, teammates: number): number {
  return totalCups / teammates;
}
```

Diese Signatur kommuniziert drei explizite Einschränkungen:

- `totalCups` muss eine Zahl sein.
- `teammates` muss eine Zahl sein.
- Der Rückgabewert muss eine Zahl sein.

Sind diese Einschränkungen explizit, werden fehlerhafte Aufrufe und falsche Rückgabepfade frühzeitig erkannt.

---

## Aliasse – Wiederverwendbare Typen benennen

Typ-Aliasse ermöglichen es, häufig verwendeten Typen einen aussagekräftigen Namen zu geben. Sie funktionieren wie Variablen, aber für Typen statt für Werte.

```typescript
type VolunteerId = number;
type VolunteerName = string;

type Volunteer = {
  id: VolunteerId;
  name: VolunteerName;
  active: boolean;
};

const member: Volunteer = {
  id: 12,
  name: "Nora",
  active: true,
};

const incorrectMember: Volunteer = {
  id: "12",
  name: "Nora",
}; // Fehler – active fehlt
```

Jeder Alias kommuniziert eine Absicht:

- `VolunteerId` und `VolunteerName` dokumentieren die Bedeutung roher `number`- und `string`-Werte. Ohne den Alias kann ein Aufrufer einer Signatur wie `function find(id: number)` nicht erkennen, welche Art von Zahl erwartet wird.
- `Volunteer` zentralisiert die Objektform, sodass alle Dateien denselben Vertrag verwenden.
- Eine Änderung am gemeinsamen Typ verbreitet sich durch den Compiler – jede Verwendungsstelle, die nicht mehr übereinstimmt, wird gemeldet.

---

## Array-Annotierungen

Arrays sollten deklarieren, welche Elemente darin erlaubt sind. Dazu schreibt man den Typ der Elemente, gefolgt von eckigen Klammern.

```typescript
let snackBox: string[] = ["Pfefferminztee", "Haferkekse", "Apfelscheiben"];
let roster: Volunteer[] = [
  { id: 1, name: "Mina", active: true },
  { id: 2, name: "Nora", active: false },
];
```

- `snackBox` ist `string[]`, daher muss jeder Eintrag ein Textwert sein.
- `roster` ist `Volunteer[]`, daher muss jeder Eintrag die vollständige `Volunteer`-Form erfüllen.
- Ein Objekt, dem ein Pflichtfeld fehlt, oder ein primitiver Wert, wo ein `Volunteer` erwartet wird, wird von TypeScript abgelehnt.

---

## Ressourcen

- [TypeScript Handbuch – Alltägliche Typen](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbuch – Mehr über Funktionen](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript Handbuch – Typ-Aliasse](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)
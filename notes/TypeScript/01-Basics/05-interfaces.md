# TypeScript Grundlagen - Interfaces

Das Verständnis von Interfaces ist wichtig, weil sie ein spezifisches alltägliches Problem lösen: Objektverträge stabil zu halten, wenn Code über Dateien und Teammitglieder hinweg wandert. In kleinen Skripten kann man ein Objekt inline lesen und seine Form erahnen. In größeren Projekten bricht das schnell zusammen. Eine Funktion in einer Datei erwartet bestimmte Eigenschaften, eine andere Datei erstellt das Objekt, und eine dritte transformiert es. Ändert sich ein Eigenschaftsname oder fehlt ein erforderlicher Wert, kann der Fehler weit reisen, bevor ihn jemand bemerkt. Interfaces machen diesen Vertrag explizit. Sie beschreiben die erwartete Struktur eines Objekts einmalig, und TypeScript prüft dann jeden Verwendungspunkt gegen diese Struktur.

Das verbessert nicht nur die Korrektheit, sondern auch die Kommunikation. Wenn ein Junior-Entwickler `Volunteer` oder `CourseConfig` als Interface-Namen sieht, kann er das Modell schneller nachvollziehen, als wenn jede Funktion rohe Objektliterale wiederholt. Interfaces sind außerdem eine Grundlage für viele spätere TypeScript-Themen: Modelle erweitern, API-Antworten typisieren und Klassenverträge definieren.

Sie sind jedoch kein Ersatz für Objekt-Typ-Aliase. Ein praktisches Denkmodell ist folgendes: Typ-Aliase sind breit und flexibel für viele Typkonstruktionen, während Interfaces speziell für Objektverträge entwickelt wurden, die lesbar und konsistent bleiben sollen. Im Alltag hilft diese Unterscheidung dabei, das richtige Werkzeug zu wählen, ohne die Syntax zu überdenken. Geht es hauptsächlich darum, die Form gemeinsam genutzter Objekte zu beschreiben, sind Interfaces oft die klarste Option.

## Objektverträge definieren

Ein Interface deklariert, welche Eigenschaften ein Objekt bereitstellen muss und welchen Typ jede Eigenschaft hat.

```ts
interface Volunteer {
  id: number;
  name: string;
  active: boolean;
}

const member: Volunteer = {
  id: 12,
  name: "Nora",
  active: true,
};
```

- `Volunteer` ist der gemeinsame Vertrag für diese Objektform.
- Jede erforderliche Eigenschaft muss vorhanden sein und ihrem deklarierten Typ entsprechen.
- Objekte mit fehlenden Feldern oder falschen Typen werden vom Compiler abgelehnt.

## Optionale und schreibgeschützte Eigenschaften

Interfaces können flexible und unveränderliche Felder abbilden.

```ts
interface CourseConfig {
  title: string;
  durationWeeks: number;
  location?: string;
  readonly cohortCode: string;
}
```

- `location?` ist optional, Objekte können es angeben, müssen es aber nicht.
- `readonly cohortCode` kann beim Erstellen des Objekts gesetzt, aber danach nicht mehr neu zugewiesen werden.
- Dieses Muster ist nützlich für Werte, die nach der Initialisierung nie verändert werden sollen.

## Methoden in Interfaces

Interfaces können erforderliches Verhalten durch Methoden-Signaturen definieren. `complete` und `getCompletedCount` sind Methoden (Funktionen, die zum Objekt gehören) mit Parametern und Rückgabetypen.

```ts
interface ProgressTracker {
  complete(topic: string): void;
  getCompletedCount(): number;
}
```

- `complete` definiert eine Methode, die einen Themennamen entgegennimmt und nichts zurückgibt.
- `getCompletedCount` muss eine Zahl zurückgeben.
- Jedes Objekt oder jede Klasse, die dieses Interface implementiert, muss beide Methoden mit übereinstimmenden Signaturen bereitstellen.

## Interfaces erweitern

Mit `extends` lassen sich größere Verträge aus kleineren aufbauen.

```ts
interface Person {
  id: number;
  name: string;
}

interface Coach extends Person {
  specialty: string;
}
```

- `Coach` erbt `id` und `name` von `Person`.
- `Coach` fügt sein eigenes Pflichtfeld `specialty` hinzu.
- Das Erweitern hält gemeinsame Felder zentralisiert und reduziert Duplikate.

## Typ-Aliase vs. Interfaces

Beide Konstrukte können Objektformen beschreiben, und bei einfachen Objekten gibt es keinen offensichtlichen Unterschied.

```ts
type VolunteerAlias = {
  id: number;
  name: string;
};

interface VolunteerInterface {
  id: number;
  name: string;
}
```

Der Unterschied liegt darin, wofür jedes optimiert ist. `interface` verwendet man beim Arbeiten mit Klassen oder beim Beschreiben von Objektformen, die zwischen größeren Teilen der Anwendung stehen – insbesondere wenn Klassen sie mit `implements` umsetzen oder die Definition mit `extends` erweitert wird. Interfaces unterstützen außerdem Declaration Merging: Zwei Deklarationen desselben Namens im gleichen Gültigkeitsbereich werden automatisch zusammengeführt, was beim Erweitern von Drittanbieter-Typen nützlich ist.

`type` verwendet man beim Arbeiten mit Unions, Schnittmengen, Tupeln oder Aliasen für primitive Typen. Das sind Kompositionen, die Interfaces nicht ausdrücken können.

## Ressourcen

- [TypeScript Handbuch - Objekttypen](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbuch - Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)
- [TypeScript Handbuch - Alltagstypen](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
# TypeScript Grundlagen - TypeScript kompilieren

TypeScript hat einen wesentlichen Nachteil: Der Browser oder Node.js können deine `.ts`-Dateien nicht direkt ausführen, da Laufzeitumgebungen nur JavaScript verstehen, nicht TypeScript-Syntax. Stattdessen muss der TypeScript-Code zunächst in JavaScript umgewandelt werden. Dieser Vorgang wird vom sogenannten TypeScript-Compiler `tsc` durchgeführt. Während der Transpilierung prüft der Compiler die Typen, meldet Probleme und erstellt schließlich die JavaScript-Ausgabe. Typinformationen helfen während der Entwicklung, werden aber vor der Laufzeit entfernt – weshalb TypeScript stärkeres Feedback liefert, ohne dabei zusätzlichen Laufzeit-Overhead zu erzeugen.

Es gibt drei Kompilierungs-Workflows, die man von Anfang an kennen sollte. Der erste ist die Kompilierung einzelner Dateien, nützlich für schnelle Experimente und kleine Beispiele. Der zweite ist die projektweite Kompilierung mittels `tsconfig.json`, die in echten Projekten für Konsistenz sorgt. Der dritte ist der Watch-Modus, der manuelles Wiederholen überflüssig macht, indem er bei jedem Speichern neu kompiliert und so den Feedback-Zyklus während der Entwicklung kurz hält. Wer diese drei Workflows versteht, kann zuverlässig von TypeScript zu ausführbarem JavaScript wechseln und genau erklären, warum die Build-Ausgabe so aussieht wie sie aussieht.

## TypeScript-Toolchain

Installiere den Compiler, damit der Befehl `tsc` in deinem Terminal verfügbar ist:

```bash
npm install -g typescript
tsc -v
```

Der erste Befehl installiert den Compiler, der zweite überprüft, ob deine Umgebung ihn ausführen kann.

## Eine TypeScript-Datei kompilieren

Um eine ausführbare JavaScript-Datei zu erstellen, musst du deine TypeScript-Quelldatei in JavaScript kompilieren. Das Kommandozeilenwerkzeug `tsc` erledigt genau das:

```bash
tsc app.ts
node app.js
```

`tsc app.ts` erzeugt `app.js` neben der Quelldatei. Mit `node app.js` wird das kompilierte JavaScript ausgeführt.

Wenn du eine Datei direkt an `tsc` übergibst, wird eine eventuell vorhandene `tsconfig.json` im Projekt ignoriert (mehr zur tsconfig erfährst du im nächsten Kapitel). Es gelten die Standard-Compiler-Einstellungen, was bedeutet, dass strenge Prüfungen deaktiviert sind und die Modulbehandlung von deiner Projektkonfiguration abweichen kann. Für schnelle Wegwerfskripte ist das in Ordnung, aber Code, der innerhalb einer echten Projektstruktur laufen soll, sollte stattdessen die projektweite Kompilierung verwenden.

Gegeben diese Quelldatei:

```ts
// app.ts
const shelterName: string = "Sunflower Commons";
const catCount: number = 7;

function displayShelterInfo(shelterName: string, catCount: number): void {
  console.log(`${shelterName} has ${catCount} cats.`);
}
```

Gibt der Compiler dieses JavaScript aus:

```js
// app.js
const shelterName = "Sunflower Commons";
const catCount = 7;

function displayShelterInfo(shelterName, catCount) {
  console.log(`${shelterName} has ${catCount} cats.`);
}
```

Die Typannotationen werden vollständig entfernt. Die erzeugte Datei ist reines JavaScript ohne jede Spur von TypeScript-Syntax.

## Projektweite Kompilierung

In der Regel möchte man ein ganzes Projekt auf einmal kompilieren. Dazu verwendet man den `tsc`-Befehl zusammen mit einer `tsconfig.json`-Datei.

```bash
tsc
```

Das Ausführen von `tsc` ohne Argumente löst eine `tsconfig.json`-Suche aus. Der Compiler sucht vom aktuellen Verzeichnis aufwärts, bis er eine findet. Sobald er sie gefunden hat, liest er die Felder `include`, `exclude` und `compilerOptions`, um zu bestimmen, was wie kompiliert werden soll.

## Watch-Modus

Verwende den Watch-Modus für kontinuierliches Feedback während der Entwicklung:

```bash
tsc --watch
```

Du kannst auch das Kurzflag verwenden:

```bash
tsc -w
```

Der Watch-Modus hält den Compiler-Prozess am Laufen und überwacht das Dateisystem auf Änderungen an eingebundenen `.ts`-Dateien. Wird eine Änderung erkannt, wird nur das Betroffene neu kompiliert, anstatt das gesamte Projekt von Grund auf neu zu bauen. Typfehler werden direkt im Terminal ausgegeben, sobald sie auftreten – so erhältst du Feedback, ohne den Compiler nach jedem Speichern manuell neu starten zu müssen.

Dies ist der empfohlene Modus während der aktiven Entwicklung. Du lässt ihn in einem Terminal-Fenster laufen, und er meldet Probleme während du programmierst – damit wird der Kompilierungsschritt zu einer kontinuierlichen Hintergrundprüfung statt einem manuellen Zwischenschritt.

## Ressourcen

- [TypeScript Handbuch - Compiler-Optionen](https://www.typescriptlang.org/tsconfig)
- [TypeScript Handbuch - TypeScript Compiler](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
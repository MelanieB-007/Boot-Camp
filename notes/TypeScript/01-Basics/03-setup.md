# TypeScript Basics - Setup

Wenn Leute sagen, der Einstieg in TypeScript sei schwierig, reagieren sie meistens auf den Konfigurationsaufwand – nicht auf die Sprache selbst. Das Setup wirkt aufwendig, weil TypeScript verlangt, dass man explizit angibt, wie das Projekt kompiliert wird, wo die Quelldateien liegen und welche Standards eingehalten werden sollen. Das kann sich nach Mehrarbeit anfühlen, wenn man an einfaches JavaScript gewöhnt ist, wo man eine Datei erstellen und sofort ausführen kann. Der Vorteil ist, dass dieses einmalige Setup dem gesamten Team ein gemeinsames Verständnis dafür vermittelt, wie Code geschrieben und kompiliert wird. Anstatt dass jeder Entwickler das Build-Verhalten selbst herausfindet, legt das Projekt diese Regeln einmalig fest und der Compiler setzt sie konsequent durch.

Ein gutes Setup verfolgt zwei Ziele. 
- Erstens: den Compiler in jedem Projekt verfügbar und vorhersehbar machen. 
- Zweitens: sinnvolle Standardeinstellungen festlegen, damit Fehler früh erkannt werden. 

Die `tsconfig.json`-Datei in dieser Lektion ist die zentrale Wahrheitsquelle. Sie verwendet strenge Prüfungen, moderne Node-Modulauflösung sowie explizite Ein- und Ausgabeverzeichnisse. Diese Einstellungen reduzieren Mehrdeutigkeiten und machen die Build-Ausgabe leichter nachvollziehbar.

## Projektstruktur

Die Konfiguration dieser Lektion erwartet folgende Struktur:

```
project-root/
  src/
  dist/
  tsconfig.json
```

Der Ordner `src` enthält deine TypeScript-Dateien, der Ordner `dist` ist der Speicherort für die kompilierte Ausgabe.

## TypeScript-Konfiguration

Wie bereits erwähnt, sucht `tsc` ohne Argumente nach einer `tsconfig.json`-Datei im aktuellen Verzeichnis oder in einem übergeordneten Verzeichnis. Die Datei muss `tsconfig.json` heißen und legt fest, wie der Compiler dein Projekt kompilieren soll. Sie hat folgende Struktur:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",

    "target": "esnext",
    "module": "NodeNext",
    "lib": ["esnext"],
    "types": [],

    "strict": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Die wichtigsten Auswirkungen dieser Optionen:

- `rootDir` und `outDir` sorgen für eine saubere Trennung von Quell- und Build-Verzeichnis: TypeScript liest aus `src` und schreibt die kompilierte Ausgabe nach `dist`, sodass beide Verzeichnisbäume getrennt bleiben.
- `module` auf `NodeNext` gesetzt weist den Compiler an, dem modernen Node.js-Importverhalten zu folgen, bei dem Importe explizite Dateiendungen verwenden müssen und die Auflösung dem `exports`-Feld in `package.json` folgt.
- `lib` legt die verfügbaren Sprachfunktionen auf `esnext` fest, die neueste Version von ECMAScript. Diese Liste lässt sich später um `dom` erweitern, um Unterstützung für Browser-APIs hinzuzufügen.
- `target` definiert die Version des JavaScript-Outputs. Wir verwenden `esnext`, die neueste Version von ECMAScript.
- `types` definiert die Liste der einzubindenden Typpakete. Vorerst werden keine benötigt.
- `strict` aktiviert eine Gruppe von Prüfungen, die die häufigsten Typfehler abfangen, darunter implizites `any`, nicht geprüfte `null`- und `undefined`-Werte sowie unsichere Typzusicherungen.
- `esModuleInterop` ermöglicht die Verwendung von CommonJS-Paketen mit der Standard-`import x from "x"`-Syntax, anstatt `import * as x from "x"` zu erfordern.
- `skipLibCheck` überspringt die Typprüfung von `.d.ts`-Dateien in `node_modules`. Das beschleunigt die Kompilierung und vermeidet Fehler durch Typpakete mit kleineren internen Unstimmigkeiten.
- `resolveJsonModule` erlaubt es TypeScript, `.json`-Dateien direkt zu importieren, mit einem abgeleiteten Typ basierend auf der Dateistruktur.
- `sourceMap` erzeugt `.map`-Dateien neben der kompilierten Ausgabe. Diese verknüpfen das JavaScript mit dem ursprünglichen TypeScript-Quellcode, sodass Debugger und Stack-Traces auf die richtige Datei und Zeilennummer verweisen.

## Ressourcen

- [TypeScript Handbuch - TypeScript Tooling in 5 Minuten](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html)
- [TSConfig Referenz](https://www.typescriptlang.org/tsconfig)
# Backend-Grundlagen und Express – Express-Setup

Node.js wird mit einem integrierten `http`-Modul geliefert, das eingehende Anfragen verarbeiten und Antworten senden kann. Es funktioniert, aber sobald man mehr als einen einzelnen Endpunkt aufbaut, wird es schnell zur manuellen Arbeit: Man parst die URL, um die angeforderte Route zu ermitteln, prüft die HTTP-Methode mit einer `if`-Kette, liest den Request-Body als rohen Datenstrom und setzt Header von Hand. Der Code wächst schnell, und nichts davon hat mit dem zu tun, was die Anwendung eigentlich leisten soll.

Express ist ein Framework, das auf diesem `http`-Modul aufbaut. Es bietet eine strukturierte Möglichkeit, HTTP-Methoden und URL-Pfade Handler-Funktionen zuzuordnen, eingehende Daten über eine saubere API zu lesen und Antworten zu senden, ohne Header manuell zusammenzubauen. Wenn eine Anfrage eingeht, gleicht Express sie mit den definierten Routen ab und ruft den passenden Handler auf – dabei übergibt es ein Request-Objekt und ein Response-Objekt, die die benötigten Daten und Methoden bereitstellen.

Express unterstützt außerdem Middleware: Funktionen, die bei jeder Anfrage unabhängig von der Route ausgeführt werden. Middleware übernimmt Aufgaben, die routenübergreifend relevant sind, wie das Parsen von Request-Bodies, Logging und Authentifizierungsprüfung. Jede Funktion verarbeitet entweder die Anfrage oder gibt sie an die nächste Funktion in der Kette weiter.

Eine Besonderheit: Express ist in JavaScript geschrieben. Der Quellcode enthält keine Typannotationen, weshalb TypeScript nicht erkennen kann, was `express()` zurückgibt, welche Eigenschaften `req` und `res` haben oder welche Argumente `app.get()` erwartet. Ohne diese Informationen erscheint jeder Express-API-Aufruf als `any`, und der Compiler kann keine Fehler abfangen. Die Lösung ist ein Typdeklarationspaket, das TypeScript mitteilt, welche Typen eine JavaScript-Bibliothek verwendet – ohne selbst Laufzeitcode zu enthalten.

## Typdeklarationspakete

Die Installation von Express liefert die Laufzeitbibliothek. `@types/express` und `@types/node` stellen TypeScript die Typinformationen für Express sowie für eingebaute Node.js-Module wie `http`, `fs` und `path` bereit:

```bash
npm install express
npm install --save-dev typescript @types/express @types/node
```

- `express` ist eine reguläre Abhängigkeit, da der Server sie zur Laufzeit benötigt
- `typescript` ist der Compiler und wird nur während der Entwicklung benötigt
- `@types/express` und `@types/node` sind ebenfalls nur für die Entwicklung gedacht; sie werden für die Typprüfung und Editor-Unterstützung verwendet, sind aber nicht im kompilierten Ausgabecode enthalten

TypeScript löst Typen aus `node_modules/@types/` automatisch auf. Nach der Installation weiß der Compiler, dass `express()` eine `Application` zurückgibt, dass `app.get()` einen Pfad und einen Handler erwartet und dass der `req`-Parameter des Handlers ein `Request` mit Eigenschaften wie `params`, `query` und `body` ist.

Nicht jedes Paket benötigt eine separate `@types`-Installation. Manche Bibliotheken liefern eigene Typdeklarationen mit. Prüfe, ob die `package.json` der Bibliothek ein `"types"`-Feld enthält – falls ja, ist keine separate Installation nötig.

## Projektstruktur

Express-Projekte trennen üblicherweise Quelldateien von der Build-Ausgabe:

```
project/
  src/
    index.ts
  dist/           (in .gitignore)
  node_modules/   (in .gitignore)
  .gitignore
  package.json
  tsconfig.json
```

Das Verzeichnis `src/` enthält alle TypeScript-Quelldateien. Das Verzeichnis `dist/` wird vom TypeScript-Compiler erstellt und enthält die JavaScript-Ausgabe. Sowohl `dist/` als auch `node_modules/` gehören in die `.gitignore`, da sie generiert werden. Wer das Projekt klont, kann sie durch `npm install` und `npm run build` neu erstellen.

Zwei Scripts in der `package.json` übernehmen das Bauen und Starten des Servers:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- `build` führt den TypeScript-Compiler aus, der `tsconfig.json` liest und JavaScript nach `dist/` schreibt
- `start` führt die kompilierte Ausgabe mit Node.js aus

Während der Entwicklung umgeht `tsx` diesen Build-Schritt, indem TypeScript direkt im Speicher transpiliert wird. Die `build`- und `start`-Scripts sind für Produktions-Deployments gedacht, bei denen ein sauberer Compile-Schritt und ein einfacher Node.js-Prozess gewünscht sind.

## Das App-Objekt

Der Aufruf von `express()` erstellt eine Anwendungsinstanz. Über dieses Objekt werden Route-Handler, Middleware und die Server-Konfiguration registriert.

```typescript
import express from "express";

const app = express();
```

Allein für sich tut `app` nichts. Es wird erst zu einem funktionierenden Server, wenn mindestens eine Route definiert ist und es auf eingehende Verbindungen lauscht.

## Auf Verbindungen lauschen

`app.listen()` bindet die Anwendung an einen Port und beginnt, eingehende Verbindungen anzunehmen. Das erste Argument ist die Port-Nummer; das zweite ist ein optionaler Callback, der ausgeführt wird, sobald der Server bereit ist.

```typescript
const port = 3000;

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});
```

Ein Port ist eine Zahl, die einen bestimmten Prozess auf einem Rechner identifiziert. Port 3000 ist während der Entwicklung eine gängige Wahl, da er keine besonderen Berechtigungen erfordert und selten mit anderen Diensten in Konflikt gerät. Der Callback ist nicht erforderlich, aber ohne ihn gibt es keine Bestätigung, dass der Server tatsächlich gestartet ist.

## Ein minimaler Express-Server

Das App-Objekt, eine einzelne Route und `app.listen()` zusammen ergeben einen funktionierenden Server:

```typescript
import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});
```

`app.get()` registriert einen Handler für GET-Anfragen an den Pfad `/`. Wenn eine Anfrage eingeht, gleicht Express Methode und Pfad ab und ruft den Handler mit zwei Argumenten auf:

- `req` ist das Request-Objekt: Es enthält die eingehende URL, Header und alle vom Client gesendeten Daten
- `res` ist das Response-Objekt: `res.send()` sendet eine Klartext-Antwort und setzt die entsprechenden Header automatisch

Das Ausführen dieser Datei mit `tsx src/index.ts` startet den Server. Eine GET-Anfrage an `http://localhost:3000` gibt „Hello World" zurück.

## Ressourcen

- [Offizielle Express.js-Dokumentation](https://expressjs.com/)
- [Node.js http-Modul-Dokumentation](https://nodejs.org/api/http.html)
- [DefinitelyTyped-Repository](https://github.com/DefinitelyTyped/DefinitelyTyped)
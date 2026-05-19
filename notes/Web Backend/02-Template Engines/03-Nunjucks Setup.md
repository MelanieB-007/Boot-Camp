# Backend Template-Engines – Nunjucks-Setup

Die Arbeit mit `.njk`-Template-Dateien in einer normalen Entwicklungsumgebung offenbart sofort zwei kleine Lücken. VS Code behandelt `.njk`-Dateien standardmäßig als Klartext – ohne Syntax-Highlighting für Nunjucks-Ausdrücke oder Tags, was Templates schwer lesbar macht. Prettier, das in den meisten Node.js-Projekten die Formatierung übernimmt, hat ebenfalls keinen eingebauten Parser für Nunjucks-Templates. Ohne einen solchen überspringt es `.njk`-Dateien entweder oder zerstört die Syntax, wenn es sie als reines HTML behandelt.

Vor diesem Hintergrund ist der erste Schritt die Integration von Nunjucks in Express.

## Express-Konfiguration

Nunjucks als Abhängigkeit installieren:

```bash
npm install nunjucks
npm install --save-dev @types/nunjucks
```

Dann `nunjucks.configure()` vor den Routen aufrufen:

```typescript
import express from "express";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});
```

Hier werden zwei Optionen gesetzt:

- `autoescape: true` — Nunjucks maskiert HTML-Zeichen in Variablen, bevor sie gerendert werden. Das verhindert, dass vom Nutzer bereitgestellte Strings HTML in die Seite einschleusen.
- `express: app` — registriert Nunjucks als Template-Engine für die Express-App, sodass `res.render()` weiß, dass es Nunjucks verwenden soll.

Damit ist alles bereit: Template-Dateien kommen einfach in das Verzeichnis `views/`. Eine einfache Route sieht dann so aus:

```typescript
app.get("/", (req, res) => {
  res.render("index.html", { title: "Home" });
});
```

`index.html` ist der Name der Template-Datei, und `title` ist eine Variable, die an das Template übergeben wird.

## Syntax-Highlighting in VS Code

Die Erweiterung **Better Nunjucks** fügt Syntax-Highlighting für `.html`- und `.njk`-Dateien in VS Code hinzu, einschließlich Ausdrücken (`{{ }}`), Tags (`{% %}`) und Kommentaren (`{# #}`). Sie kann über den VS Code Marketplace installiert werden.

## Prettier-Konfiguration

Das Paket `prettier-plugin-jinja-template` fügt Prettier einen Nunjucks-fähigen Parser hinzu. Es wird zusammen mit Prettier installiert:

```bash
npm install --save-dev prettier prettier-plugin-jinja-template
```

Dann eine `.prettierrc`-Datei im Projektstamm anlegen:

```json
{
  "plugins": ["prettier-plugin-jinja-template"],
  "overrides": [
    {
      "files": ["*.html"],
      "options": {
        "parser": "jinja-template"
      }
    }
  ]
}
```

Hier werden drei Dinge konfiguriert:

- `"plugins"` registriert das jinja-template-Plugin bei Prettier
- `"overrides"` wendet eine benutzerdefinierte Einstellung auf ein bestimmtes Datei-Muster an
- `"parser": "jinja-template"` weist Prettier an, den Jinja/Nunjucks-fähigen Parser für `.html`-Dateien zu verwenden

## Ressourcen

- [Nunjucks Getting-Started-Guide](https://mozilla.github.io/nunjucks/getting-started.html)
- [Better Nunjucks-Erweiterung](https://marketplace.visualstudio.com/items?itemName=ginfuru.better-nunjucks)
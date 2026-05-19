# TypeScript Client-seitig – Server vs. Client

Wenn du TypeScript im Terminal ausführst, stellt Node.js die Laufzeitumgebung bereit. Node hat Zugriff auf das Dateisystem, Netzwerk-Sockets und Systemprozesse – aber es hat kein DOM. Das Document Object Model existiert ausschließlich im Webbrowser. Wenn Code `document.getElementById()` aufruft oder auf `window` zugreift, verlässt er sich auf Objekte, die der Browser beim Parsen einer HTML-Seite erstellt. Diese Objekte existieren in Node.js nicht.

Dieser Unterschied wird relevant, sobald du TypeScript für einen Browser schreibst. `node` würde zur Laufzeit einen `ReferenceError` werfen, sobald es auf `document` trifft, da es dieses Global nicht kennt. Auch wenn der TypeScript-Compiler es nicht sofort abfängt, wird der Code beim Ausführen fehlschlagen. Für Browser-Code ist der richtige Ansatz, TypeScript mit `tsc` in JavaScript zu kompilieren und die resultierende Datei über ein `<script>`-Tag in einer HTML-Seite zu laden.

## Die Browser-Laufzeitumgebung

Node.js und der Browser sind unterschiedliche JavaScript-Laufzeitumgebungen. Beide führen JavaScript aus, stellen aber jeweils andere Globals bereit. Node stellt `process`, `Buffer` und das Dateisystem-Modul zur Verfügung. Der Browser stellt `window`, `document` und `localStorage` bereit.

TypeScript enthält standardmäßig keine Typdefinitionen für DOM-APIs. Wenn du versuchst, `document` zu verwenden, ohne dem Compiler mitzuteilen, dass du auf einen Browser abzielst, meldet TypeScript: „Cannot find name 'document'". Du musst die Typdefinitionen explizit aktivieren.

## `tsconfig.json` für Browser-Umgebungen

Das Feld `compilerOptions` in `tsconfig.json` steuert, welche Umgebung TypeScript erwartet und welches JavaScript es erzeugt. Für Browser-Code sind drei Optionen relevant:

- **`lib`** listet auf, welche eingebauten Typdefinitionen der Compiler lädt. Das Hinzufügen von `"dom"` schließt alle Browser-API-Typen ein – `document`, `window`, `HTMLElement` und andere Browser-Globals. Ohne diese Option weiß TypeScript nicht, dass diese Globals existieren.
- **`target`** legt die JavaScript-Version fest, die der Compiler ausgibt. `"ESNext"` behält moderne Syntax wie `async/await` und Optional Chaining bei, ohne sie herunterzukompilieren.
- **`module`** steuert die Modulsyntax in der Ausgabe. `"ESNext"` erzeugt `import`/`export`-Anweisungen, die Browser und moderne Bundler nativ verstehen.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["dom", "esnext"]
  }
}
```

Mit dieser Konfiguration kompiliert `tsc` dein TypeScript in `dist/`. Diese Dateien referenzierst du dann über ein `<script>`-Tag in deinem HTML. Achte darauf, dem `<script>`-Tag `type="module"` hinzuzufügen, damit der Browser `import`- und `export`-Anweisungen verarbeiten kann.

```html
<html lang="en">
  <head>
    <!-- ... -->
    <script type="module" src="/dist/main.js"></script>
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

## Ressourcen

- [TypeScript tsconfig-Referenz](https://www.typescriptlang.org/tsconfig)
- [MDN: Document Object Model](https://developer.mozilla.org/de/docs/Web/API/Document_Object_Model)
# Nodemon

Node.js (Versionen < 25.9) kann nur JavaScript ausführen. Wenn du TypeScript schreibst, muss es zunächst in JavaScript kompiliert werden, bevor Node es ausführen kann. `nodemon` (Node Monitor) löst das Problem auf der Entwicklungsseite: Es überwacht deine Projektdateien und startet den Node-Prozess neu, sobald eine überwachte Datei geändert wird. Ohne `nodemon` musst du den Server nach jeder Änderung manuell stoppen und neu starten.

Da `nodemon` Node neu startet, muss es die kompilierten JavaScript-Ausgaben in `dist/` überwachen – nicht den TypeScript-Quellcode. Dabei laufen zwei Prozesse gleichzeitig: `tsc --watch` kompiliert Änderungen aus `src/` nach `dist/`, und `nodemon` erkennt diese `.js`-Änderungen und startet Node neu.

---

## TypeScript-Konfiguration

`tsconfig.json` muss so konfiguriert sein, dass der Compiler seine Ausgabe in ein bekanntes Verzeichnis schreibt:

- `outDir` legt fest, wohin die kompilierten `.js`-Dateien geschrieben werden
- `rootDir` teilt dem Compiler mit, wo sich der TypeScript-Quellcode befindet
- `esModuleInterop` erlaubt den Import von Paketen mit der standardmäßigen `import x from 'x'`-Syntax, auch wenn das Paket in einem älteren Modulformat geschrieben wurde

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true
  }
}
```

`nodemon.json` steuert, was `nodemon` überwacht und welcher Befehl bei jedem Neustart ausgeführt wird. Wenn du `nodemon` ohne Argumente ausführst, liest es diese Konfigurationsdatei automatisch:

- `watch` verweist auf das kompilierte Ausgabeverzeichnis
- `ext` schränkt Neustarts auf Änderungen an `.js`-Dateien ein
- `exec` definiert den Befehl, den nodemon bei jedem Neustart ausführt

```json
{
  "watch": ["dist"],
  "exec": "node dist/index.js",
  "ext": "js"
}
```

Wenn beide Konfigurationsdateien vorhanden sind, führe zwei Prozesse aus:

```bash
tsc --watch   # Terminal 1: überwacht src/, gibt Ausgabe nach dist/ aus
nodemon       # Terminal 2: überwacht dist/, startet Node neu
```

---

## Ressourcen

- [nodemon Dokumentation](https://nodemon.io)
# Nodemon und tsx

`tsx watch` deckt die meisten Entwicklungsworkflows ab. Nodemon wird ergänzt, wenn Dateien überwacht werden müssen, die `tsx` standardmäßig ignoriert. `.env`-Dateien speichern Umgebungsvariablen wie API-Schlüssel und Ports – ein Server muss oft neu gestartet werden, wenn sich diese ändern. Nodemon erlaubt außerdem, bestimmte Pfade vom Auslösen von Neustarts auszuschließen oder benutzerdefinierte Skripte beim Neustart des Servers auszuführen. In diesem Setup übernimmt Nodemon die Dateiüberwachung und ruft `tsx` bei jedem Neustart zur Codeausführung auf. Installiere beide mit `npm install --save-dev tsx nodemon`.

---

## nodemon.json-Konfiguration

Jede Eigenschaft in `nodemon.json` steuert einen anderen Aspekt des Dateiüberwachungsverhaltens:

- `watch` listet die zu überwachenden Verzeichnisse und Dateien auf; durch Aufnahme von `.env` löst eine Änderung der Umgebungsvariablen einen Neustart aus – etwas, das `tsx watch` allein nicht erkennen würde
- `ext` definiert die Dateiendungen, die als Änderung gewertet werden
- `ignore` verhindert, dass Testdateien während der Entwicklung unnötige Neustarts auslösen
- `exec` ersetzt Nodemns Standard-Runner `node` durch `tsx`, sodass jeder Neustart die TypeScript-Einstiegsdatei direkt ausführt – ohne separaten Kompilierschritt

```json
// nodemon.json
{
  "watch": ["src", ".env"],
  "ext": "ts,json,env",
  "ignore": ["src/**/*.test.ts"],
  "exec": "tsx src/index.ts"
}
```

Das `dev`-Skript in `package.json` bleibt minimal. Nodemon liest die Konfigurationsdatei automatisch:

```json
// package.json
{
  "scripts": {
    "dev": "nodemon"
  }
}
```

---

## Erweiterte Nodemon-Optionen

| Option | Zweck |
|--------|-------|
| `watch` | Verzeichnisse und Dateien, die überwacht werden sollen, einschließlich Nicht-TS-Dateien wie `.env` |
| `ext` | Dateiendungen, die einen Neustart auslösen |
| `ignore` | Auszuschließende Pfade, z. B. Testdateien oder Build-Ausgaben |
| `exec` | Der Befehl, den Nodemon bei jedem Neustart ausführt |

---

## Ressourcen

- [Nodemon Konfigurationsoptionen](https://github.com/remy/nodemon#config-files)
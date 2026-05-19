# tsx

`tsx` kombiniert, was `tsc --watch` und `nodemon` getrennt tun, in einem einzigen Befehl. Die Transpilierung – der Prozess, TypeScript in JavaScript umzuwandeln, das Node.js ausführen kann – findet innerhalb von `tsx` statt, ohne dabei Dateien auf die Festplatte zu schreiben. Das Ergebnis wird direkt an Node.js übergeben. Kein `dist`-Ordner, kein zweiter Prozess, kein `concurrently` nötig.

---

## Vergleich: tsc + nodemon vs. tsx

| | **tsc + nodemon** | **tsx watch** |
|---|---|---|
| **Prozesse** | Zwei (Compiler + Server) | Einer |
| **Kompilierungsausgabe** | Auf die Festplatte geschrieben | Im Arbeitsspeicher |
| **Geschwindigkeit** | Langsamer (Festplatten-I/O) | Schneller (Esbuild) |
| **Modulbehandlung** | Manuelle CommonJS/ES-Modul-Konfiguration | Automatisch gehandhabt |

---

## tsx-Konfiguration

Installiere `tsx` als Dev-Abhängigkeit mit `npm install --save-dev tsx` und ersetze dann das Multi-Skript-Dev-Setup durch einen einzigen Eintrag in `package.json`.

Die zwei Skripte sind bewusst getrennt, da `tsx` die Typanalyse überspringt, um schnell zu bleiben:

- `start:dev` führt `tsx watch` gegen die Einstiegsdatei aus, überwacht das Quellverzeichnis und startet den Prozess bei jedem Speichern neu
- `typecheck` führt `tsc` mit `--noEmit` aus, was eine vollständige Typprüfung durchführt, ohne Ausgabedateien zu schreiben. Typfehler erscheinen während `start:dev` nicht, es sei denn, du führst dieses Skript parallel dazu aus

```json
{
  "scripts": {
    "start:dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit --watch"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  }
}
```

---

## Esbuild und In-Memory-Transpilierung

`tsx` verwendet intern Esbuild. Esbuild ist in Go geschrieben und konzentriert sich ausschließlich auf die Transpilierung, nicht auf die Typanalyse. Das Entfernen von TypeScript-Typen ist schnell; eine vollständige Typprüfung ist langsam. Da Esbuild nur ersteres durchführt, verarbeitet es Dateien deutlich schneller als `tsc`.

Anstatt das kompilierte JavaScript in deinem Projektordner zu speichern, hält `tsx` es vorübergehend im Arbeitsspeicher und übergibt es direkt an die Node.js-Laufzeitumgebung. Dadurch entfällt der Schritt des Lesens und Schreibens von Dateien auf die Festplatte – genau das ist es, was Neustarts mit `tsc + nodemon` träge wirken lässt.

---

## tsx und clientseitiger Code

Da `tsx` auf `node` aufbaut, kann es nicht zur Kompilierung von clientseitigem Code verwendet werden. `tsx` ist ausschließlich für die Ausführung von serverseitigem Code ausgelegt. TypeScript-Code für die Clientseite muss auf dem herkömmlichen Weg kompiliert werden – mit `tsc` und `nodemon`.

---

## Ressourcen

- [tsx auf GitHub](https://github.com/privatenumber/tsx)
- [Esbuild Dokumentation](https://esbuild.github.io)
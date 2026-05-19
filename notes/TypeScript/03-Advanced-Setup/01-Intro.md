# Übersicht

Node.js (Versionen < 25.9) kann nativ nur JavaScript ausführen. TypeScript muss zuerst in JavaScript kompiliert werden, was bedeutet, dass jedes TypeScript-Projekt einen Build-Schritt benötigt, bevor es ausgeführt werden kann. Während der Entwicklung muss dieser Build-Schritt zudem bei jeder gespeicherten Änderung erneut ausgeführt und der Server neu gestartet werden, um die Änderungen zu übernehmen. Dies nach jeder Bearbeitung manuell zu tun, wird schnell mühsam. Diese Sitzung behandelt die Werkzeuge, die diesen Prozess automatisieren, und wie sie zusammenhängen.

## Die Ausgangslage: nodemon
Der Ausgangspunkt ist **nodemon**. Es überwacht Ihre Projektdateien und startet den Server immer dann neu, wenn sich etwas ändert. Um es mit TypeScript zu verwenden, müssen zwei Prozesse gleichzeitig laufen: Der TypeScript-Compiler (`tsc --watch`) gibt JavaScript in einen `dist`-Ordner aus, und nodemon überwacht diesen Ordner und startet den Server neu, sobald neues JavaScript erscheint. Das funktioniert zwar, aber die Verwaltung von zwei Terminals ist umständlich. **concurrently** löst dies, indem es Ihnen ermöglicht, beide Prozesse über einen einzigen npm-Befehl auszuführen.

## Die moderne Alternative: tsx
**tsx** ist die moderne Alternative zu diesem gesamten Setup. Es verwendet Esbuild, um TypeScript im Arbeitsspeicher zu transpilieren und den Prozess direkt neu zu starten, ohne JavaScript auf die Festplatte zu schreiben. Das Ergebnis sind weniger bewegliche Teile und spürbar schnellere Neustarts. Für die meisten Projekte ist `tsx watch` völlig ausreichend.

## Die Kombination: nodemon + tsx
Der Grund, nodemon wieder zusammen mit tsx einzusetzen, ist spezifisch: das Überwachen von Dateien, die tsx standardmäßig ignoriert, das Ausschließen von Pfaden von Neustart-Triggern oder das Ausführen benutzerdefinierter Skripte beim Server-Neustart. In diesen Fällen konfigurieren Sie nodemon so, dass es tsx als Executor aufruft und nodemon die Dateiüberwachung übernimmt.

## Fazit
Zu verstehen, wann welches Werkzeug eingesetzt wird, ist wichtig, da Sie in echten Codebasen auf alle drei Muster stoßen werden:
* **Ältere Projekte:** Nutzen oft `tsc` + `nodemon` + `concurrently`.
* **Neue Projekte:** Nutzen standardmäßig meist `tsx`.
* **Kombiniertes Setup (nodemon + tsx):** Tritt auf, wenn ein Projekt nicht standardmäßige Anforderungen an die Dateiüberwachung hat.
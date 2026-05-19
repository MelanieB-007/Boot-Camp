# Überblick

Browser-APIs wurden nicht mit TypeScript im Hinterkopf entwickelt. `document.getElementById()` gibt `HTMLElement | null` zurück, weil TypeScript zur Kompilierzeit nicht wissen kann, ob das Element in deinem HTML ein Input-Feld, ein Button oder ein `div` ist. Dasselbe gilt für Event-Handler, bei denen das Event-Objekt ein generisches `Event` ist, sowie für die Fetch-API, bei der `response.json()` untypisierte Daten zurückliefert.

Diese Einheit behandelt die Techniken, die benötigt werden, um mit diesen Grenzbereichen sicher umzugehen. Du lernst, wie du den fehlenden Kontext explizit bereitstellen kannst – entweder wenn TypeScripts eingebaute Inferenz zu allgemein ist oder wenn TypeScript die genaue Form deiner Daten zur Laufzeit schlicht nicht kennen kann.
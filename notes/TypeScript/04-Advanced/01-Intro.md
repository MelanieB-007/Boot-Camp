# TypeScript – Fortgeschrittene Typen

## Überblick

Die Grundlagensitzung hat die wichtigsten Bausteine behandelt: Typannotationen, Typ-Aliase, Unions und Interfaces. Diese Werkzeuge reichen aus, um ein kleines Projekt zu typisieren. Doch sobald eine Codebasis wächst, beginnen sich Muster zu wiederholen.

Eine API-Antwort enthält immer einen Statuscode, eine Nachricht und eine Datennutzlast – doch die Form dieser Nutzlast variiert von Endpunkt zu Endpunkt. Eine in der Datenbank gespeicherte Entität besitzt eine `id` und Zeitstempel, die in einer Erstellungsanfrage niemals auftauchen sollten. Ein Suchergebnis benötigt nur drei der sieben Felder einer Entität.

Für jede Variante ein eigenes Interface zu schreiben funktioniert zunächst, führt aber zu duplizierten Definitionen, die auseinanderdriften, sobald der Basistyp geändert wird.

---

## Inhalt dieser Sitzung

Diese Sitzung stellt vier Konzepte vor, die diese Probleme lösen:

| Konzept | Beschreibung |
|---|---|
| **Intersection Types** | Zusammensetzen eines komplexen Typs aus kleineren, wiederverwendbaren Bausteinen |
| **Tuples** | Arrays, bei denen jede Position einen bekannten Typ hat |
| **Generics** | Ein einzelnes Interface oder eine Funktion, die sich an den übergebenen Typ anpasst |
| **Utility Types** | Eingebaute Generics, die bestehende Typen transformieren |

### Utility Types im Überblick

- **Optional machen** – Eigenschaften als optional kennzeichnen
- **Teilmenge auswählen** – nur bestimmte Felder übernehmen (`Pick`)
- **Felder ausschließen** – automatisch generierte Felder entfernen (`Omit`)
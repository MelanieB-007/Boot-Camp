# NestJS Basics 2 – Aufgabe: Cyber Chat

Baue die Grundlage einer Thread-basierten Diskussions-App mit NestJS-Modulen, Controllern, Services und Providern. Die App ist ausschließlich über eine API nutzbar – ein Frontend muss nicht gebaut werden. Die Daten werden vorerst im Arbeitsspeicher gehalten.

## Datenmodell

```typescript
type Thread = {
  id: number;
  title: string;
  author: string;
  body: string;
  createdAt: Date;
};

type Comment = {
  id: number;
  author: string;
  body: string;
  createdAt: Date;
};
```

## Module

Erstelle `ThreadsModule` und `CommentsModule` und importiere beide in das `AppModule`.

## Provider

Baue `ThreadsRepository` und `CommentsRepository` als injizierbare Provider. Speichere die Daten im Arbeitsspeicher mit `Map<string, Thread>` bzw. `Map<string, Comment>`.

Baue `ThreadsService` und `CommentsService`, die jeweils über Constructor Injection von ihrem Repository abhängen.

## Controller

| Methode  | Route                      | Zweck                                                                          |
| -------- | -------------------------- | ------------------------------------------------------------------------------ |
| `POST`   | `/threads`                 | Erstellt einen Thread mit `title` und `body`                                   |
| `GET`    | `/threads`                 | Gibt alle Threads zurück                                                       |
| `GET`    | `/threads/:id`             | Gibt einen einzelnen Thread inklusive seiner Kommentare zurück                 |
| `POST`   | `/threads/:id/comments`    | Fügt einem Thread einen Kommentar hinzu                                        |
| `DELETE` | `/threads/:id`             | Löscht den Thread und alle zugehörigen Kommentare (Kommentare werden wirklich gelöscht) |
| `GET`    | `/comments/:id`            | Gibt einen einzelnen Kommentar zurück                                          |
| `DELETE` | `/comments/:id`            | Sonderfall: Löscht den Kommentar nicht, sondern setzt seinen `body` auf `"deleted"` |

## Bonusaufgabe

Wirf eine korrekte `NotFoundException`, wenn ein angefragter Thread nicht existiert.
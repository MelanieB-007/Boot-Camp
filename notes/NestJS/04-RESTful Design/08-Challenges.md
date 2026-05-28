# NestJS RESTful Design – Aufgaben

## Cyber Chat spricht REST

Cyber Chat speichert nun in SQLite, aber die API-Oberfläche ist noch rau. Die Handler akzeptieren alles, was der Client ihnen schickt. Die Antworten liefern rohe TypeORM-Entities – das bedeutet, jede Spalte, die du morgen zur Datenbank hinzufügst, wird heute Teil des öffentlichen Vertrags. Und `GET /threads` gibt die gesamte Tabelle in einer einzigen Antwort zurück, was funktioniert, bis die Datenbank mehr als ein paar Hundert Zeilen enthält.

In dieser Aufgabe wirst du Cyber Chat mit allem absichern, was in dieser Einheit behandelt wurde: eine typisierte Request-Grenze mit DTOs und `ValidationPipe`, eine explizite Response-Grenze mit Response-DTOs und `ClassSerializerInterceptor`, korrekte Statuscodes und Paginierung für die Thread-Liste.

### 1 Die Request-Grenze

- Erstelle `CreateThreadDto` und `UpdateThreadDto` in `threads/dto/`. Das Create-DTO soll `title`, `body` und `author` erfordern, jeweils mit sinnvollen `class-validator`-Regeln und Längenbeschränkungen. Das Update-DTO soll `PartialType(CreateThreadDto)` aus `@nestjs/mapped-types` erweitern.
- Erstelle `CreateCommentDto` in `comments/dto/` mit `body` und `author`. Die Thread-ID kommt aus der URL, nicht aus dem Body.
- Registriere eine globale `ValidationPipe` in `main.ts` mit aktiviertem `whitelist`, `forbidNonWhitelisted`, `transform` und `transformOptions.enableImplicitConversion`.
- Aktualisiere jede Controller-Methode, die einen Body akzeptiert, sodass sie das typisierte DTO statt `any` oder einem einfachen Objekt verwendet.
- Füge eine `PATCH /threads/:id`-Route hinzu, damit Threads aktualisiert werden können, ohne die vollständige Repräsentation zu senden.

### 2 Die Response-Grenze

- Erstelle `ThreadResponseDto` und `CommentResponseDto`. Markiere jedes bereitgestellte Feld mit `@Expose()`. Verwende `@Type(() => Date)` auf dem `createdAt`-Feld, damit es als echtes `Date` serialisiert wird.
- Registriere `ClassSerializerInterceptor` global in `main.ts` mit `excludeExtraneousValues: true`.
- Aktualisiere die Services, sodass TypeORM-Entities vor der Rückgabe mit `plainToInstance` auf Response-DTOs gemappt werden. Keine Service-Methode sollte eine rohe Entity zurückgeben.
- Bestätige, dass das Hinzufügen einer neuen Spalte zur `Thread`-Entity die API-Antwort nicht verändert. Die neue Spalte soll für Clients unsichtbar bleiben, bis sie explizit in das Response-DTO aufgenommen wird.

### 3 Statuscodes und Ausnahmen

- Ersetze jedes manuelle Hantieren mit Statuscodes durch NestJS-Ausnahmen: `NotFoundException` für fehlende Threads oder Kommentare, `BadRequestException` wo die Anfrage selbst fehlerhaft ist, über das hinaus, was `ValidationPipe` abfängt.
- Dekoriere die DELETE-Handler mit `@HttpCode(HttpStatus.NO_CONTENT)`, damit ein erfolgreiches Löschen `204` ohne Body zurückgibt.
- Bestätige, dass `POST /threads` und `POST /threads/:id/comments` den Code `201 Created` zurückgeben. Bestätige, dass `GET /threads/:id` den Code `200 OK` zurückgibt.
- Wende `ParseUUIDPipe` auf jeden `:id`-Pfadparameter beider Controller an. Eine Anfrage an `GET /threads/keine-uuid` soll `400 Bad Request` zurückgeben, bevor der Handler läuft.

### 4 Paginierte Thread-Liste

- Erstelle `PaginationQueryDto` an einem gemeinsamen Ort mit `page` (Standard 1, Minimum 1) und `limit` (Standard 10, Minimum 1, Maximum 100). Beide müssen positive Integer sein. Verwende `@Type(() => Number)`, damit die String-Werte aus der URL konvertiert werden.
- Aktualisiere `GET /threads`, sodass das DTO über `@Query()` akzeptiert wird.
- Aktualisiere `ThreadsService.findAll`, sodass `{ data, meta: { page, limit, total, totalPages } }` mit `findAndCount` zurückgegeben wird. Mappe die Zeilen mit `plainToInstance(ThreadResponseDto, ...)`, bevor sie den Service verlassen.
- Vergewissere dich, dass die Antwortform konsistent bleibt, egal ob der Client Paginierungsparameter übergibt oder nicht.

---

## Abnahmekriterien

- **Whitelist-Durchsetzung.** Ein `POST /threads` mit einem unbekannten Feld (z. B. `{ "title": "t", "body": "b", "author": "a", "extra": "x" }`) gibt `400 Bad Request` zurück und listet `extra` als unerwartete Property auf.
- **Pflichtfeld-Validierung.** Ein `POST /threads`, dem ein Pflichtfeld fehlt, gibt `400 Bad Request` zurück, mit den fehlgeschlagenen Regeln im `message`-Array des Response-Bodys.
- **Paginierte Liste.** `GET /threads` gibt `{ data, meta }` zurück. `GET /threads?page=2&limit=5` gibt die zweite Seite mit fünf Threads zurück, wobei `meta.total` die vollständige Zeilenanzahl widerspiegelt und `meta.totalPages` daraus berechnet wird.
- **UUID-Validierung.** `GET /threads/keine-uuid` gibt `400 Bad Request` durch `ParseUUIDPipe` zurück. Eine gültige, aber nicht existierende UUID gibt `404 Not Found` mit dem Standard-NestJS-Fehlerbody zurück.
- **Erfolgreiches Löschen.** `DELETE /threads/:id` gibt `204 No Content` mit leerem Body zurück. Der Thread und alle zugehörigen Kommentare werden aus der Datenbank entfernt.
- **Keine Entity-Lecks.** Das Hinzufügen einer Spalte zur `Thread`-Entity (z. B. ein temporäres `internalNotes`-Textfeld) erscheint in keiner API-Antwort, bis das Response-DTO aktualisiert wird, um es bereitzustellen.

---

## Bonus

- Sortiere Threads standardmäßig absteigend nach `createdAt`. Akzeptiere `?sort=-createdAt` oder `?sort=createdAt` am Listen-Endpunkt, um die Reihenfolge umzukehren. Lehne jeden anderen Sortierwert mit einem `400` ab.
- Filtere Threads nach Autor mit `?author=<name>` am Listen-Endpunkt. Kombiniere den Filter mit der Paginierung, sodass `?author=ada&page=2` wie erwartet funktioniert.
- Schreibe eine eigene `ParseDatePipe`, die einen Datums-String aus einem Query-Parameter entgegennimmt (z. B. `?startDate=2026-05-27`), überprüft, ob er ein parsbares Datum ist, und ihn in ein natives JavaScript-`Date`-Objekt umwandelt. Ist der String ungültig, soll die Pipe eine `BadRequestException` werfen (was eine `400 Bad Request`-Antwort ergibt). Wende diese Pipe auf einen `@Query('startDate')`-Parameter in einem deiner Controller-Endpunkte an.

> ❗ Da wir noch keine eigene Pipe gemeinsam gebaut haben, musst du die Dokumentation konsultieren, um zu sehen, wie das `PipeTransform`-Interface aufgebaut ist. [NestJS-Dokumentation: Custom Pipes](https://docs.nestjs.com/pipes#custom-pipes)
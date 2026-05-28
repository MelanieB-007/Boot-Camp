# NestJS RESTful Design – Statuscodes

Der Statuscode ist das Erste, worauf ein Client schaut – und das einzige Element der Antwort, auf das ein Programm reagieren kann, ohne den Body zu parsen. Eine `201` bedeutet: „erstellt, hier ist die Adresse." Eine `422` bedeutet: „dein Payload war syntaktisch korrekt, aber semantisch falsch – wiederhole die Anfrage nicht ohne Änderungen." Eine `503` sagt: „ich lebe, bin aber vorübergehend nicht verfügbar, versuche es später noch einmal." Zwei Clients, die denselben Statuscode lesen, kommen zur selben Schlussfolgerung. Diese Vorhersehbarkeit ist der eigentliche Zweck des Systems.

Die erste Regel lautet: Es muss immer einen Statuscode geben, auch wenn kein Body vorhanden ist. Ein erfolgreiches DELETE hat nichts Sinnvolles zurückzugeben, aber `204 No Content` ist dennoch eine vollständige HTTP-Antwort mit Statuszeile und Headern. Die Verbindung zu schließen, ohne irgendetwas zu senden, ist kein API-Verhalten – das ist ein Bug.

Die zweite Regel lautet: Der Code muss die Wahrheit sagen. `200 OK` mit `{ "error": "User not found" }` zurückzugeben ist eine Lüge, die jeden Client bricht, der der Statuszeile vertraut. Logging-Dashboards und Retry-Middleware lesen den Statuscode, nicht den Body. Wenn die Anfrage fehlgeschlagen ist, muss der Statuscode das aussagen.

Drei Codefamilien erledigen fast die gesamte Arbeit in einer typischen REST-API: `2xx` für Erfolg, `4xx` wenn der Client etwas falsch gemacht hat, `5xx` wenn der Server es getan hat. Die Familien `1xx` (informativ) und `3xx` (Weiterleitungen) existieren zwar, aber ein Backend-Entwickler, der eine JSON-API schreibt, wird selten einen Grund haben, sie direkt zurückzugeben.

## 2xx – Die Erfolgscodes

Jeder Erfolgscode sagt etwas Spezifisches darüber aus, welche Art von Erfolg eingetreten ist.

- **`200 OK`** ist der Standard für einen erfolgreichen Lese- oder Aktualisierungsvorgang mit Daten zum Zurückgeben. Beispiele: ein `GET /concerts/42`, ein `PATCH /concerts/42`, der die aktualisierte Ressource zurückgibt, ein `PUT /concerts/42`, der die Ersetzung bestätigt. Die meisten Erfolgsantworten sind `200`.
- **`201 Created`** ist die Antwort auf einen erfolgreichen POST, der eine neue Ressource erstellt hat. Die Antwort sollte einen `Location`-Header enthalten, der auf die URL der neuen Ressource zeigt (z. B. `Location: /concerts/9a4f...`), zusammen mit der neuen Ressource im Body.
- **`202 Accepted`** teilt mit, dass die Anfrage akzeptiert wurde, die Arbeit aber noch in Bearbeitung ist. Nützlich für Jobs, die lang genug dauern, um asynchron verarbeitet zu werden: Massenimporte, Video-Transkodierung, E-Mails an Tausende von Empfängern. Der Body enthält üblicherweise eine ID, die der Client später abfragen kann.
- **`204 No Content`** ist die richtige Antwort, wenn die Operation erfolgreich war, aber nichts zurückzusenden ist. Ein erfolgreiches DELETE, ein idempotentes „als gelesen markieren", ein PATCH, dessen Ergebnis der Client bereits kennt. Eine `204`-Antwort darf keinen Body haben.

Der Unterschied zwischen `200` und `201` ist bedeutsam, weil Clients für sie oft unterschiedliche Code-Pfade schreiben. Ein Frontend, das gerade eine `201` erhalten hat, weiß, dass es den `Location`-Header lesen kann, um den neuen Datensatz zu finden. Eine `200` gibt keine solche Zusage.

## 4xx – Client-Fehler

Die `4xx`-Familie ist der unübersichtlichste Teil, und die meiste Verwirrung entsteht zwischen Codes, die ähnlich aussehen, aber unterschiedliches bedeuten.

- **`400 Bad Request`** ist der generische Code für „ich kann nicht parsen, was du gesendet hast." Fehlerhaftes JSON, fehlende Pflicht-Header, ein Query-Parameter, der eine Zahl sein sollte, es aber nicht ist, ein Feld, das die API erwartet, das aber in der Anfrage fehlt. Wenn die Anfrage fehlschlägt, bevor irgendeine Geschäftslogik ausgeführt wird, ist `400` der richtige Code.
- **`401 Unauthorized`** bedeutet: „ich weiß nicht, wer du bist." Die Anmeldedaten fehlen oder sind ungültig. Der Client sollte sich authentifizieren und es erneut versuchen.
- **`403 Forbidden`** bedeutet: „ich weiß, wer du bist, und du darfst das nicht tun." Die Anmeldedaten sind gültig, die Berechtigungen nicht.
- **`404 Not Found`** bedeutet, dass die Ressource, auf die die URL zeigt, nicht existiert. Verwende es für fehlende Konzerte, fehlende Nutzer, was auch immer fehlt. Verwende `404` nicht, um aus Berechtigungsgründen die Existenz zu verbergen, es sei denn, das Nicht-Preisgeben von Informationen ist ein explizites Ziel.
- **`409 Conflict`** bedeutet, dass die Anfrage korrekt formuliert ist, aber mit dem aktuellen Zustand der Ressource in Konflikt steht. Das klassische Beispiel: Erstellen eines Datensatzes mit einem eindeutigen Feld, das bereits existiert, wie ein zweiter Nutzer mit derselben E-Mail-Adresse.
- **`422 Unprocessable Entity`** bedeutet, dass die Anfrage korrekt geparst wurde, aber die Validierung fehlgeschlagen ist. Das JSON war gültig, die darin enthaltenen Werte verstießen jedoch gegen eine Geschäftsregel. Eine 16-Zeichen-Passwortanforderung, ein Datum in der Vergangenheit für ein bevorstehendes Konzert, ein Ticketpreis unter null.
- **`429 Too Many Requests`** bedeutet, dass der Client sein Rate-Limit überschritten hat. Die Antwort sollte einen `Retry-After`-Header enthalten, der dem Client mitteilt, wann es sicher ist, es erneut zu versuchen.

Die Unterscheidung zwischen `400` und `422` ist die am meisten diskutierte Entscheidung in dieser Familie. Eine grobe Regel: `400`, wenn die Anfrage selbst fehlerhaft ist (der Parser würde sie ablehnen), `422`, wenn die Anfrage lesbar war, die darin enthaltenen Werte aber die Validierung nicht bestanden haben. NestJS's `ValidationPipe` gibt standardmäßig `400` zurück; viele Teams konfigurieren es so, dass es stattdessen `422` zurückgibt. Beide Entscheidungen sind vertretbar. Wähle eine und wende sie überall an.

Eine typische NestJS-Fehlerantwort sieht so aus:

```json
{
  "statusCode": 404,
  "message": "Concert with ID '9a4f-...' not found",
  "error": "Not Found"
}
```

Wenn `ValidationPipe` einen Payload ablehnt, wird das `message`-Feld zu einem Array mit einem Eintrag pro fehlgeschlagener Regel:

```json
{
  "statusCode": 400,
  "message": ["title must be a string", "ticketPrice must not be less than 0"],
  "error": "Bad Request"
}
```

Die Form ist über alle Handler hinweg konsistent, was die clientseitige Fehlerbehandlung handhabbar macht. Ein Client kann `statusCode` für die Verzweigungslogik lesen und `message` dem Nutzer anzeigen.

## 5xx – Server-Fehler

Die `5xx`-Familie ist kürzer, weil der Client wenig dagegen tun kann. Ihre Aufgabe ist es, dem Client mitzuteilen, dass der Fehler auf der Serverseite liegt – und dabei keine internen Details preiszugeben.

- **`500 Internal Server Error`** ist der Auffangbehälter für eine unbehandelte Ausnahme. Eine Null-Referenz, ein nicht abgefangener Fehler, eine Datenbankverbindung, die mitten in einer Abfrage abgebrochen ist, eine volle Festplatte. Die Antwort sollte in der Produktion keine Stack-Traces enthalten; diese Information gehört in die Server-Logs, nicht in den Response-Body.
- **`503 Service Unavailable`** ist der richtige Code, wenn der Server absichtlich gerade keine Anfragen bearbeitet. Ein Wartungsfenster, ein Überlastungsschutz-Circuit-Breaker, eine nachgelagerte Abhängigkeit, die die API benötigt, aber nicht erreichen kann. Wenn möglich, sollte ein `Retry-After`-Header angegeben werden, damit Clients wissen, wie lange sie warten sollen.

## NestJS-Ausnahmen und die Standard-Fehlerform

NestJS wandelt geworfene Ausnahmen automatisch in HTTP-Statuscodes um. Das Framework enthält eine `HttpException`-Klassenhierarchie, die direkt auf die obigen Codes abbildet.

```typescript
import { Controller, Get, Param, NotFoundException } from "@nestjs/common";

@Controller("concerts")
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    const concert = this.concertsService.findOne(id);
    if (!concert) {
      throw new NotFoundException(`Concert with ID '${id}' not found`);
    }
    return concert;
  }
}
```

Jede Unterklasse setzt den Statuscode, das Fehler-Label und das `message`-Feld der Antwort. Das Werfen von `NotFoundException` erzeugt den oben gezeigten `404`-Body. Das Werfen von `ConflictException` erzeugt eine `409`. Die Zuordnung ist direkt:

| Ausnahme | Statuscode |
|---|---|
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| `UnprocessableEntityException` | 422 |
| `InternalServerErrorException` | 500 |
| `ServiceUnavailableException` | 503 |

Wenn keine der eingebauten Unterklassen passt, ermöglicht die Basisklasse `HttpException` das direkte Setzen eines beliebigen Statuscodes:

```typescript
throw new HttpException("I'm a teapot", HttpStatus.I_AM_A_TEAPOT);
```

Unbehandelte Ausnahmen, die nicht von `HttpException` erben, werden zu `500`-Antworten mit einer generischen Meldung. Dieses Standardverhalten schützt davor, versehentlich Fehlerdetails aus Drittanbieter-Bibliotheken preiszugeben.

> 💡 **Gut zu wissen:** Obwohl das Standard-`500`-Verhalten sicher ist, lassen Produktionsanwendungen unbehandelte Ausnahmen selten vollständig unberührt. Stattdessen verwenden sie einen globalen Exception Filter, um diese Fehler vor dem Senden der Antwort an den Client konsistent abzufangen, zu protokollieren und zu formatieren. In dieser Einheit werden wir keinen solchen Filter bauen, aber wenn du dich dafür interessierst, wie es funktioniert, ist die [NestJS Exception Filters Dokumentation](https://docs.nestjs.com/exception-filters) eine ausgezeichnete Lektüre.

## Erfolgs-Statuscodes anpassen

Während NestJS Ausnahmen automatisch auf spezifische Fehlercodes abbildet, hat es auch Standard-Erfolgscodes: `200 OK` für GET, PUT und PATCH, und `201 Created` für POST.

Echtes RESTful Design erfordert jedoch manchmal andere Erfolgscodes. Das häufigste Beispiel ist eine DELETE-Anfrage. Wenn eine Ressource erfolgreich gelöscht wurde und kein Daten mehr im Response-Body zurückzugeben sind, ist der korrekte Statuscode `204 No Content`.

Um das Standardverhalten zu überschreiben, dekoriere den Handler mit `@HttpCode()`:

```typescript
import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";

@Controller("concerts")
export class ConcertsController {
  // ... Konstruktor und andere Methoden ...

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    this.concertsService.remove(id);
  }
}
```

Auf diesen Decorator wirst du dich auch verlassen, wenn du jemals asynchrone Endpunkte bauen musst – etwa zum Auslösen eines lang laufenden Hintergrundjobs, bei dem die Rückgabe eines `202 Accepted` (`@HttpCode(HttpStatus.ACCEPTED)`) die Standardpraxis ist.

## Ressourcen

- [MDN, HTTP-Antwortstatuscodes](https://developer.mozilla.org/de/docs/Web/HTTP/Status)
- [NestJS Docs, Exception Filters](https://docs.nestjs.com/exception-filters)
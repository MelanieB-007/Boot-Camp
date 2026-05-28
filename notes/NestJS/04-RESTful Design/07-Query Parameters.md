# NestJS RESTful Design – Query-Parameter

Ein Listen-Endpunkt ohne Query-Parameter ist ab ein paar Dutzend Datensätzen kaum noch nützlich. `GET /concerts` gibt jedes Konzert in der Datenbank zurück. Das funktioniert für einen Entwickler, der die API mit curl ausprobiert. Es bricht zusammen, sobald die Tabelle zehntausend Zeilen hat und der Client nur die nächsten zehn Jazz-Konzerte in San Francisco, sortiert nach Datum, möchte.

Query-Parameter sind die Art und Weise, wie REST die URL-Identität stabil hält, während der Client beeinflussen kann, was die Collection zurückgibt. Die Ressource ist weiterhin `/concerts`. Das Hinzufügen von `?genre=jazz&city=san-francisco&sort=date&page=2&limit=10` ändert nicht, welche Ressource adressiert wird; es ändert den Ausschnitt dieser Collection, den der Server zurückschicken soll. Der Pfad bleibt stabil, und die API bekommt nicht für jede gewünschte Ansicht der Daten einen neuen Endpunkt.

Fünf Operationen decken fast jede realistische Listen-Abfrage ab. **Filtern** wählt eine Teilmenge anhand von Feldwerten aus. **Sortieren** steuert die Reihenfolge des Ergebnisses. **Paginierung** teilt das Ergebnis in Seiten auf. **Feldauswahl** kürzt jedes Element auf eine Teilmenge seiner Felder. **Einbindung** (manchmal auch Expansion genannt) bettet verwandte Ressourcen inline ein, sodass der Client keinen zweiten Roundtrip benötigt. Jede Operation hat eine konventionelle URL-Form, auf die sich REST-APIs in der Branche geeinigt haben.

Paginierung ist die einzige der fünf, die in dieser Datei vollständig implementiert wird. Die anderen werden nur auf URL-Ebene skizziert, weil der richtige serverseitige Ansatz stark davon abhängt, welche Felder die Ressource bereitstellt – und der Bau einer generischen Filter-Engine, bevor die API echte Nutzer hat, ist meist verschwendete Arbeit.

## Filtern

Filtern reduziert eine Collection auf die Elemente, die einer Bedingung entsprechen. Die einfachste Form ist die direkte Gleichheit. `GET /concerts?genre=jazz` gibt Konzerte zurück, deren `genre`-Feld gleich `jazz` ist. Mehrere Parameter werden als UND verknüpft. `GET /concerts?genre=jazz&venue=blue-note` gibt Jazz-Konzerte im Blue Note zurück. Der Server behandelt jeden Parameter als separate Bedingung gegen die entsprechende Spalte.

Sobald Gleichheit nicht ausreicht, kommen Vergleichsoperatoren ins Spiel. Zwei URL-Konventionen sind in der Branche verbreitet:

- **Bracket-Notation**: `GET /concerts?ticketPrice[gte]=50&ticketPrice[lte]=200`
- **Suffix-Notation**: `GET /concerts?ticketPrice_gte=50&ticketPrice_lte=200`

Beide sind gültig. Wähle eine und verwende sie überall in deiner API. Häufige Operatoren sind `gt` (größer als), `gte`, `lt`, `lte`, `ne` (ungleich) und `in` (eines aus einer Liste).

Mehrwertige Filter verwenden typischerweise eine kommagetrennte Liste: `GET /concerts?genre=jazz,classical` gibt Konzerte in beiden Genres zurück. Manche APIs wiederholen den Parameter (`?genre=jazz&genre=classical`); beides ist akzeptabel, und die meisten Server-Frameworks parsen wiederholte Parameter automatisch in ein Array.

Auf der Serverseite wird jeder akzeptierte Filter zu einem optionalen Feld in einem Query-DTO mit den entsprechenden Validierungs-Decorators. Der Service übersetzt das DTO in eine WHERE-Klausel beim Repository-Aufruf. Das URL-Design ist der einfache Teil. Die Übersetzungslogik ist der Ort, an dem das Filtern anspruchsvoll wird.

## Sortieren

Sortieren steuert die Reihenfolge der Elemente im Ergebnis. Der konventionelle Parameter ist `sort`, wobei ein führendes `-` absteigende Reihenfolge anzeigt:

- `GET /concerts?sort=date` gibt Konzerte aufsteigend nach Datum sortiert zurück.
- `GET /concerts?sort=-date` gibt Konzerte absteigend nach Datum sortiert zurück.
- `GET /concerts?sort=artist,-date` sortiert zuerst aufsteigend nach Künstler, dann innerhalb jedes Künstlers absteigend nach Datum.

Eine Whitelist auf der Serverseite verhindert, dass beliebige Spaltennamen durchsickern. Dem Client zu erlauben, nach jedem Feld zu sortieren – auch nach solchen, die die API nie bereitstellen sollte – ist ein Datenleck, das nur darauf wartet zu passieren. Das Query-DTO sollte die erlaubten Sortierfelder explizit deklarieren und alles andere ablehnen.

## Paginierung

Paginierung ist es wert, konkret implementiert zu werden, denn der falsche Ansatz verursacht Performance-Probleme, die sich mit wachsenden Daten potenzieren. Zwei Muster dominieren.

**Seitenbasierte Paginierung** verwendet `page` und `limit`. Der Client fordert Seite N der Größe M an:

```
GET /concerts?page=2&limit=10
```

Der Server überspringt die ersten `(page - 1) * limit` Zeilen und gibt die nächsten `limit` zurück. Seitenbasierte Paginierung ist der richtige Standard für die meisten APIs. Clients verstehen sie, UI-Steuerelemente bilden direkt darauf ab, und die Mathematik ist offensichtlich.

**Offset-basierte Paginierung** verwendet `offset` und `limit` direkt:

```
GET /concerts?offset=20&limit=10
```

Gleiche Idee, andere Parameternamen. Offset-basiert ist etwas flexibler (der Client wählt jeden beliebigen Startpunkt), aber ansonsten äquivalent.

Ein Query-DTO erfasst die Eingaberegeln:

```typescript
import { IsInt, IsOptional, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 10;
}
```

Die Decorators kodieren die Regeln:

- `page` und `limit` müssen positive Integer sein.
- `limit` ist auf 100 begrenzt, damit ein böswilliger oder unachtsamer Client nicht eine Million Zeilen auf einmal anfordern kann.
- `@Type(() => Number)` konvertiert den Query-String-Wert (der als String ankommt) in eine Zahl, bevor die Validierung läuft.
- Standardwerte decken Anfragen ab, bei denen der Client einen oder beide Parameter weglässt.

Der Controller nimmt das DTO über `@Query()` entgegen:

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { ConcertsService } from "./concerts.service";
import { PaginationQueryDto } from "./dto/pagination-query.dto";

@Controller("concerts")
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.concertsService.findAll(pagination);
  }
}
```

Der Service übersetzt das DTO in einen Repository-Aufruf:

```typescript
async findAll(pagination: PaginationQueryDto) {
  const { page, limit } = pagination;

  const [data, total] = await this.concertsRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

`findAndCount` gibt in einer einzigen Abfrage sowohl die Seite mit Zeilen als auch die Gesamtanzahl zurück – was der Client braucht, um Paginierungs-Steuerelemente darzustellen.

Die Antwortform entspricht dem, was die meisten Konsumenten erwarten:

```json
{
  "data": [
    { "id": "9a4f...", "title": "Coltrane Tribute" },
    { "id": "1b2e...", "title": "Mingus Live" }
  ],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 247,
    "totalPages": 25
  }
}
```

Das `data`-Array enthält die Elemente. Das `meta`-Objekt teilt dem Client mit, wo er sich in der Collection befindet und wie viele Elemente insgesamt existieren. Mit dieser Form kann ein Frontend „Seite 2 von 25" darstellen, ohne eine separate Zählanfrage zu stellen.

> ❗ **Achtung:** Offset-basierte Paginierung wird bei sehr großen Tabellen langsam. Das Abrufen von Seite 1000 der Größe 10 erfordert, dass die Datenbank 9990 Zeilen scannt und verwirft, bevor sie die nächsten 10 zurückgibt. Cursor-basierte Paginierung (bei der der Client die ID des letzten Elements als Startpunkt übergibt) vermeidet diese Kosten, ist aber komplexer zu implementieren. Bleibe bei Offset-basierter Paginierung, bis die Abfrage-Performance tatsächlich eine Änderung erzwingt.

## Exkurs: Feldauswahl und Einbindung

Zwei Operationen tauchen in Standard-REST-APIs seltener auf, sind aber beide wissenswert (du musst sie nicht implementieren).

**Feldauswahl** ermöglicht es dem Client, eine Teilmenge der Felder jeder Ressource anzufordern. Der konventionelle Parameter ist `fields`:

```
GET /concerts?fields=id,title,date
```

Der Server gibt jedes Konzert mit nur den drei angeforderten Feldern zurück. Das reduziert die Antwortgröße, wenn Clients nur eine Zusammenfassungsansicht anzeigen müssen – was für mobile Clients in langsamen Netzwerken mehr Bedeutung hat als für Desktop-Browser. Die Implementierung erfordert, dass der Service Spalten auf Datenbankebene projiziert, was aufwendiger als Filtern und selten den Aufwand wert ist.

**Einbindung** (oder Expansion) macht das Gegenteil. Sie bettet verwandte Ressourcen inline ein:

```
GET /concerts/9a4f...?include=venue,artist
```

Statt nur die Fremdschlüssel-Referenzen zurückzugeben, enthält die Antwort die vollständigen `venue`- und `artist`-Objekte, eingebettet in das Konzert. Das spart dem Client einen Roundtrip für den häufigen Fall „gib mir ein Konzert und alles, was ich zum Anzeigen brauche." Auf der Serverseite muss der Service die Relationen laden (typischerweise über TypeORMs `relations`-Option), und das Response-DTO muss verschachtelte DTOs mit `@Type(() => VenueResponseDto)` deklarieren.

Beide Operationen rechtfertigen ihren Platz, wenn die API Clients mit begrenztem Datenbudget bedient. Für die meisten internen APIs ist jedoch eine feste Antwortform die einfachere Wahl und bleibt einfacher, wenn die API wächst. Wenn deine Anwendung stark auf dynamische Feldauswahl und tiefe Beziehungseinbindung angewiesen ist, ist das meist ein Zeichen dafür, dass das Projekt von GraphQL anstelle einer traditionellen REST-API profitieren würde.

## Ressourcen

- [JSON:API-Spezifikation, Fetching Data](https://jsonapi.org/format/#fetching)
- [NestJS Docs, Repository API](https://docs.nestjs.com/recipes/sql-typeorm)
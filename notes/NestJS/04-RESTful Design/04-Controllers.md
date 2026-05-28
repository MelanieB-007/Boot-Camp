# NestJS RESTful Design – Controller

Der Controller ist die Schicht, die HTTP-Anfragen in Methodenaufrufe und Methodenrückgaben in HTTP-Antworten umwandelt. Der Router ordnet eine eingehende URL einer Klasse und einer Methode dieser Klasse zu. NestJS liest die Decorators der Methode, um herauszufinden, welche Teile der Anfrage übergeben werden sollen. Die Methode wird ausgeführt, gibt einen Wert zurück, und das Framework serialisiert diesen Wert zu JSON und sendet ihn mit einem Statuscode zurück. Das ist die gesamte Aufgabe eines Controllers.

Gute Controller bleiben schlank. Sie übersetzen Anfragestrukturen in Service-Aufrufe, werfen die richtige Ausnahme, wenn der Service nichts zurückgibt, und überlassen dem Framework alles andere: JSON parsen, `Content-Type` setzen, Statuscode wählen. Wenn ein Controller anfängt, Geschäftslogik zu enthalten, laufen zwei Dinge schief. Dieselbe Logik wird über die nächsten drei Endpunkte dupliziert, die sie benötigen. Und die Regeln lassen sich kaum noch unit-testen, weil sie tief in HTTP-Infrastruktur vergraben sind. Logik aus dem Controller herauszuhalten zahlt sich aus, sobald die API über einfaches CRUD hinauswächst.

Das Beispiel für den Rest dieser Einheit ist eine Concerts-API. Die Ressource sieht so aus:

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Concert {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  venue: string;

  @Column({ type: "datetime" })
  date: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  ticketPrice: number;

  @Column()
  genre: string;
}
```

Ein Konzert hat eine UUID, einen Titel, einen Künstler, einen Veranstaltungsort, ein Datum, einen Preis und ein Genre. Standardmäßige TypeORM-Entity, in SQLite gespeichert. Der Controller stellt fünf Endpunkte bereit: auflisten, einzeln lesen, erstellen, aktualisieren, löschen.

## Routing und das Controller-Präfix

Der `@Controller()`-Decorator markiert eine Klasse als Controller und setzt den Basispfad für alle darin definierten Routen:

```typescript
import { Controller } from "@nestjs/common";

@Controller("concerts")
export class ConcertsController {}
```

Jeder innerhalb von `ConcertsController` deklarierte Endpunkt wird automatisch mit `/concerts` präfixiert. Es gibt keine separate Router-Datei. Die Klasse selbst ist die Routing-Tabelle.

Innerhalb der Klasse deklarieren Decorators auf Methodenebene die HTTP-Methode und den Pfad-Suffix für jeden Endpunkt:

```typescript
@Get()           // GET /concerts
@Get(":id")      // GET /concerts/:id
@Post()          // POST /concerts
@Patch(":id")    // PATCH /concerts/:id
@Delete(":id")   // DELETE /concerts/:id
```

Die vollständige URL eines Endpunkts ergibt sich aus dem Controller-Präfix und dem Methoden-Suffix. `@Get(":id")` auf dem `ConcertsController` wird zu `GET /concerts/:id`. Pfadparameter (das `:id`-Stück) werden aus der URL extrahiert und der Methode über `@Param()` zugänglich gemacht.

### Design-Überlegung: Unterressourcen

Betrachte eine eng verwandte Entity: Tickets. Wenn jedes Konzert Tickets hat, wie sollte man die Routen strukturieren, um sie zu kaufen oder anzuzeigen? Soll ein Ticket als Unterressource unter dem Konzert behandelt werden (z. B. `GET /concerts/:id/tickets`), oder stellt es eine eigene Entity dar, die einen eigenen Controller verdient (z. B. `GET /tickets/:id`)? Was passiert außerdem mit dem Routen-Design, wenn ein Nutzer alle Tickets abrufen möchte, die er für verschiedene Konzerte gekauft hat?

Denke darüber nach, wie du diese Routen strukturieren würdest, bevor du weiterliest. Es gibt keine einzig richtige Antwort, aber deine Entscheidung wird grundlegend beeinflussen, wie Clients mit deiner API interagieren.

## Daten aus der Anfrage lesen

Drei Decorators decken fast jede Controller-Methode ab:

- **`@Param('name')`** liest einen URL-Pfadparameter. Für `GET /concerts/9a4f...` liefert `@Param('id')` dem Controller den String `'9a4f...'`.
- **`@Body()`** liest den geparsten JSON-Body der Anfrage. NestJS übergibt der Methode ein einfaches Objekt, dessen Schlüssel dem JSON entsprechen. Wenn der Typ des Parameters eine DTO-Klasse ist, kann das Framework das Objekt validieren und in eine Instanz des DTOs umwandeln.
- **`@Query('name')`** liest einen Query-Parameter aus der URL. Für `GET /concerts?genre=jazz` gibt `@Query('genre')` den Wert `'jazz'` zurück. Der Aufruf von `@Query()` ohne Namen gibt das vollständige Query-Objekt zurück.

Zwei weitere Decorators werden seltener verwendet: `@Headers()` zum Lesen von Anfrage-Headern (nützlich, wenn die Methode direkt den `Authorization`-Header benötigt), und `@Req()` / `@Res()` für die zugrunde liegenden Express-Request- und Response-Objekte. Greife nur dann darauf zurück, wenn die typisierten Kurzformen oben nicht ausreichen. Das direkte Verwenden von `@Res()` deaktiviert den Großteil der Response-Verarbeitung des Frameworks.

## Der vollständige Concerts-Controller

Die Decorators zusammengeführt ergibt den Controller für die `Concert`-Ressource:

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ConcertsService } from "./concerts.service";
import { CreateConcertDto } from "./dto/create-concert.dto";
import { UpdateConcertDto } from "./dto/update-concert.dto";

@Controller("concerts")
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  findAll() {
    return this.concertsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const concert = await this.concertsService.findOne(id);
    if (!concert) {
      throw new NotFoundException(`Concert with ID '${id}' not found`);
    }
    return concert;
  }

  @Post()
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateConcertDto,
  ) {
    const concert = await this.concertsService.update(id, dto);
    if (!concert) {
      throw new NotFoundException(`Concert with ID '${id}' not found`);
    }
    return concert;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    const removed = await this.concertsService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Concert with ID '${id}' not found`);
    }
  }
}
```

Einige Details sind besonders erwähnenswert:

- Der Konstruktor injiziert `ConcertsService` über `private readonly`. NestJS löst die Abhängigkeit aus der Provider-Liste des Moduls auf. Der Controller instanziiert den Service niemals direkt.
- `ParseUUIDPipe` bei `@Param('id', ...)` lehnt jeden Pfadparameter ab, der keine syntaktisch gültige UUID ist – noch bevor die Methode ausgeführt wird. Es ist eine der eingebauten Pipes von NestJS.
- `findOne`, `update` und `remove` werfen `NotFoundException`, wenn der Service `null` oder `undefined` zurückgibt. Das Framework wandelt diese Ausnahme in eine `404`-Antwort um, mit dem übergebenen String als `message`-Feld.
- `@HttpCode(HttpStatus.NO_CONTENT)` überschreibt den Standard-`200` des DELETE-Handlers. Ein erfolgreiches Delete gibt `204` ohne Body zurück.
- `findAll`, `findOne`, `update` und `remove` geben den Wert des Services zurück. NestJS serialisiert alles, was die Methode zurückgibt, zu JSON – explizites Response-Building ist nicht erforderlich.

## An den Service delegieren

Der Controller berührt niemals die Datenbank. Jede Persistenzoperation läuft über den `ConcertsService`:

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Concert } from "./concert.entity";
import { CreateConcertDto } from "./dto/create-concert.dto";
import { UpdateConcertDto } from "./dto/update-concert.dto";

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertsRepository: Repository<Concert>,
  ) {}

  findAll() {
    return this.concertsRepository.find();
  }

  findOne(id: string) {
    return this.concertsRepository.findOneBy({ id });
  }

  create(dto: CreateConcertDto) {
    const concert = this.concertsRepository.create(dto);
    return this.concertsRepository.save(concert);
  }

  async update(id: string, dto: UpdateConcertDto) {
    const concert = await this.findOne(id);
    if (!concert) return null;
    Object.assign(concert, dto);
    return this.concertsRepository.save(concert);
  }

  async remove(id: string) {
    const result = await this.concertsRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
```

Der Service ist ebenfalls schlank – aber aus einem anderen Grund. Seine einzige Aufgabe ist es, Domain-Operationen in Repository-Aufrufe zu übersetzen. Das Repository, das über `@InjectRepository(Concert)` injiziert wird, ist der Ort, an dem das eigentliche SQL generiert wird. Sobald die API über CRUD hinauswächst (E-Mail-Bestätigungen senden, Karten belasten, Domain-Events auslösen, Hintergrundjobs in die Warteschlange stellen), gehört diese Logik in den Service – niemals in den Controller.

> ✏️ **Hinweis:** Die Entity direkt aus dem Service zurückzugeben, legt jede Datenbankspalte gegenüber dem API-Client offen. Der nächste Abschnitt behandelt Response-DTOs, die die Daten auf dem Weg nach außen formen und verhindern, dass interne Felder nach außen gelangen.

## Im Modul zusammenführen

Der Vollständigkeit halber: Controller und Services registrieren sich nicht selbst. Das Modul, zu dem sie gehören, deklariert beide und importiert das TypeORM-Feature-Modul für die Entity:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Concert } from "./concert.entity";
import { ConcertsController } from "./concerts.controller";
import { ConcertsService } from "./concerts.service";

@Module({
  imports: [TypeOrmModule.forFeature([Concert])],
  controllers: [ConcertsController],
  providers: [ConcertsService],
})
export class ConcertsModule {}
```

Das bildet das vollständige technische Fundament. Controller übernehmen das Routing, Parameter sind streng typisiert und geparst, der Service übernimmt alle Datenbankoperationen, Fehler werden automatisch in HTTP-Statuscodes übersetzt, und das Modul verbindet alles zu einer kohärenten Einheit.

## Ressourcen

- [NestJS Docs, Controllers](https://docs.nestjs.com/controllers)
- [NestJS Docs, Modules](https://docs.nestjs.com/modules)
# NestJS RESTful Design – Request- und Response-DTOs

Ein DTO (Data Transfer Object) ist eine einfache Klasse, deren einzige Aufgabe es ist, die Form von Daten zu beschreiben, die eine Grenze überschreiten. Die betreffende Grenze ist der HTTP-Rand der API: ein eingehender Request-Body oder eine ausgehende Antwort. DTOs enthalten keine Geschäftslogik. Es sind lediglich typisierte Felder mit angehängten Decorators.

An jedem Endpunkt, der einen strukturierten Payload akzeptiert oder zurückgibt, sitzen zwei verschiedene DTOs. Das Request-DTO definiert, was der Client senden darf. Das Response-DTO definiert, was der Server bereit ist zurückzugeben. Beides zu vermischen oder die Entity direkt zurückzugeben, ist eine der häufigsten Abkürzungen, die einem junior Team sechs Monate später auf die Füße fällt. Die Entity enthält interne Felder (erstellte Zeitstempel, Soft-Delete-Flags, interne Status-Enums, manchmal Passwort-Hashes), die in der öffentlichen API nichts zu suchen haben. Und sobald sich das Datenbankschema ändert, bricht jeder Client.

Request-DTOs und Response-DTOs lösen unterschiedliche Probleme und verwenden unterschiedliche Bibliotheken. Request-DTOs stützen sich auf `class-validator`, um fehlerhafte Eingaben abzulehnen, bevor sie jemals einen Handler erreichen. Response-DTOs stützen sich auf `class-transformer`, um die Felder auf eine Whitelist zu setzen, die zum Client gesendet werden. Beide Bibliotheken sind Decorator-gesteuert und sind in NestJS vorkonfiguriert, sobald `class-validator` und `class-transformer` neben `@nestjs/common` installiert sind.

Das Beispiel wird mit der `Concert`-Ressource fortgesetzt. Die Endpunkte existieren bereits (POST, PATCH, GET). Die nachfolgenden DTOs geben jedem Endpunkt einen genauen Vertrag darüber, welche Felder er akzeptiert und welche er zurückgibt – mit den Regeln an der Klasse selbst statt über den Controller-Code verstreut.

## Request-DTOs und Validierungs-Decorators

Ein Request-DTO ist eine Klasse mit `class-validator`-Decorators auf ihren Feldern. Jeder Decorator deklariert eine Regel, die das eingehende JSON erfüllen muss.

```typescript
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsPositive,
  IsIn,
  MaxLength,
} from "class-validator";

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  artist: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsDateString()
  date: string;

  @IsPositive()
  ticketPrice: number;

  @IsIn(["rock", "jazz", "classical", "electronic", "pop"])
  genre: string;
}
```

Jeder Decorator ist eine isolierte Prüfung. Ein Feld kann mehrere gestapelte tragen. Das Framework führt alle aus und sammelt jeden Fehler in einer einzigen Antwort. Die am häufigsten verwendeten Decorators:

- `@IsString()`, `@IsNumber()`, `@IsBoolean()` für die primitiven Typprüfungen.
- `@IsNotEmpty()` um leere Strings und `null`-Werte abzulehnen.
- `@MaxLength(n)`, `@Min(n)`, `@Max(n)` für Größen- und Bereichseinschränkungen.
- `@IsEmail()`, `@IsUUID()`, `@IsDateString()`, `@IsUrl()` für Formatprüfungen bei gängigen Mustern.
- `@IsIn([...])` um einen String auf eine feste Menge von Werten zu beschränken.
- `@IsOptional()` für Felder, die vorhanden sein können oder nicht.

Beachte, was im `CreateConcertDto` fehlt: die `id`. Ein Client, der ein Konzert erstellt, darf den Primärschlüssel nicht selbst wählen. Die Datenbank weist ihn zu. Das DTO kodiert diese Regel, indem es das Feld gar nicht erst bereitstellt. Dasselbe gilt für `createdAt` oder andere serverseitig generierte Felder. Abgeleitete Daten gehören nicht in ein Request-DTO.

Die Validierung läuft nur, wenn NestJS's `ValidationPipe` aktiviert ist. Kurz zusammengefasst: Die Pipe einmalig in `main.ts` konfigurieren, und jede Controller-Methode, die einen DTO-typisierten `@Body()`-Parameter akzeptiert, wird automatisch validiert. Pipes erhalten ihre eigene Datei.

## `PartialType` für Update-Endpunkte

Ein PATCH-Endpunkt sollte eine Teilmenge der Felder akzeptieren, die der Create-Endpunkt erfordert. Jeden Decorator mit `@IsOptional()` neu zu schreiben, wäre mühsam und fehleranfällig. Daher liefert NestJS für diesen häufigen Fall eine Hilfsfunktion:

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateConcertDto } from "./create-concert.dto";

export class UpdateConcertDto extends PartialType(CreateConcertDto) {}
```

`PartialType` gibt eine Klasse zurück, in der jedes Feld des übergeordneten DTOs als optional markiert ist. Die Validierungsregeln bleiben erhalten: Ein in einem PATCH angegebenes `genre` muss weiterhin einer der erlaubten Werte sein. Die Regeln feuern nur nicht, wenn das Feld fehlt.

Dieses Muster ist in NestJS-Codebases Standard. Ein `CreateXxxDto` gepaart mit `UpdateXxxDto = PartialType(CreateXxxDto)` eliminiert eine Menge Boilerplate und hält beide DTOs synchron, wenn neue Felder hinzugefügt werden.

## Response-DTOs und das Problem der lecken Entity

Eine TypeORM-Entity direkt aus einer Controller-Methode zurückzugeben, sendet jede Spalte, die die Datenbank kennt, an den Client. Für die `Concert`-Entity ist das harmlos. Für eine `User`-Entity mit einer `passwordHash`-Spalte, einer `internalNotes`-Spalte oder einer `lastSeenIp`-Spalte ist es ein Datenleck.

Selbst wenn kein Feld wirklich sensibel ist, erzeugt die direkte Rückgabe der Entity ein Kopplungsproblem. Sobald das Schema eine `legacyMigrationToken`-Spalte erhält, empfängt jeder Client, der die API konsumiert, ein neues Feld, das er nicht angefordert hat. Spalten zur Datenbank hinzuzufügen wird damit zu einer Breaking Change für die öffentliche API.

Ein Response-DTO ist der explizite Vertrag dafür, was die API zurückgeben wird. Es ist eine Klasse mit `class-transformer`-Decorators, die festlegen, welche Felder den Serializer passieren dürfen:

```typescript
import { Expose, Type } from "class-transformer";

export class ConcertResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  artist: string;

  @Expose()
  venue: string;

  @Expose()
  @Type(() => Date)
  date: Date;

  @Expose()
  ticketPrice: number;

  @Expose()
  genre: string;
}
```

Der Whitelist-Ansatz macht dieses Vorgehen sicher. `@Expose()` nimmt ein Feld auf. Jede Spalte der Entity, die nicht im DTO erscheint, wird beim Herausgehen verworfen. Das spätere Hinzufügen von `internalNotes` zur Entity veröffentlicht es nicht versehentlich. Das DTO muss explizit „Ja" sagen.

`@Type(() => Date)` weist `class-transformer` an, aus dem zugrundeliegenden Spaltenwert ein echtes `Date` zu konstruieren. Ohne diese Angabe bleibt das Feld das, was der Datenbanktreiber zurückgegeben hat – was möglicherweise ein String ist.

## `ClassSerializerInterceptor` und das Serialisieren von Antworten

`class-transformer` läuft nur, wenn etwas es aufruft. NestJS stellt dafür den `ClassSerializerInterceptor` bereit. Registriere ihn global in `main.ts`:

```typescript
import { NestFactory, Reflector } from "@nestjs/core";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

`excludeExtraneousValues: true` ist die Option, die das Whitelist-Verhalten aktiviert. Ohne sie fließt jedes Feld des Quellobjekts durch, und `@Expose()` wird zur reinen Dekoration. Mit ihr überleben nur mit `@Expose()` dekorierte Felder den Serialisierungsschritt.

Das sauberste Muster für eine einsteigerfreundliche Codebase ist das explizite Mappen im Service mit `plainToInstance`:

```typescript
import { plainToInstance } from "class-transformer";
import { ConcertResponseDto } from "./dto/concert-response.dto";

// innerhalb von ConcertsService
async findOne(id: string): Promise<ConcertResponseDto | null> {
  const concert = await this.concertsRepository.findOneBy({ id });
  if (!concert) return null;
  return plainToInstance(ConcertResponseDto, concert, {
    excludeExtraneousValues: true,
  });
}
```

`plainToInstance` erstellt ein `ConcertResponseDto` aus der Entity und wendet dieselbe Whitelist-Regel an. Das Ergebnis ist ein einfaches Objekt, das nur die sieben Felder enthält, die das DTO aufgenommen hat. Was auch immer die Entity sonst noch enthält, bleibt innerhalb der Service-Grenze.

> ❗ **Achtung:** Das Vergessen von `excludeExtraneousValues: true` ist der häufigste DTO-Bug in NestJS-Codebases. Die Pipeline scheint weiterhin zu funktionieren, weil die Antwort wohlgeformt ist, aber jedes Feld der Entity schleicht sich durch. Ein `User.passwordHash` landet in der JSON-Antwort, und kein Test fängt es auf, weil die DTO-Klasse selbst korrekt aussieht. Setze die Option sowohl in der Interceptor-Konfiguration als auch in jedem `plainToInstance`-Aufruf.

## Ressourcen

- [class-validator, Validierungs-Decorators](https://github.com/typestack/class-validator#validation-decorators)
- [NestJS Docs, Validation](https://docs.nestjs.com/techniques/validation)
- [NestJS Docs, Mapped types](https://docs.nestjs.com/openapi/mapped-types)
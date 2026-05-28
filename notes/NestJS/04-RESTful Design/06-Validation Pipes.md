# NestJS RESTful Design – Validation Pipes

Eine Pipe ist eine Klasse, die NestJS gegen ein eingehendes Argument ausführt, bevor die Controller-Methode es erhält. Die Pipe kann eines von zwei Dingen tun: das Argument validieren (und einen Fehler werfen, wenn es fehlschlägt) oder es in etwas Nützlicheres umwandeln – etwa einen String in eine Zahl oder ein gepartes JSON-Objekt in eine DTO-Instanz. Zwischen dem Request-Parser und dem Handler platziert, sind Pipes der natürliche Ort, um Eingaberegeln durchzusetzen. Wenn ein Handler ausgeführt wird, wurde jeder übergebene Wert bereits geprüft oder konvertiert.

Ohne konfigurierte Pipes sind die Validierungs-Decorators auf einem DTO reine Dokumentation. Sie beschreiben, wie das Feld aussehen soll, aber nichts erzwingt die Regeln zur Laufzeit. Dieselbe Lücke besteht bei Pfadparametern. Einen als `number` zu typisieren, ist TypeScript-Fiktion; der Wert kommt weiterhin als String an, und die Datenbankabfrage schlägt mit einer verwirrenden Fehlermeldung fehl. Pipes sind die Laufzeit-Durchsetzungsschicht, die beide Lücken schließt.

Zwei Pipes erledigen in der Praxis fast die gesamte Arbeit. `ValidationPipe` deckt Request-Bodies ab. Sie wandelt das geparste JSON in eine Instanz der DTO-Klasse um und führt darauf die `class-validator`-Decorators aus. Die Parse-Pipes (`ParseUUIDPipe`, `ParseIntPipe`, `ParseBoolPipe`) decken Pfad- und Query-Parameter ab, bei denen der Rohwert ein String ist, der Handler aber etwas Spezifischeres benötigt. Einmal konfiguriert und dort eingesetzt, wo sie hingehören, decken diese beiden die Request-Grenze für die meisten CRUD-APIs ab.

## Pipes im Request-Lebenszyklus

Pipes nehmen einen festen Platz in der NestJS-Request-Pipeline ein. Middleware läuft zuerst und behandelt Aspekte wie Body-Parsing und CORS. Guards laufen als nächstes und entscheiden, ob die Anfrage überhaupt durchgelassen wird. Dann laufen Pipes für jedes Argument, das der Handler empfangen wird. Interceptors umhüllen den Handler in einem Vor/Nach-Sandwich, und der Handler selbst läuft in der Mitte. Was auch immer er zurückgibt, fließt durch die Interceptors zurück und wird als Antwort ausgegeben.

Diese Position macht Pipes zum richtigen Ort für die Eingabevalidierung. Sie feuern vor jeder Geschäftslogik, aber nachdem der Request-Body in ein verwendbares Objekt geparst wurde. Eine Pipe, die eine `BadRequestException` wirft, unterbricht den Rest der Pipeline. Der Handler läuft nie, die Datenbank wird nie berührt, und der Client erhält eine `400`-Antwort mit den Validierungsfehlern als Nachrichtentext.

Pipes sehen jeweils nur ein Argument. NestJS ruft die `transform(value, metadata)`-Methode der Pipe einmal pro dekorierten Parameter auf. Was auch immer die Pipe zurückgibt – oder die Ausnahme, die sie wirft – ist das, was der Handler an dieser Stelle sieht.

## `ValidationPipe` und die globale Konfiguration

`ValidationPipe` behandelt jede Controller-Methode, die einen DTO-typisierten Parameter akzeptiert. Registriere sie einmalig in `main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

Jede Option hat ihre Berechtigung:

- **`whitelist: true`** entfernt Eigenschaften, die nicht im DTO deklariert sind. Sendet ein Client `{ title, artist, hackerField: "x" }` und das DTO deklariert nur `title` und `artist`, wird das zusätzliche Feld still verworfen, bevor der Handler läuft.
- **`forbidNonWhitelisted: true`** wandelt dieses stille Verwerfen in eine `400`-Antwort um, die dem Client genau mitteilt, welche Property unerwartet war. Nützlich während der Entwicklung; auch im Produktivbetrieb vertretbar.
- **`transform: true`** konvertiert das einfache JSON-Objekt in eine echte Instanz der DTO-Klasse. Ohne diese Option liefert `@Body() dto: CreateConcertDto` dem Handler ein einfaches Objekt, das zufällig dieselben Property-Namen wie das DTO hat – keine echte Instanz der Klasse.
- **`transformOptions: { enableImplicitConversion: true }`** lässt die Pipe primitive Typen anhand der TypeScript-Deklarationen erzwingen. Ein Query-String `?page=2` kommt als `"2"` an. Mit aktivierter impliziter Konvertierung empfängt ein DTO-Feld, das als `page: number` deklariert ist, die echte Zahl `2`.

Einmal registriert, bleibt `ValidationPipe` still, bis sie Arbeit hat. Die Decorators auf jeder DTO-Klasse sagen ihr, was sie durchzusetzen hat.

> ❗ **Achtung:** `transform: true` ist nicht verhandelbar, wenn DTOs mit `class-validator` kombiniert werden. Der Validator kann Decorators nur auf einer Klasseninstanz prüfen, und ohne `transform` wird der Body niemals zu einer solchen. Ein DTO, das gut dekoriert aussieht, schlägt zur Laufzeit bei der Validierung fehl – und der Bug ist fast unsichtbar, weil nichts wirft. Setze die Option und vergiss sie.

## Parse-Pipes für Pfad- und Query-Parameter

Pfad- und Query-Parameter kommen als Strings an. Die Parse-Pipes konvertieren sie in reichhaltigere Typen und lehnen fehlerhafte Eingaben im selben Schritt ab.

```typescript
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
} from "@nestjs/common";

@Controller("concerts")
export class ConcertsController {
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    // id ist garantiert eine syntaktisch gültige UUID
  }

  @Get("by-year/:year")
  findByYear(@Param("year", ParseIntPipe) year: number) {
    // year ist garantiert ein Integer
  }
}
```

Die eingebauten Pipes:

- **`ParseUUIDPipe`** lehnt jeden Wert ab, der keine syntaktisch gültige UUID ist. Eine Anfrage an `/concerts/abc` gibt `400` zurück, bevor der Handler läuft.
- **`ParseIntPipe`** konvertiert den String in eine Zahl. `/by-year/keinezahl` erzeugt eine `400`.
- **`ParseBoolPipe`** akzeptiert `'true'`, `'false'`, `'1'`, `'0'` und gibt den entsprechenden Boolean zurück.
- **`ParseFloatPipe`**, **`ParseArrayPipe`** und **`ParseEnumPipe`** decken seltener genutzte Fälle ab, in denen der Parameter eine Dezimalzahl, eine kommagetrennte Liste oder ein Wert aus einer festen Menge ist.

Diese Pipes sind auf ein einziges Argument begrenzt. Sie auf jeden `@Param`- oder `@Query`-Decorator zu stapeln, der einen benötigt, ist das richtige Muster. Es gibt keine globale Einstellung, die sie automatisch anhand des TypeScript-Typs des Parameters anwendet.

## Eigene Pipes, wenn die eingebauten nicht ausreichen

Eine eigene Pipe implementiert das `PipeTransform`-Interface und wird genauso registriert wie eine eingebaute. Der häufigste Grund, eine zu schreiben, ist eine Domain-Regel, die über die syntaktische Validierung hinausgeht. Eine `ConcertExistsPipe` könnte zum Beispiel eine eingehende UUID in die geladene Entity umwandeln (und mit `404` fehlschlagen, wenn die ID unbekannt ist) und so jeden Handler vor demselben Boilerplate-Datenbankaufruf bewahren.

Für die meisten APIs decken `ValidationPipe` und die Parse-Pipes die Request-Grenze vollständig ab. Greife auf eine eigene Pipe zurück, wenn dieselbe Prüfung in drei oder mehr Handlern auftaucht und die Duplikation anfängt zu schmerzen.

## Ressourcen

- [NestJS Docs, Pipes](https://docs.nestjs.com/pipes)
- [NestJS Docs, Validation](https://docs.nestjs.com/techniques/validation)
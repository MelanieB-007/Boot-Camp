# NestJS Basics 2 – Die NestJS CLI

NestJS' größte Stärke – die klare Struktur – kann gleichzeitig zum größten Reibungspunkt werden. Jede neue Domäne erfordert das manuelle Anlegen von Dateien, das Schreiben des Klassen-Grundgerüsts, das Anbringen der richtigen Dekoratoren und das Aktualisieren des `@Module()`-Dekorators, um die neue Klasse zu registrieren. Um diesen Prozess zu vereinfachen, haben die NestJS-Maintainer ein CLI-Tool entwickelt: die NestJS CLI. Sie reduziert die gesamte Abfolge auf wenige Befehle.

## Installation

Obwohl die CLI ohne Installation über `npx` aufgerufen werden kann, wird empfohlen, sie global über npm zu installieren:

```bash
npm install -g @nestjs/cli
```

Danach steht der `nest`-Befehl zur Verfügung, mit dem sich Feature-Module, Services und Controller generieren lassen.

## Feature-Module generieren

Die Befehle `nest g module`, `nest g service` und `nest g controller` mit demselben Feature-Namen legen ein in sich geschlossenes Feature-Verzeichnis an:

```bash
nest g module users
nest g service users
nest g controller users
```

Der Modul-Befehl erstellt das Verzeichnis und die Modul-Datei. Die Service- und Controller-Befehle fügen ihre Dateien demselben Verzeichnis hinzu:

```
src/
└── users/
    ├── users.module.ts
    ├── users.service.ts
    └── users.controller.ts
```

Diese Namenskonvention ist Standard in jedem NestJS-Projekt und sollte auch beim manuellen Anlegen von Dateien eingehalten werden.

## Automatische Registrierung im Modul

Die CLI macht mehr, als Dateien an der richtigen Stelle abzulegen. Wird ein Service oder Controller für ein Feature generiert, das bereits ein Modul besitzt, bearbeitet die CLI die Modul-Datei und importiert sowie registriert die neue Klasse automatisch.

Vor dem Generieren von Service und Controller enthält `users.module.ts` ein leeres Grundgerüst:

```typescript
import { Module } from "@nestjs/common";

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class UsersModule {}
```

Nach dem Ausführen beider Generatoren sind Imports und Arrays befüllt:

```typescript
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

Import-Pfade und Array-Einträge werden automatisch geschrieben. Es gibt keinen manuellen Schritt, bei dem man vergessen könnte, einen Provider zu registrieren oder einen Pfad falsch einzutippen.

## Was die CLI nicht übernimmt

Das Einzige, das die CLI dem Entwickler überlässt, ist der Import des Feature-Moduls in das `AppModule`. Da die CLI nicht ableiten kann, welches übergeordnete Modul ein neues Feature besitzen soll, wird dieser Import manuell hinzugefügt:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Weiterführende Links

- [NestJS CLI – offizielle Dokumentation](https://docs.nestjs.com/cli/overview)
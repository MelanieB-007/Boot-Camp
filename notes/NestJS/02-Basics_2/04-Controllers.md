# NestJS Basics 2 – Controller

Ein Controller in NestJS erfüllt dieselbe Aufgabe wie im Express-MVC-Muster: Er sitzt an der Außengrenze der Anwendung, empfängt eingehende HTTP-Anfragen und gibt Antworten zurück. Was sich ändert, ist die Struktur des Codes innerhalb des Controllers. Wie bereits besprochen, nutzt NestJS Dekoratoren, um einen Großteil seiner Struktur zu definieren. Jede Controller-Klasse und jede Handler-Methode erhält einen Dekorator, der dem Framework mitteilt, welche HTTP-Methode und welchen URL-Pfad sie verarbeitet.

## Routen-Dekoratoren

Der Dekorator `@Controller("base-path")` markiert eine Klasse als Controller und legt ihren Basispfad fest. Methoden-Dekoratoren innerhalb der Klasse wie `@Get()`, `@Post()`, `@Patch()` oder `@Delete()` entsprechen ihren HTTP-Äquivalenten und werden an diesen Basispfad angehängt:

```typescript
import { Controller, Get, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(): User[] {
    return this.userService.getAllUsers();
  }

  @Get("random")
  getRandom(): User {
    return this.userService.getRandomUser();
  }
}
```

- `@Controller("users")` legt den Basispfad fest – jede Route in dieser Klasse beginnt mit `/users`
- `@Get()` ohne Argument mappt auf `GET /users`
- `@Get("random")` mappt auf `GET /users/random`

## Parameter-Dekoratoren

Um Daten aus der Anfrage zu extrahieren, stellt NestJS dedizierte Dekoratoren für jeden Anwendungsfall bereit. Diese Dekoratoren unterscheiden sich etwas von den bisher bekannten: Statt eine Klasse oder Methode zu dekorieren, werden sie vor einen Parameter eines Route-Handlers gesetzt. Sie fügen diesem Parameter eine zusätzliche Funktionalität hinzu – in diesem Fall wird der Wert des entsprechenden Anfrageteils in den Parameter injiziert.

`@Param("id")` in Kombination mit `@Get(":id")` extrahiert ein benanntes Segment – hier `id` – aus dem URL-Pfad:

```typescript
@Get(":id")
getById(@Param("id") userId: string): User {
  console.log(userId) // id = "42" für GET /users/42
}
```

`@Body()` extrahiert den geparsten JSON-Body aus einer POST-, PUT- oder PATCH-Anfrage:

```typescript
@Post()
createUser(@Body() user: UserPayload): User {
  return this.userService.createUser(user);
}
```

`@Query("search")` extrahiert einen Query-String-Wert:

```typescript
@Get()
searchUsers(@Query("search") search: string): User[] {
  console.log(search) // search = "alice" für GET /users?search=alice
}
```

Wichtig: Die Parameter der Handler-Methode können beliebig benannt werden – entscheidend ist nur der vorangestellte Dekorator.

## Vollständiges Beispiel

Ein Controller, der Lese- und Schreibzugriffe auf eine einzelne Ressource verwaltet, verwendet alle diese Dekoratoren zusammen:

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./interfaces/user.interface";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(): User[] {
    return this.userService.getAllUsers();
  }

  @Get(":id")
  getOne(@Param("id") id: string): User {
    const user = this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  @Post()
  create(@Body() body: UserPayload): User {
    return this.userService.addNewUser(body.name, body.email);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Partial<UserPayload>): User {
    const updated = this.userService.updateUser(id, body.name, body.email);
    if (!updated) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return updated;
  }

  @Delete(":id")
  remove(@Param("id") id: string): { message: string } {
    const deleted = this.userService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return { message: `User with ID "${id}" deleted.` };
  }
}
```

`NotFoundException` wird aus `@nestjs/common` importiert. Wird sie geworfen, sendet NestJS automatisch eine 404-Antwort – ohne weitere Konfiguration.

## Weiterführende Links

- [NestJS Controller – offizielle Dokumentation](https://docs.nestjs.com/controllers)
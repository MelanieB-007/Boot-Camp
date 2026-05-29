# NestJS Auth – Routen mit Guards schützen

Das vorherige Kapitel hat das Auth-Modul aufgebaut: einen Login-Endpunkt, der signierte JWTs ausstellt, und eine `JwtStrategy`, die sie verifiziert. Aber aktuell akzeptiert jede Route der Anwendung noch immer jede Anfrage. Das lässt sich ändern, indem Guards zu den Routen hinzugefügt werden.

Ein Guard ist eine Klasse, die vor einem Route-Handler läuft und entscheidet, ob die Anfrage durchgelassen wird. Guards sitzen im NestJS-Request-Lebenszyklus zwischen Middleware und Interceptors. Sie haben Zugriff auf den vollständigen Ausführungskontext, was bedeutet, dass sie die Anfrage inspizieren, an den Route-Handler oder Controller angehängte Metadaten lesen und Entscheidungen auf Basis beider treffen können.

## `canActivate()`

Jeder Guard implementiert eine einzige Methode: `canActivate(context: ExecutionContext)`. Gibt diese Methode `true` zurück, wird die Anfrage fortgesetzt. Gibt sie `false` zurück, sendet NestJS eine `403 Forbidden`-Antwort. Wirft sie eine Ausnahme (am häufigsten eine `UnauthorizedException`), antwortet NestJS mit dem entsprechenden Statuscode – in diesem Fall `401 Unauthorized`.

`ExecutionContext` gibt Zugriff auf die zugrunde liegende HTTP-Anfrage. Bei HTTP-Anwendungen ist das ein Express-Request-Objekt, sodass du Header, Body, Params und von Middleware gesetzte Properties lesen kannst.

Hier ist ein einfacher eigener Guard, der prüft, ob der authentifizierte Nutzer eine Admin-Rolle hat:

```typescript
// src/common/guards/is-admin.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user?.roles?.includes("admin") ?? false;
  }
}
```

`false` zurückzugeben reicht aus, um die Anfrage mit einer `403`-Antwort zu blockieren. Beachte, dass er `request.user` liest – was voraussetzt, dass ein vorheriger Guard den Nutzer bereits authentifiziert und diese Daten an die Anfrage angehängt hat.

## JwtAuthGuard

`JwtAuthGuard` ist NestJS's Brücke zwischen einem Guard und einer Passport-Strategie. Er erweitert `AuthGuard('jwt')`, wobei der String `'jwt'` die im vorherigen Kapitel konfigurierte `JwtStrategy` benennt. Wenn eine Anfrage eintrifft, übergibt der Guard an diese Strategie, die das Token extrahiert und verifiziert. Ist das Token gültig, läuft `JwtStrategy.validate()` und sein Rückgabewert wird an `req.user` angehängt. Fehlt das Token oder ist es ungültig, wirft der Guard `UnauthorizedException`.

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

Da `JwtAuthGuard` `AuthGuard('jwt')` erweitert, verarbeitet er die JWT-Authentifizierung automatisch über die im vorherigen Kapitel konfigurierte `JwtStrategy`. Es gibt nichts weiter zu konfigurieren; alles andere ist durch `AuthGuard('jwt')` vordefiniert.

Wende ihn mit `@UseGuards()` auf eine Route an:

```typescript
// src/quotes/quotes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { QuotesService } from "./quotes.service";
import { CreateQuoteDto } from "./dto/create-quote.dto";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto, @Request() req) {
    return this.quotesService.create(createQuoteDto, req.user.userId);
  }
}
```

`GET /quotes` ist offen, da kein Guard angewendet wird. `POST /quotes` ist geschützt: Der Guard läuft vor `create()`, und `req.user` enthält die Nutzerdaten aus `JwtStrategy.validate()`: `userId`, `username` und `roles`.

> Wir haben im vorherigen Kapitel bereits einen Guard verwendet. Im `AuthController` haben wir die Local-Strategie mit `@UseGuards(AuthGuard("local"))` hinzugefügt.

## Globaler Guard

`@UseGuards(JwtAuthGuard)` auf jede geschützte Route anzuwenden funktioniert, wird aber mit wachsender Anwendung repetitiv. NestJS ermöglicht die globale Registrierung eines Guards, sodass er automatisch auf jede Route angewendet wird.

Die korrekte Methode dafür, wenn der Guard Abhängigkeiten hat (wie `Reflector`, der im nächsten Abschnitt verwendet wird), ist der `APP_GUARD`-Provider-Token im `AppModule`:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Module({
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
```

Mit einem globalen Guard erfordert standardmäßig jede Route ein gültiges JWT. Das gilt auch für den Login-Endpunkt, der offensichtlich kein Token benötigen darf, um ihn zu erreichen. Der `@Public()`-Decorator löst das Problem.

## Der `@Public`-Decorator

`@Public()` ist ein eigener Decorator, der bestimmte Routen als vom globalen Guard ausgenommen markiert. Er funktioniert, indem er Metadaten an den Route-Handler anhängt. Der Guard liest diese Metadaten bei jeder Anfrage und überspringt die Token-Prüfung, wenn sie vorhanden sind.

Den Decorator erstellen:

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

`SetMetadata` hängt ein Schlüssel-Wert-Paar an die Metadaten des Route-Handlers an. Der Guard liest diesen Schlüssel, um zu entscheiden, ob mit der Authentifizierung fortgefahren wird.

`JwtAuthGuard` aktualisieren, damit er vor der Token-Verifizierung die Metadaten prüft:

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

`getAllAndOverride` prüft sowohl die Metadaten auf Methoden- als auch auf Klassenebene und gibt den ersten gefundenen Wert zurück. Wenn `isPublic` `true` ist, gibt die Methode sofort `true` zurück – die Token-Prüfung wird vollständig übersprungen. Für alle anderen Routen führt `super.canActivate(context)` die Standard-JWT-Verifizierung durch.

`@Public()` auf Routen anwenden, die keine Authentifizierung erfordern sollen:

```typescript
// src/quotes/quotes.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";
import { QuotesService } from "./quotes.service";
import { CreateQuoteDto } from "./dto/create-quote.dto";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.quotesService.findOne(id);
  }

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto, @Request() req) {
    return this.quotesService.create(createQuoteDto, req.user.userId);
  }
}
```

Jetzt sind `GET /quotes` und `GET /quotes/:id` als öffentlich markiert. `POST /quotes` hat keinen `@Public()`-Decorator, daher greift der globale `JwtAuthGuard` und die Anfrage muss ein gültiges JWT mitführen.

Derselbe `@Public()`-Decorator kommt auf den Login-Endpunkt im `AuthController`, da der Nutzer vor dem Login noch kein Token haben kann.
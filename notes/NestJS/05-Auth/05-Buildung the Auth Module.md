# NestJS Auth – Das Auth-Modul aufbauen

Eine NestJS-Anwendung verwaltet die Authentifizierung über ein dediziertes `AuthModule`. Dieses Modul ist der einzige Ort, an dem die Login-Logik lebt. Es validiert Anmeldedaten, stellt Tokens aus und definiert die Regeln, nach denen eingehende JWTs bei geschützten Anfragen überprüft werden.

NestJS delegiert die Mechanik der Authentifizierung an Passport, eine Node.js-Authentifizierungsbibliothek. Passport arbeitet mit austauschbaren Strategien; jede Strategie ist eine Klasse, die definiert, wie eine bestimmte Art von Anmeldedaten behandelt werden soll. In dieser Einheit werden zwei verwendet:

- **`LocalStrategy`** läuft einmalig beim Login. Sie empfängt den vom Client übermittelten Benutzernamen und das Passwort und validiert sie gegen die Datenbank.
- **`JwtStrategy`** läuft bei jeder nachfolgenden Anfrage an eine geschützte Route. Sie extrahiert das JWT aus dem Anfrage-Header, überprüft die Signatur und gibt die Nutzerdaten zurück, die als `req.user` im Route-Handler verfügbar werden.

Die zwei Strategien behandeln verschiedene Momente desselben Ablaufs: Der Nutzer beweist einmalig, wer er ist (`LocalStrategy`), und danach vertraut der Server bei jeder Folgeanfrage dem signierten Token (`JwtStrategy`), ohne die Datenbank erneut zu befragen.

## Paketinstallation

Erforderliche Pakete installieren:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-local passport-jwt
npm install --save-dev @types/passport-jwt @types/passport-local
```

- `@nestjs/jwt` stellt `JwtService` bereit, das Tokens signiert und verifiziert.
- `@nestjs/passport` ist der NestJS-Adapter für Passport.
- `passport` ist die Basisbibliothek.
- `passport-local` ist die Strategie für Benutzername/Passwort-Login.
- `passport-jwt` ist die Strategie für JWT-Verifizierung.
- Die entsprechenden `@types`-Pakete liefern TypeScript-Typdefinitionen und werden nur während der Entwicklung benötigt.

Auth-Modul, Service und Controller generieren:

```bash
nest g module auth
nest g service auth
nest g controller auth
```

## AuthModule-Konfiguration

Das `AuthModule` enthält alle Authentifizierungskomponenten: den `AuthService` zum Überprüfen von Anmeldedaten und Ausstellen von Tokens, `LocalStrategy` für den Login und `JwtStrategy` für nachfolgende Anfragen sowie den Controller und die Auth-Endpunkte. All das existiert noch nicht – wir erstellen es in den nächsten Schritten. `AuthModule` importiert außerdem die Bibliotheksmodule `PassportModule` und `JwtModule`.

```typescript
// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

`JwtModule.register()` nimmt zwei Konfigurationswerte entgegen:

- **`secret`**: Der Schlüssel zum Signieren und Verifizieren von Tokens. Lies diesen immer aus einer Umgebungsvariablen; ein Secret im Quellcode zu hinterlegen ist ein Sicherheitsrisiko.
- **`signOptions.expiresIn`**: Wie lange ein Token gültig bleibt. Akzeptiert eine Anzahl von Sekunden oder einen String wie `'1d'` für einen Tag. Kürzere Werte verringern das Risiko, wenn ein Token gestohlen wird.

`UsersModule` wird importiert, damit `UsersService` innerhalb von `AuthService` injiziert werden kann. Beide Strategien sind als Provider aufgelistet, damit NestJS sie instanziieren und injizieren kann. `JwtModule` wird exportiert, damit andere Module `JwtService` bei Bedarf injizieren können.

## Den UserService erweitern

Unser `UserService` benötigt eine `findByUsername`-Methode, die von `LocalStrategy` verwendet wird:

```typescript
// src/users/users.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  // ...
  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }
}
```

## AuthService

`AuthService` hat zwei Aufgaben: Anmeldedaten überprüfen und Tokens ausstellen.

```typescript
// src/auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

`validateUser` ruft den Nutzer nach Benutzernamen ab und verwendet `bcrypt.compare`, um das übermittelte Passwort gegen den gespeicherten Hash zu prüfen. Passwörter müssen immer als bcrypt-Hashes gespeichert werden – niemals im Klartext. Bei erfolgreicher Validierung wird das Passwortfeld aus dem Ergebnis entfernt, bevor es an `req.user` angehängt wird.

`login` erstellt den JWT-Payload aus dem validierten Nutzer und signiert ihn mit `JwtService.sign()`. Der `sub`-Claim enthält die Datenbank-ID des Nutzers, entsprechend der JWT-Konvention, `sub` als Subject-Identifier zu verwenden.

## Authentifizierungsstrategien

Passport verwendet Strategien, um verschiedene Authentifizierungsabläufe zu verwalten. Jede Strategie ist eine Klasse, die definiert, wie eine bestimmte Art von Anmeldedaten behandelt werden soll. Wir benötigen zwei Strategien: eine „Local"-Strategie für den Login, die nicht von einem JWT abhängt (da das Token erst nach einem erfolgreichen Login generiert wird), und eine „JWT"-Strategie für nachfolgende Anfragen.

### LocalStrategy

`LocalStrategy` läuft, wenn eine Anfrage den Login-Endpunkt trifft. Sie ruft `AuthService.validateUser()` mit dem übermittelten Benutzernamen und Passwort auf. Schlägt die Validierung fehl, wirft sie `UnauthorizedException`. Bei Erfolg gibt sie das User-Objekt zurück, das Passport dann an `req.user` anhängt.

```typescript
// src/auth/local.strategy.ts
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return user;
  }
}
```

### JwtStrategy

`JwtStrategy` läuft bei jeder Anfrage an eine geschützte Route. Sie extrahiert das JWT aus dem `Authorization`-Header, überprüft die Signatur gegen dasselbe Secret, das zum Signieren verwendet wurde, und prüft den Ablaufzeitpunkt. Ist das Token gültig, wird die `validate()`-Methode mit dem dekodierten Payload aufgerufen. Der Rückgabewert wird im Route-Handler an `req.user` angehängt.

```typescript
// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
```

Die drei Konfigurationsoptionen:

- **`jwtFromRequest`**: Wo nach dem Token gesucht wird. `fromAuthHeaderAsBearerToken()` liest `Authorization: Bearer <token>`, was der Standardort ist.
- **`ignoreExpiration`**: Bei `false` werden Tokens, die ihren `exp`-Claim überschritten haben, automatisch abgelehnt. Im Produktivbetrieb immer auf `false` lassen.
- **`secretOrKey`**: Muss mit dem Secret in `JwtModule.register()` übereinstimmen.

`validate()` empfängt den bereits dekodierten Payload und gibt nur die Felder zurück, die Route-Handler benötigen: die ID, den Benutzernamen und die Rollen des Nutzers. Dieses gekürzte Objekt ist das, was `req.user` in jedem Handler enthält, der hinter einem JWT-Guard läuft.

> Mit `LocalStrategy` und `JwtStrategy` an Ort und Stelle kann das Auth-Modul Tokens ausstellen und verifizieren.

> Standardmäßig liest `passport-local` die Felder `username` und `password` aus dem Request-Body. Verwendet dein Login-Formular andere Feldnamen, übergib `usernameField` oder `passwordField` als Optionen an `super()`.

## AuthController

`AuthController` stellt den Login-Endpunkt bereit. Der Decorator `@UseGuards(AuthGuard('local'))` löst `LocalStrategy` aus, die die Anmeldedaten überprüft, bevor der Handler läuft (mehr zu AuthGuards im nächsten Kapitel). Bei Erfolg hängt der Guard das validierte User-Objekt als `req.user` an die Anfrage, und `AuthService.login()` gibt das signierte Token zurück.

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
```

`LoginDto` validiert den eingehenden Request-Body, bevor Passport ihn verarbeitet:

```typescript
// src/auth/dto/login.dto.ts
import { IsString, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

## Sicherheitsüberlegungen

Die Umgebungsvariable `JWT_SECRET` muss ein langer, zufällig generierter String sein. Ein kurzes oder erratbares Secret macht es möglich, gültige Tokens zu fälschen. Speichere es in einem Secrets-Manager oder einer Umgebungskonfiguration – nicht in versionskontrollierten Dateien.

Setze eine kurze Ablaufzeit für Tokens. Stunden statt Tage reduzieren den Schaden, wenn ein Token gestohlen wird. Für längere Sitzungen implementiere einen Refresh-Token-Flow: ein langlebiges, serverseitig gespeichertes Token, das gegen ein neues kurzlebiges Access-Token eingetauscht werden kann, ohne erneuten Login.

Passwörter müssen als bcrypt-Hashes mit einem Work-Factor von 10 oder höher gespeichert werden. bcrypt ist absichtlich langsam, was Brute-Force-Angriffe aufwendig macht. Verwende niemals MD5, SHA-1 oder SHA-256 für Passwörter.

Lass im Produktivbetrieb den gesamten Datenverkehr über HTTPS laufen. Ohne Transportverschlüsselung sind Tokens in `Authorization`-Headern für jeden auf dem Netzwerkpfad lesbar.
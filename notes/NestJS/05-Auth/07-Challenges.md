# NestJS Auth – Aufgaben

## Cyber Chat: JWT-Authentifizierung implementieren

Der aktuelle Chat hat keine Sicherheitsschicht. Jede Person, die die Endpunkte kennt, kann sie verwenden. Füge JWT-basierte Authentifizierung hinzu, um die API zu sichern.

Benötigte Pakete:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### Aufgabe 1: Ein User-Modul hinzufügen

- Modul, Service und Controller generieren: `nest g module users`, `nest g service users`, `nest g controller users`
- Eine `User`-Entity mit mindestens `id`, `username` (eindeutig) und `passwordHash` erstellen.
- Passwörter niemals im Klartext speichern. Vor dem Speichern mit `bcrypt` hashen (Salt-Rounds von 10 oder höher verwenden).
- Eine `createUser`-Service-Methode erstellen, die ein `CreateUserDto` mit den Feldern `username` und `password` akzeptiert.
- Eine `findByUsername(username: string)`-Methode auf `UsersService` bereitstellen, die das Auth-Modul nutzen kann. Diese aus `UsersModule` exportieren, damit andere Module sie injizieren können.
- Ein Response-DTO oder den `@Exclude()`-Decorator von `class-transformer` auf `passwordHash` verwenden, damit er niemals durch Serialisierung nach außen gelangt.

### Aufgabe 2: Ein Auth-Modul hinzufügen

- Modul, Service und Controller generieren: `nest g module auth`, `nest g service auth`, `nest g controller auth`
- `UsersModule` in `AuthModule` importieren, damit `UsersService` injiziert werden kann.
- `JwtModule` mit `registerAsync()` konfigurieren, sodass das Secret aus `ConfigService` kommt (nicht hartcodiert). Ein sinnvolles `expiresIn` wie `'1h'` setzen.
- Die Local- und JWT-Strategien erstellen:
    - Eine `LocalStrategy` erstellen, die `PassportStrategy(Strategy)` aus `passport-local` erweitert:
        - `ExtractJwt.fromBodyField('username')` verwenden.
        - Die `validate()`-Methode soll die Nutzerinformationen zurückgeben, die an `request.user` angehängt werden.
    - Eine `JwtStrategy` erstellen, die `PassportStrategy(Strategy)` aus `passport-jwt` erweitert:
        - `ExtractJwt.fromAuthHeaderAsBearerToken()` verwenden.
        - Die `validate()`-Methode soll die Nutzerinformationen zurückgeben, die an `request.user` angehängt werden.
- Den `AuthService` einrichten, um die Local- und JWT-Strategien zu nutzen:
    - Eine `validateUser`-Methode hinzufügen, die `username` und `password` akzeptiert und `UsersService.findByUsername()` aufruft.
    - Eine `login`-Methode hinzufügen, die `user` akzeptiert und `this.jwtService.sign()` aufruft.
- Den `AuthController` erstellen:
    - Einen `register`-Endpunkt erstellen, der ein `CreateUserDto` (`username`, `password`) mit class-validator validiert und `UsersService.create()` aufruft.
    - Einen `login`-Endpunkt erstellen, der ein `LoginDto` (`username`, `password`) mit class-validator validiert. Er soll `this.authService.login()` mit `req.user` aufrufen.
    - Den `login`-Endpunkt mit `@UseGuards(AuthGuard('local'))` dekorieren, um die Local-Strategie auszulösen.
    - Einen `me`-Endpunkt erstellen, der den authentifizierten Nutzer zurückgibt.

### Aufgabe 3: Routen mit Guards schützen

- Einen `JwtAuthGuard` erstellen, der `AuthGuard('jwt')` erweitert.
- Den Guard auf alle Chat-Endpunkte anwenden – entweder pro Controller oder pro Route – mit `@UseGuards(JwtAuthGuard)`.
- `POST /auth/login` muss die Local-Strategie verwenden, und der Registrierungsendpunkt `POST /auth/register` soll ungeschützt bleiben.

> **Tipp:** Wenn der Großteil deiner API geschützt sein soll, registriere `JwtAuthGuard` als globalen Guard in `AppModule` und verwende einen eigenen `@Public()`-Decorator mit `Reflector`, um bestimmte Endpunkte (Login, Registrierung) auszunehmen. Das ist sauberer als `@UseGuards` überall hinzustreuen.

### Aufgabe 4: Den Dummy-Autor durch den authentifizierten Nutzer ersetzen

- Thread- und Kommentar-Services aktualisieren, sodass der authentifizierte Benutzername statt eines Dummy-Autors verwendet wird. Methodenparameter bei Bedarf anpassen.
- Sicherstellen, dass nur Nutzer, denen ein Kommentar oder Thread gehört, ihn bearbeiten oder löschen können.

---

## Testen mit einem API-Client

Teste, ob du dich registrieren, einloggen und den authentifizierten Nutzer über deinen API-Client abrufen kannst.
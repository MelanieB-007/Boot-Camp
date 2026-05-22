# NestJS Basics 2 – Services

Controller übernehmen die HTTP-Grenze: Anfrage empfangen, Antwort zurückgeben. Ein Service hingegen besitzt die Geschäftslogik einer Domäne. Für die Benutzerverwaltung bedeutet das: wissen, wie ein Benutzer anhand seiner ID gefunden wird, wie einer erstellt wird und was zurückgegeben werden soll, wenn ein Update auf einen nicht vorhandenen Datensatz abzielt.

Der `UserService` weiter unten speichert die Benutzerliste in einem privaten Array. Der nächste Abschnitt stellt das Repository-Pattern vor und erklärt, warum der Datenzugriff schließlich eine eigene Klasse verdient.

## Der `@Injectable()`-Dekorator

NestJS verwaltet Service-Instanzen und injiziert sie dort, wo sie benötigt werden. Damit das funktioniert, muss die Klasse mit `@Injectable()` markiert sein:

```typescript
import { Injectable } from "@nestjs/common";
import { User } from "./interfaces/user.interface";

@Injectable()
export class UserService {
  private users: User[] = [
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
  ];

  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  addNewUser(name: string, email: string): User {
    const user: User = { id: Date.now().toString(), name, email };
    this.users.push(user);
    return user;
  }

  updateUser(id: string, name?: string, email?: string): User | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;
    if (name !== undefined) this.users[index].name = name;
    if (email !== undefined) this.users[index].email = email;
    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const before = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < before;
  }
}
```

`@Injectable()` registriert die Klasse als Provider im Dependency-Injection-Container von NestJS. Services, Repositories und Hilfsklassen sind allesamt Provider. Standardmäßig erstellt NestJS eine Instanz pro Modul und teilt sie mit allen Injektoren.

## Die Methoden im Überblick

Der Controller greift über folgende Methoden auf den `UserService` zu:

- `getAllUsers` gibt eine flache Kopie des Arrays zurück, damit Aufrufer den internen Zustand nicht verändern können
- `getUserById` gibt `undefined` zurück, wenn kein Treffer gefunden wird; der Controller behandelt das mit einer `NotFoundException`
- `addNewUser` generiert eine ID aus dem aktuellen Zeitstempel und hängt den Datensatz an
- `updateUser` wendet nur die Felder an, die tatsächlich übergeben wurden; gibt `undefined` zurück, wenn die ID nicht existiert
- `deleteUser` gibt `true` zurück, wenn ein Datensatz entfernt wurde, und `false`, wenn die ID nicht gefunden wurde

## Registrierung im Modul

Ein Service muss im `providers`-Array seines Moduls eingetragen sein:

```typescript
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
```

Ohne diesen Eintrag hat NestJS keinen Eintrag für `UserService` im Injektions-Scope des Moduls. Jede Klasse, die ihn als Konstruktorparameter deklariert, schlägt beim Start mit einem „cannot find provider"-Fehler fehl.

## Weiterführende Links

- [NestJS Providers – offizielle Dokumentation](https://docs.nestjs.com/providers)
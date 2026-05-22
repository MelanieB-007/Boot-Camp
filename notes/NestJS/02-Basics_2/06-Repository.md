# NestJS Basics 2 – Repositories

Ein Service, der Daten direkt liest und schreibt, kennt zwei Dinge gleichzeitig: die Geschäftsregeln der Anwendung und die Details der Datenspeicherung. Das Repository-Pattern trennt diese Verantwortlichkeiten. Ein Repository ist eine Klasse, die sich ausschließlich dem Datenzugriff für ein bestimmtes Modell widmet. Es stellt eine feste Menge an Methoden bereit – etwa `findAll`, `findById`, `create`, `update`, `delete` – und kümmert sich um alle Details des Lesens und Schreibens. Der Service ruft diese Methoden auf, ohne zu wissen, wie sie intern funktionieren.

## Abstraktion der Datenquelle

Ein Repository ist eine `@Injectable()`-Klasse. Wie Services wird es im `providers`-Array des Moduls registriert und über den Konstruktor in Services injiziert. Der Unterschied liegt in der Verantwortung: Ein Repository enthält keine Geschäftslogik – nur die Operationen, die zum Lesen und Schreiben von Daten notwendig sind.

Das folgende Beispiel refaktoriert den bisherigen Service in einen Service plus ein User-Repository:

```typescript
// src/users/user.repository.ts
import { Injectable } from "@nestjs/common";
import { User } from "./interfaces/user.interface";

@Injectable()
export class UserRepository {
  private users: User[] = [
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
  ];

  findAll(): User[] {
    return [...this.users];
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(data: UserPayload): User {
    const user: User = { id: Date.now().toString(), ...data };
    this.users.push(user);
    return user;
  }

  update(id: string, data: Partial<UserPayload>): User | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  delete(id: string): boolean {
    const before = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < before;
  }
}
```

## Verdrahtung von Service und Repository

Der Service erhält das Repository über Dependency Injection und ruft dessen Methoden auf – ohne jegliche Kenntnis des Speichermechanismus. Entscheidend ist, was im Service verbleibt: Eingabevalidierung, Konfliktauflösung und übergreifende Logik – etwa das Löschen von Posts und Sessions, die einem Benutzer zugeordnet sind, wenn dieser gelöscht wird:

```typescript
// src/users/user.service.ts
import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { User } from "./interfaces/user.interface";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  getAllUsers(): User[] {
    return this.userRepository.findAll();
  }

  getUserById(id: string): User | undefined {
    return this.userRepository.findById(id);
  }

  addNewUser(name: string, email: string): User {
    if (!name || name.trim().length < 2) {
      throw new ValidationError("Name must be at least 2 characters");
    }

    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    const existing = this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError(`User with email ${email} already exists`);
    }

    return this.userRepository.create({ name, email });
  }

  updateUser(id: string, name?: string, email?: string): User | undefined {
    if (name && name.trim().length < 2) {
      throw new ValidationError("Invalid name format");
    }

    if (email && !isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    return this.userRepository.update(id, { name, email });
  }

  deleteUser(id: string): boolean {
    this.postRepository.deleteByAuthor(id);
    this.sessionRepository.deleteByUser(id);
    return this.userRepository.delete(id);
  }
}
```

## Registrierung im Modul

Damit sowohl Service als auch Repository für die Injection verfügbar sind, müssen beide im `providers`-Array des Moduls registriert sein:

```typescript
// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UsersModule {}
```

## Weiterführende Links

- [Repository Pattern – Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
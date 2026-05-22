# NestJS Basics 2 – Module

Eine NestJS-Anwendung beginnt mit einem einzigen Modul namens `AppModule` und wächst von dort aus. NestJS-Module ermöglichen es, alles, was zu einer einzelnen fachlichen Domäne gehört – etwa Users, Products oder Orders – in eine in sich geschlossene Einheit zu gruppieren. Jedes Modul besitzt seine Controller, Services und Repositories. Der Speicherort einer Datei spiegelt das fachliche Konzept wider, zu dem sie gehört, nicht ihre technische Rolle. Dieser Ansatz wird als feature-basierte oder domänenbasierte Struktur bezeichnet und entspricht dem Designprinzip, nach dem das Modulsystem von NestJS für Skalierbarkeit ausgelegt ist.

## Feature-basierte Ordnerstruktur

Ein domänenbasiertes Projekt hat einen Ordner pro Feature, der jeweils das Modul, den Controller, den Service und alle weiteren zugehörigen Dateien des Features enthält:

```
src/
├── app.module.ts
├── main.ts
├── common/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── entities/
└── products/
    ├── products.module.ts
    ├── products.controller.ts
    ├── products.service.ts
    └── entities/
```

Der Ordner `common/` enthält anwendungsweite Hilfsmittel, die zu keiner spezifischen Domäne gehören. Alles andere liegt in seinem Feature-Ordner.

Jeder Feature-Ordner kann folgende Elemente enthalten:

- Eine **Modul-Datei**, die deklariert, was das Feature bereitstellt und was es von anderen Modulen importiert
- Einen **Controller**, der HTTP-Anfragen für diese Domäne verarbeitet
- Einen **Service**, der die Geschäftslogik für diese Domäne enthält
- Ein **Repository**, das den Datenzugriff für diese Domäne kapselt
- Einen **`entities/`-Unterordner** für die Datenmodelle dieser Domäne

## Imports und Exports

Module sind standardmäßig isoliert. Ein Service, der im `UsersModule` definiert ist, kann nicht in das `ProductsModule` injiziert werden, solange er nicht explizit freigegeben wird. Zwei Arrays im `@Module()`-Dekorator steuern dies:

- `exports` deklariert, welche eigenen Provider des Moduls anderen Modulen zur Verfügung gestellt werden
- `imports` deklariert, von welchen anderen Modulen das aktuelle Modul abhängt

Damit `UsersService` außerhalb des `UsersModule` verfügbar ist, muss er in `exports` aufgeführt werden:

```typescript
// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

Damit `ProductsModule` den `UsersService` nutzen kann, muss es `UsersModule` in `imports` aufführen:

```typescript
// src/products/products.module.ts
import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
```

Mit importiertem `UsersModule` kann das Dependency-Injection-System von NestJS den `UsersService` in jedem Provider innerhalb des `ProductsModule` auflösen. Wie gewohnt wird er als Konstruktorparameter deklariert, und NestJS stellt die Instanz bereit:

```typescript
// src/products/products.service.ts
import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class ProductsService {
  constructor(private readonly usersService: UsersService) {}

  getProductsWithOwners() {
    const users = this.usersService.getAllUsers();
    // ... Geschäftslogik
  }
}
```

Das Muster wiederholt sich für jedes Feature: Jedes Modul deklariert seine eigenen Provider, exportiert, was andere Module benötigen, und importiert, was es selbst benötigt. Der wichtigste Punkt dabei ist: Wenn ein Modul einen Provider oder Service aus einem anderen Modul benötigt, muss es das gesamte Modul importieren und den exportierten Provider verwenden.

## AppModule

Abschließend importiert das `AppModule` alle übergeordneten Feature-Module, um beim Start die vollständige Anwendung verfügbar zu machen:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Weiterführende Links

- [NestJS Module – offizielle Dokumentation](https://docs.nestjs.com/modules)
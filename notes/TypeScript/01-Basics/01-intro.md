# TypeScript Übersicht (Overview)

## Zusammenfassung (German Translation)
TypeScript existiert, um ein Problem zu lösen, auf das die meisten JavaScript-Entwickler irgendwann stoßen: Die Anwendung wächst, mehr Personen arbeiten am Code und Laufzeitfehler werden schwerer vorhersehbar. JavaScript ist dynamisch typisiert, daher werden viele Typfehler erst entdeckt, nachdem der Code ausgeführt wurde. TypeScript fügt eine statische Typisierung hinzu, sodass viele dieser Fehler bereits während des Schreibens – noch vor der Veröffentlichung – abgefangen werden. Es ist eine „Obermenge“ (Superset), was bedeutet, dass gültiges JavaScript weiterhin gültiges TypeScript ist. Du kannst nun jedoch die erwartete Struktur deiner Daten beschreiben und erhältst Feedback vom Compiler, wenn der Code von diesem „Vertrag“ abweicht.

In der Praxis führt TypeScript einen Build-Schritt ein. Du schreibst `.ts`-Dateien, und der TypeScript-Compiler (`tsc`) transpiliert diese in normales JavaScript. Während dieses Prozesses werden die Typ-Anmerkungen entfernt, sodass keine zusätzlichen Kosten zur Laufzeit entstehen. Der Browser oder Node.js führt weiterhin JavaScript aus, während TypeScript die Korrektheit während der Entwicklung verbessert. Dieser Kompromiss ist der Kernwert: Mehr Vertrauen beim Schreiben des Codes bei gleichem Ausführungsmodell zur Laufzeit.

Diese Sitzung konzentriert sich auf die Grundlagen der Einrichtung und Kompilierung. Du wirst sehen, wie man den Compiler installiert, die Umgebung überprüft und das Projektverhalten mit der `tsconfig.json` definiert. Außerdem wirst du Compiler-Optionen mit realen Ergebnissen verknüpfen: Wo kompilierte Dateien gespeichert werden, wie Module aufgelöst werden und wie strenge Prüfungen häufige Fehler verhindern. Schließlich betrachtest du die Kompilierung einzelner Dateien, die projektweite Kompilierung und den „Watch-Modus“, der eine schnelle Feedback-Schleife beim Programmieren unterstützt. Am Ende solltest du nicht nur die Befehle verstehen, sondern auch die Logik hinter dem TypeScript-Workflow.

---

### English Original
> "TypeScript exists to solve a problem most JavaScript developers eventually hit: your app grows, more people touch the codebase, and runtime errors become harder to predict. JavaScript is dynamically typed, so many type mistakes are only discovered after code is executed. TypeScript adds static typing on top of JavaScript, so many of those mistakes are caught while writing code, before shipping. It is a superset, which means valid JavaScript is still valid TypeScript, but now you can describe the expected shape of data and get compiler feedback when code drifts from that contract.
>
> In practice, TypeScript introduces a build step. You write .ts files, and the TypeScript compiler (tsc) transpiles them to plain JavaScript. During this process, type annotations are erased, so there is no runtime cost for using types. The browser or Node.js still runs JavaScript, while TypeScript improves correctness during development. That tradeoff is the core value: more confidence at authoring time, same execution model at runtime.
>
> This session focuses on the setup and compilation fundamentals that make the rest of TypeScript usable. You will see how to install the compiler, verify your environment, and define project behavior with tsconfig.json. You will also connect compiler options to real outcomes: where compiled files are written, how modules are resolved, and how strict checks prevent common mistakes. Finally, you will look at single-file compilation, project-wide compilation, and watch mode, which supports a tight feedback loop while coding. By the end, you should understand not just the commands, but the reasoning behind the TypeScript workflow."

---

## Wichtige Fachbegriffe aus diesem Text (Glossary)

| Englisch | Deutsch | Bedeutung im Kontext |
| :--- | :--- | :--- |
| **Runtime errors** | Laufzeitfehler | Fehler, die erst passieren, wenn das Programm bereits läuft. |
| **Dynamically typed** | Dynamisch typisiert | Typen werden erst zur Laufzeit bestimmt (JS Standard). |
| **Statically typed** | Statisch typisiert | Typen werden vorab festgelegt und vom Compiler geprüft. |
| **Transpile** | Transpilieren | Quellcode von einer Sprache in eine ähnliche umwandeln (TS zu JS). |
| **Type erasure** | Typ-Entfernung | Das Löschen der Typ-Informationen beim Umwandeln in JS. |
| **Watch mode** | Beobachtungsmodus | Der Compiler wartet auf Speichervorgänge und kompiliert sofort neu. |
| **Strict checks** | Strenge Prüfungen | Einstellungen, die TypeScript "pingeliger" machen, um mehr Fehler zu finden. |
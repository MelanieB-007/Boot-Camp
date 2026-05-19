# TypeScript Grundlagen (Basics)

## Was ist TypeScript?
TypeScript ist eine Programmiersprache, die auf JavaScript aufbaut, indem sie statische Typdefinitionen hinzufügt. Es ist eine „Obermenge“ von JavaScript, was bedeutet, dass jeder gültige JavaScript-Code auch gültiger TypeScript-Code ist. Der Hauptvorteil besteht darin, Fehler bereits während der Entwicklung zu finden, bevor der Code überhaupt ausgeführt wird.

### English Original
> "TypeScript is a programming language that builds on JavaScript by adding static type definitions. It is a superset of JavaScript, which means that any valid JavaScript code is also valid TypeScript code. The primary benefit is catching errors early in the development process before the code is even run."

---

## Statische vs. Dynamische Typisierung
In JavaScript (dynamisch) können Variablen ihren Typ jederzeit ändern. In TypeScript (statisch) legen wir den Typ einer Variable fest (z. B. Zahl oder Text). Wenn wir später versuchen, einen falschen Typ zu speichern, zeigt uns der Editor sofort einen Fehler an.

### Englisch Original
> "In JavaScript (dynamic), variables can change their type at any time. In TypeScript (static), we define the type of a variable (e.g., number or string). If we later try to store the wrong type, the editor immediately flags an error."

---

## Grundlegende Typen (Basic Types)

Hier sind die am häufigsten verwendeten Typen:

| Deutsch | Englisch | Beispiel Code |
| :--- | :--- | :--- |
| **Zeichenkette** | String | `let name: string = "Zoo-Manager";` |
| **Zahl** | Number | `let animals: number = 42;` |
| **Boolescher Wert** | Boolean | `let isOpen: boolean = true;` |
| **Array** | Array | `let list: number[] = [1, 2, 3];` |
| **Beliebig** | Any | `let data: any = "Könnte alles sein";` |

---

## Wichtige Fachbegriffe (Glossary)

* **Type Inference (Typ-Ableitung):** TypeScript erkennt oft von selbst, welchen Typ eine Variable hat, auch wenn du ihn nicht explizit hinschreibst.
* **Compiler:** Das Werkzeug, das deinen TypeScript-Code (`.ts`) in JavaScript-Code (`.js`) umwandelt, damit der Browser ihn versteht.
* **Type Safety (Typsicherheit):** Der Zustand, in dem das Programm garantiert, dass Variablen nur Werte enthalten, die ihrem definierten Typ entsprechen.

---

## Code Beispiele

```typescript
// Explizite Typisierung
let username: string = "Admin";

// Typ-Ableitung (Inference) - TS weiß, dass dies eine Zahl ist
let score = 100; 

// Fehler-Beispiel (TS würde hier meckern)
// score = "einhundert"; // Fehler: Type 'string' is not assignable to type 'number'.
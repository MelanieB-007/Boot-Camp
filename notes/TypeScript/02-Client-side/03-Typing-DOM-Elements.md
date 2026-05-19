# TypeScript Client-seitig – DOM-Elemente typisieren

Während TypeScript Typen aus deinem Code und externen Bibliotheken normalerweise präzise ableitet, sind Browser-APIs eine nennenswerte Ausnahme. Der Ausdruck `document.getElementById("username-input")` könnte zum Beispiel ein Input-Feld, ein `div`, einen Button oder irgendetwas anderes zurückgeben. Für TypeScript ist es unmöglich zu wissen, welches HTML-Element diese ID trägt. Die Methode ist so definiert, dass sie `HTMLElement | null` zurückgibt – das ist der breiteste zutreffende Typ, den TypeScript sicher vergeben kann.

Das Problem mit `HTMLElement` ist, dass er nur Eigenschaften enthält, die allen Elementen gemein sind. Er hat kein `.value` (das zu Input-Feldern gehört) und kein `.src` (das zu Bildern gehört). Den Ausdruck `element.value` auf einem `HTMLElement` zu lesen, verursacht einen Compiler-Fehler – selbst wenn du in deinem HTML eindeutig siehst, dass das Element ein Input-Feld ist.

## Type Assertions

Eine Type Assertion ermöglicht es dir, dem Compiler mitzuteilen, welchen konkreten Typ ein Wert tatsächlich hat. Du verwendest das Schlüsselwort `as` nach dem Wert, gefolgt vom Typ, den du angeben möchtest. Das ist eine Anweisung zur Kompilierzeit. TypeScript behandelt den Wert ab diesem Punkt als diesen Typ. Es findet keine Laufzeitprüfung statt – wenn die Assertion falsch ist, schlägt der Code stillschweigend fehl, ohne dass der Compiler warnt.

Ein einfaches Beispiel: Wenn eine Variable als `unknown` typisiert ist, du aber weißt, dass sie einen String enthält, kannst du sie als `string` assertieren, um auf String-Methoden zuzugreifen.

```ts
let myValue: unknown = "Hello, TypeScript!";
let strLength: number = (myValue as string).length;
```

Die Klammern um `myValue as string` stellen sicher, dass die Assertion auf den Wert angewendet wird, bevor auf die Eigenschaft zugegriffen wird. Ohne sie würde TypeScript versuchen, `.length` zu assertieren statt `myValue`.

## DOM-Element-Typen

Jeder HTML-Element-Typ hat ein entsprechendes TypeScript-Interface, z. B.:

- `HTMLInputElement`
- `HTMLButtonElement`
- `HTMLImageElement`

Wenn du ein Element aus dem DOM auswählst, assertiere es auf das Interface, das dem tatsächlichen Element in deinem HTML entspricht. Diese Interfaces erweitern das Basis-`HTMLElement` um Eigenschaften, die für den jeweiligen Element-Typ spezifisch sind:

```ts
const inputElement = document.getElementById(
  "username-input",
) as HTMLInputElement;
```

TypeScript behandelt `inputElement` dann als `HTMLInputElement`, wodurch Input-spezifische Eigenschaften wie `.value`, `.disabled` und `.placeholder` verfügbar werden.

Ohne die Assertion erzeugen beide Zeilen Compiler-Fehler, da diese Eigenschaften im Basis-Typ `HTMLElement` nicht existieren.

## Referenz: Element-Typen

Häufige HTML-Element-Typen und ihre wichtigsten Eigenschaften:

| Typ | Eigenschaften |
|-----|---------------|
| `HTMLInputElement` | `.value`, `.disabled`, `.type`, `.placeholder` |
| `HTMLButtonElement` | `.disabled`, `.textContent`, `.innerHTML` |
| `HTMLImageElement` | `.src`, `.alt`, `.width`, `.height` |
| `HTMLDivElement` | `.innerHTML`, `.textContent`, `.style` |
| `HTMLSelectElement` | `.value`, `.selectedIndex`, `.options` |
| `HTMLTextAreaElement` | `.value`, `.disabled`, `.placeholder` |

## Ressourcen

- [TypeScript-Handbuch: Type Assertions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#type-assertions)
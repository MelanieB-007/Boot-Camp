# TypeScript Client-seitig – Event Handler

Event-Listener empfangen ein Event-Objekt, wenn sie ausgelöst werden. TypeScript typisiert dieses Objekt als das generische `Event`-Interface oder in manchen Fällen sogar als das noch allgemeinere `EventTarget`. Der generische Typ enthält keine mausspezifischen Eigenschaften wie `clientX`, keine tastaturspezifischen Eigenschaften wie `key` und auch keine elementspezifischen Eigenschaften wie `.value` bei einem Input-Feld. Der Zugriff auf eine dieser Eigenschaften ohne vorherige Einschränkung des Typs verursacht einen Compiler-Fehler.

Die Lösung besteht darin, den Event-Parameter mit dem korrekten, spezifischen Event-Interface zu annotieren. TypeScript enthält eingebaute Interfaces für jeden Browser-Event-Typ. Die Annotierung eines Handlers mit `MouseEvent` gibt dem Compiler den vollständigen Eigenschaftssatz für Maus-Events; `KeyboardEvent` tut dasselbe für Tastatur-Events.

## Event-Typen

Die Event-Typ-Annotation wird auf den Event-Parameter innerhalb des Listener-Callbacks angewendet.

```ts
const button = document.getElementById("my-button") as HTMLButtonElement;

button.addEventListener("click", (event: MouseEvent) => {
  console.log(event.clientX);
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
  console.log(event.key);
});
```

Häufige Event-Interfaces:

| Interface | Verwendung |
|-----------|------------|
| `MouseEvent` | Klicks, Mausbewegung, Drag-Events |
| `KeyboardEvent` | `keydown`, `keyup`, `keypress` |
| `InputEvent` | Wertänderungen in Input-Elementen |
| `SubmitEvent` | Formular-Übermittlung |
| `FocusEvent` | `focus` und `blur` auf Elementen |

## Typisierte Event-Targets

Innerhalb eines Handlers zeigt `event.target` auf das Element, das das Event ausgelöst hat. TypeScript typisiert es als `EventTarget` – das allgemeinste Interface in der DOM-Hierarchie, das kaum elementspezifische Eigenschaften besitzt.

Wenn du auf eine Eigenschaft wie `.value` des auslösenden Elements zugreifen musst, verwende eine Type Assertion, um `event.target` auf den korrekten Element-Typ einzuschränken:

```ts
const input = document.getElementById("user-input") as HTMLInputElement;

input.addEventListener("input", (event: Event) => {
  const inputElement = event.target as HTMLInputElement;
  console.log(inputElement.value);
});
```

Die Assertion auf `event.target` weist den Compiler an, es als `HTMLInputElement` zu behandeln, wodurch `.value` zugänglich wird. Wie bei allen Type Assertions gilt: Das findet nur zur Kompilierzeit statt. Wenn das Target tatsächlich kein Input-Feld ist, tritt der Fehler erst zur Laufzeit auf.

## Der `this`-Kontext in Handlern

In einem regulären Funktionsausdruck (kein Arrow-Function) verweist `this` innerhalb eines Event-Listeners auf das Element, an dem der Listener angehängt ist. Arrow-Functions haben kein eigenes `this` und sind dann vorzuziehen, wenn der umgebende Scope eine Rolle spielt, z. B. innerhalb einer Klasse.

Wenn du einen Funktionsausdruck verwendest und TypeScript `this` als einen bestimmten Element-Typ erkennen soll, annotiere es als ersten Parameter. TypeScript entfernt diese Annotation zur Kompilierzeit; es wird kein echter Parameter hinzugefügt:

```ts
const container = document.getElementById("container");

container.addEventListener("click", function (this: HTMLDivElement, event: MouseEvent) {
  console.log(this.offsetWidth);
});
```

Dieses Muster ist in modernem Code selten. Arrow-Functions decken die meisten Handler-Fälle ab, ohne dass explizite `this`-Annotationen notwendig sind.

## Ressourcen

- [MDN: EventTarget](https://developer.mozilla.org/de/docs/Web/API/EventTarget)
- [MDN: Event-Referenz](https://developer.mozilla.org/de/docs/Web/Events)
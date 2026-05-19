# TypeScript Grundlagen - Typinferenz

Nach Typannotationen ist das nächste Konzept, das TypeScript schnell statt schwerfällig wirken lässt, die Typinferenz. Inferenz bedeutet, dass der Compiler einen Typ aus dem bereits geschriebenen Code ableitet, sodass nicht jeder einzelne Wert annotiert werden muss. Das löst ein praktisches Problem: Wenn man alles mechanisch annotiert, werden Dateien unübersichtlich und die wichtigen Verträge sind schwerer zu erkennen. Verlässt man sich hingegen auf Raten ohne Typinformationen, büßt man Sicherheit ein und verbringt mehr Zeit mit Debugging. Typinferenz liegt in der Mitte. Sie hält alltäglichen Code kompakt und bietet trotzdem Autovervollständigung, Fehlerprüfung und Refactoring-Unterstützung.

Das Entscheidende ist, dass die Inferenz verfolgt, was der Code tatsächlich tut – nicht was man beabsichtigt hat. Deshalb gehört dieses Thema direkt nach den Annotationen: Annotationen definieren Grenzen und Absicht, Inferenz reduziert Wiederholungen innerhalb dieser Grenzen. Einmal etabliert, verfolgt der Compiler den Typ eines Werts, ohne dass man ihn in jeder weiteren Zeile wiederholen muss. Funktionsparameter, Rückgabetypen und gemeinsam genutzte Datenmodelle annotiert man weiterhin dort, wo Klarheit am wichtigsten ist – offensichtliche lokale Werte überlässt man dem Compiler. Dieses Gleichgewicht zu erlernen hilft dabei, Code zu schreiben, der sowohl lesbar als auch sicher ist, ohne jede Datei in eine Wand aus Typsyntax zu verwandeln.

## Inferenz aus initialisierten Werten

Wenn eine Variable mit einem Anfangswert deklariert wird, leitet TypeScript ihren Typ aus diesem Wert ab.

```ts
let teamName = "Sunflower Helpers";
let activeVolunteers = 12;
const hasOpenSlots = true;
let catNames = ["Milo", "Nora", "Pico"];
```

Die abgeleiteten Typen sind hier eindeutig:

- `teamName` wird als `string` inferiert.
- `activeVolunteers` wird als `number` inferiert.
- `hasOpenSlots` wird als `boolean` inferiert.
- `catNames` wird als `string[]` inferiert.

Wird später ein nicht passender Wert zugewiesen, meldet der Compiler einen Fehler.

## Inferenz bei Funktionsrückgabewerten

TypeScript kann den Rückgabetyp einer Funktion aus dem zurückgegebenen Ausdruck ableiten.

```ts
function formatVolunteerBadge(id: number) {
  return `VOL-${id}`;
}
```

Der Rückgabetyp wird als `string` inferiert. Das ist praktisch, aber mit einem Vorbehalt: Die Inferenz prüft, was zurückgegeben wurde – nicht was zurückgegeben werden sollte. Wenn die Absicht des Rückgabetyps wichtig ist, sollte man ihn explizit annotieren, damit Vertragsverletzungen sofort erkannt werden.

## Inferenz in Callbacks

Besonders nützlich ist die Inferenz bei Array-Methoden, wo die Typen der Callback-Parameter aus dem Array abgeleitet werden.

```ts
const healthPoints = [12, 18, 25];
const boosted = healthPoints.map((hp) => hp + 5);
```

TypeScript inferiert:

- `hp` als `number` innerhalb des Callbacks.
- `boosted` als `number[]` aus dem Callback-Ergebnis.

Das hält Callback-Code kompakt, ohne Typsicherheit zu verlieren.

## Stellen, an denen die Inferenz Hilfe braucht

Die Inferenz kann keinen Typ bestimmen, wenn noch kein Wert vorhanden ist, und sie leitet Funktionsparametertypen nicht aus Aufrufstellen ab.

```ts
let nextShiftStart: number;

function assignPartner(name: string, partnerId: number) {
  return `${name}-${partnerId}`;
}
```

Der erste Fall ist eine nicht initialisierte Variable. Ohne Anfangswert hat TypeScript nichts, woraus es schließen könnte, und würde auf `any` zurückfallen – den unsichersten Typ, der die meisten Prüfungen deaktiviert. Eine explizite Annotation teilt dem Compiler mit, welchen Wert die Variable erwartungsgemäß enthalten soll, bevor ihr etwas zugewiesen wird.

Der zweite Fall sind Funktionsparameter. TypeScript schaut nicht auf Aufrufstellen, um zu erraten, was ein Parameter empfangen könnte. Jeder Parameter muss direkt annotiert werden, sonst hat der Compiler keine Möglichkeit zu prüfen, ob Aufrufer die richtigen Werte übergeben. Das ist so gewollt: Die Funktionssignatur ist der Vertrag und sollte für sich allein lesbar sein, ohne jeden Aufruf zu untersuchen.

## Inferenz vs. explizite Annotationen

Als praktische Faustregel gilt:

- Inferenz für offensichtliche lokale Werte und kurze Callback-Logik verwenden.
- Explizite Annotationen für Funktionsparameter und Rückgabetypen verwenden.
- Exportierte Objekte und gemeinsam genutzte Datenstrukturen über Dateigrenzen hinweg annotieren.

Diese Faustregel funktioniert gut in der Praxis, weil sie Annotationen dort platziert, wo sie am meisten zählen, und den Rest dem Compiler überlässt. Eine lokale Variable, die innerhalb einer Funktion berechnet wird, hat meist einen offensichtlichen Typ, den die Inferenz sauber handhabt. Die Ein- und Ausgabe einer Funktion hingegen ist das Erste, worauf Leser und Aufrufer schauen – diese explizit zu machen hält den Vertrag sichtbar, ohne dass jemand die Implementierung lesen muss. Exportierte Objekte und gemeinsame Modelle überschreiten Dateigrenzen, daher macht ihre Annotierung diese Verträge stabil, auch wenn sich die Implementierung später ändert.

## Ressourcen

- [TypeScript Handbuch - Typinferenz](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Handbuch - Alltagstypen](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
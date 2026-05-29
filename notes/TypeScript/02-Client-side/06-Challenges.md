# TypeScript Client-Side – Aufgaben

## Code Along – Buchsuche

Erstelle eine kleine Buchsuche-App, die die Open Library API abfragt und Ergebnisse im Browser rendert. Jeder Schritt baut auf demselben Projekt auf.

### Setup

Ein Projekt mit folgender Struktur erstellen:

```
book-search/
  index.html
  src/
    main.ts
  tsconfig.json
```

Dieses HTML in `index.html` einfügen:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Book Search</title>
  </head>
  <body>
    <form id="search-form">
      <input name="query" type="text" placeholder="Enter a book title" />
      <button>Search</button>
    </form>
    <ul id="book-list"></ul>
  </body>
</html>
```

### Schritt 1: TypeScript für den Browser konfigurieren

Eine `tsconfig.json` schreiben mit:
- `lib: ["dom", "esnext"]`, damit `document` und andere Browser-Globals erkannt werden.
- `ESNext` als sowohl `target` als auch `module`.

Einen `<script type="module">`-Tag zu `index.html` hinzufügen, der `dist/main.js` lädt.

Zum Testen: `console.log("ready")` in `src/main.ts` schreiben, `tsc` ausführen, `index.html` im Browser öffnen.

### Schritt 2: DOM-Elemente auswählen und typisieren

Formular und Liste aus dem HTML mit `document.getElementById` auswählen. Jedes auf den korrekten element-spezifischen Typ assertieren.

### Schritt 3: Auf das Such-Event horchen

Einen `"submit"`-Listener zum Formular hinzufügen. Im Callback den Event-Parameter mit dem korrekten Submit-Event-Typ annotieren.

Die Standard-Formularübermittlung verhindern und das Formularelement aus `event.target` extrahieren. Auf `HTMLFormElement` assertieren.

Den Eingabewert über `FormData` abrufen. Entweder `get("query")` verwenden oder mit `Object.fromEntries` über die Formulardaten iterieren.

Den Eingabewert in der Konsole ausgeben.

`tsc` ausführen, den Browser neu laden, etwas eintippen, auf den Button klicken und die Konsole prüfen.

### Schritt 4: Einen Datenshape definieren und Bücher abrufen

Der DBooks API-Such-Endpunkt gibt JSON in dieser Form zurück:

```json
{
  "status": "ok",
  "total": "87",
  "books": [
    {
      "id": "3030168778",
      "title": "Programming for Computations - Python",
      "subtitle": "A Gentle Introduction to Numerical Simulations with Python 3.6",
      "authors": "Svein Linge, Hans Petter Langtangen",
      "image": "https://www.dbooks.org/img/books/3030168778s.jpg",
      "url": "https://www.dbooks.org/programming-for-computations-python-3030168778/"
    }
  ]
}
```

Zwei Interfaces definieren: `Book` für einen einzelnen Eintrag und `SearchResult` für die vollständige Antwort, die das Buch-Array unter `books` enthält.

Eine async-Funktion `fetchBooks(term: string): Promise<Book[]>` schreiben. Sie soll von `https://www.dbooks.org/api/search/{query}` abrufen und die geparsten Daten mit einer Typassertion zurückgeben.

Sie aus dem Klick-Handler aufrufen. Für jedes Buch ein `<li>` zum `book-list`-Element hinzufügen, das den Titel und den ersten Autornamen anzeigt.

---

## Text bei Button-Klick aktualisieren

**Ziel:** Eine Nachricht anzeigen, wenn ein Button geklickt wird.

**HTML**
```html
<button id="helloBtn">Say Hello</button>
<p id="output"></p>
```

**Aufgabe**

In `main.ts`:
- Button und Absatz auswählen.
- Einen Klick-Listener zum Button hinzufügen.
- Den Text des Absatzes auf `"Hello from TypeScript!"` setzen.

---

## Eingabe erfassen und anzeigen

**Ziel:** Benutzereingaben erfassen und auf dem Bildschirm anzeigen.

**HTML**
```html
<input type="text" id="nameInput" placeholder="Enter name" />
<button id="submitBtn">Submit</button>
<p id="displayName"></p>
```

**Aufgabe**
- Eingabewert beim Klicken des Buttons abrufen.
- Den Namen im Absatz anzeigen.

---

## Sichtbarkeit umschalten

**Ziel:** Einen Absatz mit einem Button-Klick ein- oder ausblenden.

**HTML**
```html
<button id="toggleBtn">Toggle</button>
<p id="hiddenText">Now you see me!</p>
```

**Aufgabe**
- Beim Klick die Sichtbarkeit des Absatzes mit `.style.display` umschalten.

---

## Elemente zu einer Liste hinzufügen

**Ziel:** Listenelemente dynamisch basierend auf Eingaben hinzufügen.

**HTML**
```html
<input type="text" id="itemInput" />
<button id="addBtn">Add Item</button>
<ul id="itemList"></ul>
```

**Aufgabe**
- Den Eingabetext bei jedem Klick auf den Button als neues `<li>` zur Liste hinzufügen.

---

## Elemente aus einer Liste löschen

**Ziel:** Neben jedem Listenelement einen Löschen-Button hinzufügen und beim Klick entfernen.

**Aufgabe**
- Die vorherige Aufgabe erweitern.
- Beim Hinzufügen eines Elements daneben einen „Löschen"-Button einfügen.
- Ein Klick auf „Löschen" entfernt das jeweilige `<li>`.

---

## Zähler mit Erhöhen und Verringern

**Ziel:** Eine Zähler-App mit „+"-  und „−"-Buttons erstellen.

**HTML**
```html
<button id="decreaseBtn">-</button>
<span id="counter">0</span>
<button id="increaseBtn">+</button>
```

**Aufgabe**
- Den Zähler beim Klick auf den jeweiligen Button erhöhen oder verringern.

---

## Hintergrundfarbe ändern

**Ziel:** Die Hintergrundfarbe eines `div` über ein Dropdown ändern.

**HTML**
```html
<select id="colorSelect">
  <option value="white">White</option>
  <option value="lightblue">Light Blue</option>
  <option value="lightgreen">Light Green</option>
</select>
<div
  id="colorBox"
  style="width:100px; height:100px; border:1px solid black;"
></div>
```

**Aufgabe**
- Die Hintergrundfarbe von `colorBox` basierend auf der ausgewählten Option ändern.

---

## Zeichenanzahl

**Ziel:** Eine Echtzeit-Zeichenanzahl aus einem Textbereich anzeigen.

**HTML**
```html
<textarea id="textInput"></textarea>
<p id="charCount">0 characters</p>
```

**Aufgabe**
- Bei jeder Eingabe den Zeichenanzahl-Absatz aktualisieren.

---

## Bonus-Aufgabe: To-Do-App

**Ziel:** Eine einfache To-Do-Liste erstellen mit der Möglichkeit:
- Aufgaben hinzuzufügen
- Sie als erledigt zu markieren
- Aufgaben zu entfernen

**HTML**
```html
<input id="todoInput" placeholder="New task" />
<button id="addTodo">Add</button>
<ul id="todoList"></ul>
```

**Aufgabe**
- Neue Listenelemente mit dem Eingabetext hinzufügen.
- Jedes Element hat:
    - Eine Checkbox, um es als erledigt zu markieren.
    - Einen Löschen-Button.
- Erledigte Einträge mit Durchstreichung stylen.
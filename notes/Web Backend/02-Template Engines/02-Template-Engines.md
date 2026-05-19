# Backend Template-Engines – Template-Engines

Beim Aufbau statischer Websites durch das einfache Ausliefern verschiedener HTML-Seiten beginnt man sich sehr schnell zu wiederholen. Jede Seite benötigt dasselbe Layout, identische HTML-Fragmente werden über Dateien hinweg kopiert, und bedingte Formatierungen für einzelne Elemente werden schnell zur Herausforderung. Template-Engines sind eine leichtgewichtige Lösung für dieses Problem.

Template-Engines lagern das HTML in separate Dateien aus, die – wie der Name schon andeutet – als Templates bezeichnet werden. Ein Template sieht aus wie HTML, enthält aber spezielle Platzhalter für die Werte, die der Server bereitstellt. Beim Rendern füllt die Engine diese Platzhalter aus und gibt einen fertigen String zurück. Der JavaScript- (bzw. in unserem Fall TypeScript-)Code kümmert sich um die Daten; die Template-Datei übernimmt die Darstellung. Mit dieser Trennung bleiben Layout-Änderungen in den Template-Dateien, wo sie hingehören, und der Server-Code muss nichts mehr darüber wissen, wie eine Seite aussieht.

Es gibt ein ganzes Ökosystem von Template-Engines, aber die grundlegenden Ideen und Konzepte sind sehr ähnlich. In dieser Einheit verwenden wir Nunjucks, um diese Konzepte zu veranschaulichen.

## Template-Syntax

Jede Template-Engine verwendet Trennzeichen, um der Engine mitzuteilen, welche Teile der Datei Anweisungen sind und welche reines HTML. Nunjucks verwendet zwei:

- `{{ ausdruck }}` – gibt den Wert einer Variable oder eines Ausdrucks aus. `{{ title }}` gibt den Wert der Variable `title` aus; `{{ price * 1.2 }}` gibt das Ergebnis der Berechnung aus.
- `{% tag %}` – führt eine Kontrollflussanweisung wie `for`, `if` oder `block` aus. Diese Tags erzeugen keine direkte Ausgabe; sie steuern, welche Teile des Templates gerendert werden und wie oft.

```html
<h1>{{ title }}</h1>
<ul>
  {% for item in items %}
  <li>{{ item }}</li>
  {% endfor %}
</ul>
```

`{{ title }}` wird durch den Wert von `title` ersetzt. Der `{% for %}`-Block rendert ein `<li>` pro Element im `items`-Array.

## Komponenten in Template-Engines

Ein weiteres verbreitetes Konzept ist die Idee einer Komponente. Eine Komponente ist ein wiederverwendbarer HTML-Block, der an mehreren Stellen eingesetzt werden kann. Template-Engines machen es einfach, diese wiederverwendbaren Code-Bausteine zu erstellen. In Nunjucks heißen Komponenten Macros.

```html
{% macro Card(title, content) %}
<div class="card">
  <h2>{{ title }}</h2>
  <p>{{ content }}</p>
</div>
{% endmacro %}
```

## Template-Engines in verschiedenen Sprachen

Template-Engines gibt es für jede wichtige serverseitige Sprache. Die Syntax unterscheidet sich, aber das Modell ist dasselbe: eine Template-Datei mit Platzhaltern, die die Engine zur Laufzeit ersetzt.

| Engine       | Sprache              | Hinweise                                              |
|--------------|----------------------|-------------------------------------------------------|
| Nunjucks     | JavaScript (Node.js) | Nach Jinja2 modelliert; wird in dieser Einheit verwendet |
| Jinja2       | Python               | Standard in Flask und Django                          |
| EJS          | JavaScript           | Bettet JavaScript direkt in HTML ein                  |
| Pug          | JavaScript           | Einrückungsbasiert; keine schließenden Tags           |
| Twig         | PHP                  | Ähnliche Syntax wie Jinja2                            |
| Thymeleaf    | Java                 | Wird mit Spring verwendet; Templates sind gültiges HTML |
| Handlebars   | JavaScript           | Begrenzt Logik in Templates bewusst                   |

## Ressourcen

- [Nunjucks-Dokumentation](https://mozilla.github.io/nunjucks/)
# Backend-Grundlagen und Express – API-Clients

## Warum API-Clients?
Während der Backend-Entwicklung müssen Sie testen, ob Ihr Server Anfragen korrekt verarbeitet. Ein Browser ermöglicht zwar den Aufruf von URLs, deckt jedoch nur `GET`-Anfragen ab. Sie können keine `POST`-Anfragen mit einem JSON-Body senden, keine benutzerdefinierten Header setzen oder die vollständige Antwort inspizieren, indem Sie einfach eine URL in die Adresszeile eingeben. Sie benötigen ein Werkzeug, das Ihnen die Kontrolle über jeden Teil einer **HTTP-Anfrage** gibt.

Entwickler-Tools wie **Postman** oder **Bruno**, im Folgenden als „API-Clients“ bezeichnet, sind Desktop-Anwendungen, die als HTTP-Client fungieren. Sie wählen eine Methode, geben eine URL ein, konfigurieren optional Header oder einen Request-Body und senden die Anfrage ab. Das Tool zeigt die vollständige Antwort an: **Statuscode, Header und Body**, inklusive Syntax-Hervorhebung, die JSON leicht lesbar macht.

Da wir noch kein Frontend haben, werden Sie einen API-Client verwenden, um mit Ihren APIs zu interagieren. Er ermöglicht es Ihnen, die Client-Seite zu simulieren, sodass Sie sich rein auf das Backend konzentrieren können: Beobachten, was der Server empfängt, wie er die Daten verarbeitet und was er zurückgibt.

## Eine Anfrage senden
Eine Anfrage in einem API-Client entspricht direkt der HTTP-Anforderungsstruktur:

*   **Methoden-Auswahl**: Ein Dropdown-Menü oben im Tab. Standard ist `GET`. Ändern Sie dies je nach Operation: `GET` zum Lesen, `POST` zum Erstellen, `PUT` oder `PATCH` zum Aktualisieren, `DELETE` zum Löschen.
*   **URL-Leiste**: Geben Sie hier die vollständige Adresse des Endpunkts ein, z. B. `http://localhost:4730/books`.
*   **Headers-Tab**: Hier können Sie Request-Header hinzufügen oder ändern. Viele Clients setzen gängige Header (wie `Content-Type` bei JSON) automatisch.
*   **Body-Tab**: Hier geben Sie Daten für `POST`-, `PUT`- und `PATCH`-Anfragen an. Wählen Sie „raw“ und das Format „JSON“, um einen JSON-Payload zu schreiben. Bei `GET` und `DELETE` bleibt der Body normalerweise leer.

Nach dem Klick auf **Send** zeigt das Tool die Antwort in einem separaten Bereich an:
1. Den **Statuscode** (z. B. `200 OK` oder `404 Not Found`).
2. Den **Response-Body** mit Syntax-Highlighting.
3. Die **Response-Header** und die benötigte Zeit.



## Kollektionen (Collections)
Eine Kollektion ist ein benannter Ordner, der zusammengehörige Anfragen gruppiert. Wenn Sie an einer Buchladen-API arbeiten, könnten Sie eine Kollektion „Bookstore“ mit Anfragen wie „Alle Bücher abrufen“, „Buch erstellen“ usw. anlegen.

Kollektionen dienen zwei Zwecken:
*   **Organisation**: Sie müssen Testanfragen nicht jede Sitzung neu erstellen.
*   **Dokumentation**: Jeder, der die Kollektion öffnet, sieht sofort, welche Endpunkte unterstützt werden und welche Daten gesendet werden müssen.

## Wahl des API-Clients
Für die kommenden Aufgaben sollten Sie sich für einen der folgenden Clients entscheiden:

### Postman
Ein weit verbreiteter Client mit polierter Benutzeroberfläche.
*   **Voraussetzung**: Erfordert die Erstellung eines Accounts.
*   **Sharing**: Nutzt Cloud-Sync zum Teilen von Kollektionen in Teams.

### Bruno
Ein moderner Open-Source-API-Client.
*   **Besonderheit**: Speichert Kollektionen als einfache Dateien auf Ihrem Dateisystem. Dies ermöglicht es, Kollektionen direkt mit dem Code im Git-Repository zu speichern und zu teilen.
*   **Vorteile**: Arbeitet vollständig offline, benötigt keinen Account und ist Open Source.
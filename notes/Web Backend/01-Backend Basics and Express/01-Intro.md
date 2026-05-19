# Übersicht: Grundlagen der Backend-Entwicklung

Jede Webanwendung besteht aus zwei wesentlichen Seiten:

*   **Das Frontend**: Dies ist die Seite, die Benutzer im Browser sehen und mit der sie interagieren. Dazu gehören Schaltflächen, Formulare und Layouts, die mittels **HTML** und **CSS** dargestellt werden.
*   **Das Backend**: Ein separates Programm, das auf einem Server läuft. Es verarbeitet eingehende Anfragen, setzt Geschäftsregeln durch, liest oder schreibt Daten und sendet die Ergebnisse an den Client zurück.

### Der Request-Response-Zyklus
Wenn du beispielsweise in einem Login-Formular auf „Senden“ klickst, prüft dein Browser das Passwort nicht selbst. Er sendet den Benutzernamen und das Passwort an einen Backend-Server. Dieser sucht das entsprechende Konto, verifiziert die Anmeldedaten und antwortet mit einer Erfolgs- oder Fehlermeldung. Der Browser reagiert anschließend auf diese Antwort. Dieses Zusammenspiel zwischen einem **Client** (Browser, App) und einem **Server** wird als **Request-Response-Zyklus** bezeichnet. Er bildet das Fundament der Backend-Entwicklung.



### Die API (Application Programming Interface)
Damit die Kommunikation zwischen Client und Server reibungslos funktioniert, müssen sich beide Seiten auf ein Format einigen. Eine **API** stellt diese Vereinbarung bereit. Sie definiert:
1.  Die **Endpunkte**, die ein Server zur Verfügung stellt.
2.  Welche Daten jeder Endpunkt erwartet.
3.  Was der Endpunkt als Ergebnis zurückgibt.

Ein Server verspricht beispielsweise: „Sende eine `GET`-Anfrage an `/users` und ich liefere eine Liste von Benutzern zurück.“ Dem Client muss dabei nicht bekannt sein, wie die Daten gespeichert werden oder welche Datenbank im Hintergrund läuft; er muss lediglich die Regeln der API befolgen.

### Das Protokoll: HTTP
Die Nachrichten werden über das Netzwerk mittels des **HTTP-Protokolls** (Hypertext Transfer Protocol) übertragen. Es legt die Struktur von Anfragen und Antworten fest, definiert Metadaten und regelt, wie Erfolg oder Misserfolg signalisiert werden. Als Backend-Entwickler ist **HTTP** dein tägliches Werkzeug.
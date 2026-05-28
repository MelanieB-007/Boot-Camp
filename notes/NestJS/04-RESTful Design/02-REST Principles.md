# NestJS RESTful Design – REST-Prinzipien

REST gibt dir eine Handvoll Regeln, die auf den ersten Blick willkürlich wirken. Verwende Pluralsubstantive in URLs. Halte Verben aus Pfaden heraus. Bevorzuge `PUT` gegenüber `POST`, wenn eine Ressource ersetzt wird. Gib `204` statt `200` zurück, wenn nichts zurückzuschicken ist. Die Regeln werden offensichtlich, sobald man sieht, was sie schützen. Sie machen Endpunkte vorhersehbar, sodass zwei Entwickler in verschiedenen Teams erraten können, was eine URL tut, ohne die Dokumentation zu lesen. Sie geben Caching-Proxies ein klares Signal, welche Antworten sicher gespeichert werden dürfen. Und sie ermöglichen es einem Client, einen fehlgeschlagenen Netzwerkaufruf zu wiederholen, ohne sich zu fragen, ob der zweite Versuch die Kreditkarte zweimal belastet.

Vier Grundregeln liegen jeder REST-API zugrunde. **Ressourcen** sind die Substantive, die die API bereitstellt. **URIs** sind die Adressen, unter denen diese Substantive leben. **HTTP-Methoden** sind die Verben, die auf sie wirken – jede mit ihrer eigenen Zusage über Seiteneffekte und Wiederholversuche. **Repräsentationen** sind das Format, in dem die Daten über die Leitung übertragen werden – fast immer JSON. Und **Zustandslosigkeit** ist die Einschränkung, die das gesamte System skalierbar hält: Jede Anfrage ist in sich abgeschlossen, und der Server vergisst den Client zwischen den Aufrufen.

## Ressourcen und URIs

Eine Ressource ist alles, was die API als Ding bereitstellt, das der Client lesen oder ändern kann. Ein Konzert, ein Nutzer, eine Rückerstattung, ein Suchergebnis, ein Warenkorb. Die meisten Ressourcen entsprechen einer Zeile in einer Datenbank, müssen es aber nicht. Eine Ressource ist alles, was die API für adressierbar erklärt.

Jede Ressource erhält eine Adresse: eine URI. REST bevorzugt einige wenige Konventionen für das Aussehen dieser Adressen:

- Verwende Pluralsubstantive für Sammlungen: `/concerts`, nicht `/concert` oder `/getConcerts`.
- Hänge den Bezeichner für ein einzelnes Element an: `/concerts/9a4f...` für eine UUID, `/concerts/42` für eine Integer-ID.
- Verschachtle Unterressourcen, wenn sie nur im Kontext eines übergeordneten Elements Sinn ergeben: `/concerts/42/tickets` listet Tickets für ein bestimmtes Konzert. Eine eigenständige `/tickets`-Route verdient ihren Platz nur, wenn Tickets für sich allein bedeutsam sind.
- Vermeide Verben in Pfaden: `/concerts/42/cancel` ist ein schlechtes Zeichen. Modelliere die Stornierung stattdessen als Zustandsänderung (`PATCH /concerts/42` mit `{ status: "cancelled" }`) oder als eigene Ressource (`POST /concerts/42/cancellations`).

Der Gewinn ist Vorhersehbarkeit. Ein Client, der den `/concerts`-Endpunkt kennt, kann die URL für ein einzelnes Konzert, dessen Tickets und die Tickets eines anderen Konzerts ableiten – ohne die Dokumentation erneut zu öffnen.

## HTTP-Methoden: sicher und idempotent

Die Methoden sind nicht austauschbar. Jede gibt dem Client eine Zusage darüber, was der Aufruf bewirkt.

- **GET** liest. Es verändert den Serverzustand nicht. Ein GET kann ohne Konsequenzen wiederholt, gecacht, vorabgerufen oder von einem Suchmaschinen-Crawler abgerufen werden. GET ist sicher.
- **POST** erstellt oder startet etwas. Es ist weder sicher noch idempotent. Das zweimalige Senden derselben Payload erstellt typischerweise zwei Ressourcen oder belastet eine Karte zweimal. Clients sollten einen POST nicht automatisch wiederholen.
- **PUT** ersetzt eine Ressource unter einer bekannten URL. Der Client sendet die vollständige neue Repräsentation, und der Server speichert sie. PUT ist idempotent: Das zweimalige Senden desselben PUT hinterlässt den Server im gleichen Zustand wie das einmalige Senden. Diese Eigenschaft macht PUT sicher für Wiederholversuche nach einem Netzwerkfehler.
- **PATCH** aktualisiert einen Teil einer Ressource. Der Client sendet nur die Felder, die geändert werden sollen. PATCH ist laut Spezifikation nicht garantiert idempotent, obwohl die meisten Implementierungen es so behandeln.
- **DELETE** entfernt eine Ressource. DELETE ist idempotent. Das Löschen einer bereits gelöschten Ressource gibt `404` zurück, aber der Serverzustand ist identisch mit dem nach einem erfolgreichen ersten Aufruf.

Ein nützlicher Praxistest: Stell dir einen Retry-Job vor, der jede fehlgeschlagene Anfrage dreimal erneut sendet. Welche Methoden würden das ohne Schaden überstehen? GET, PUT und DELETE. POST und PATCH riskieren Duplikate.

> ❗ **Achtung:** Idempotent bedeutet nicht „gibt dieselbe Antwort zurück". Zwei DELETE-Aufrufe geben beim ersten Mal `204` und beim zweiten Mal `404` zurück. Sie sind trotzdem idempotent, weil der Serverzustand nach beiden Aufrufen identisch ist.

## JSON als Repräsentation

Eine Ressource und ihre Repräsentation sind nicht dasselbe. Die Ressource ist das abstrakte Konzept (das Konzert im System). Die Repräsentation sind die konkreten Bytes, die über die Leitung übertragen werden: ein JSON-Dokument, ein XML-Blob, eine binäre Protobuf-Nachricht, manchmal sogar eine HTML-Seite. REST selbst legt kein Format fest. Client und Server verhandeln es über die Header `Content-Type` und `Accept`.

JSON hat sich in der Praxis durchgesetzt. Es ist lesbar genug für Curl-Debugging, wird in jeder relevanten Sprache ohne Aufwand geparst, und bleibt klein genug, dass Gzip-Komprimierung den Overhead der geschweiften Klammern unsichtbar macht.

Zwei Repräsentationen derselben Ressource können koexistieren. `/concerts/42` könnte für eine Detailseite ein vollständiges Objekt zurückgeben, während `/concerts` für eine Listenansicht eine schlankere Zusammenfassung liefert. Dieselbe zugrundeliegende Ressource, zwei Repräsentationen – beide gültig.

## Zustandslosigkeit

Jede Anfrage muss alles enthalten, was der Server zur Bearbeitung benötigt. Der Server speichert zwischen den Aufrufen keinerlei Erinnerung an den Client. Wenn eine Anfrage die Identität des Nutzers benötigt, enthält sie diese – typischerweise als Token im `Authorization`-Header. Wenn eine Anfrage Filterkriterien benötigt, enthält sie diese als Query-Parameter. Der Server erinnert sich nicht an „den Filter, den du auf der vorherigen Seite gesetzt hast".

Der Lohn ist horizontale Skalierbarkeit. Hundert identische Serverinstanzen können hinter einem Load Balancer stehen, und jede von ihnen kann jede Anfrage beantworten. Keine Sticky Sessions, kein In-Memory-Client-State, der zwischen Hosts migriert werden müsste. Skalierung wird zur Konfigurationsänderung statt zur Neuarchitektur.

Der Preis ist Ausführlichkeit. Ein eingeloggter Browser sendet sein Token bei jedem Aufruf mit, und ein paginierter Listen-Endpunkt erhält die Seitennummer bei jedem Seitenaufruf. Der Tausch lohnt sich fast immer. Zustandsbehaftete Protokolle, die den entgegengesetzten Weg gegangen sind (FTP, RPC-Frameworks auf Basis langlebiger Verbindungen), stoßen regelmäßig an ihre Grenzen, sobald sie über einen einzelnen Server hinaus skalieren müssen.

> 💡 **Gut zu wissen:** Zustandslosigkeit bedeutet, dass der Server den Client vergisst – nicht, dass die API deine Daten vergisst. Die Datenbank speichert das Konzert weiterhin. Der Server erinnert sich lediglich nicht, welcher Client zuletzt danach gefragt hat.

## Ressourcen

- [MDN, HTTP-Anfragemethoden](https://developer.mozilla.org/de/docs/Web/HTTP/Methods)
- [Mastering RESTful API Design: A Practical Guide](https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/)
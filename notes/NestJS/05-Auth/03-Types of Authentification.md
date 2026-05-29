# NestJS Auth – Arten der Authentifizierung

Bevor man Authentifizierung in eine API einbaut, lohnt es sich zu wissen, welche Optionen existieren. Verschiedene Anwendungen haben unterschiedliche Sicherheitsanforderungen, unterschiedliche Client-Typen und unterschiedliche Toleranzen für Komplexität. Die Methode, die für ein einfaches internes Tool gut funktioniert, ist nicht unbedingt die richtige für eine mobile App oder eine Drittanbieter-Integration. Diese Datei gibt einen Überblick über die gängigsten Ansätze und endet mit der tokenbasierten Authentifizierung, die in dieser Einheit implementiert wird.

## Basisauthentifizierung

Der Client sendet mit jeder Anfrage einen Benutzernamen und ein Passwort. Die Anmeldedaten werden zu dem String `benutzername:passwort` zusammengeführt, Base64-kodiert und im `Authorization`-Header mit dem Präfix `Basic` platziert.

Base64-Kodierung ist keine Verschlüsselung – sie ist leicht umkehrbar. Jede Partei, die die Anfrage abfängt, kann sie dekodieren und die Anmeldedaten lesen. Aus diesem Grund muss die Basisauthentifizierung immer über HTTPS laufen. Selbst dann erhöht das Senden von Anmeldedaten bei jeder Anfrage das Risiko im Vergleich zu Methoden, die Anmeldedaten einmalig gegen ein Token tauschen und danach nur das Token verwenden. Sie eignet sich für einfache interne APIs oder Skripte, bei denen die Umgebung streng kontrolliert wird.

## API-Key-Authentifizierung

Der API-Anbieter generiert für jede Client-Anwendung einen eindeutigen Schlüssel. Der Client fügt diesen Schlüssel bei jeder Anfrage bei, üblicherweise in einem benutzerdefinierten Header wie `X-API-Key`. Der Server validiert den Schlüssel gegen eine gespeicherte Liste.

API-Keys authentifizieren eine Anwendung statt eines bestimmten Nutzers, was sie für die Maschine-zu-Maschine-Kommunikation sowie das Nachverfolgen von API-Nutzung oder Abrechnung gut geeignet macht. Sie sind weniger geeignet für Szenarien, die eine benutzerspezifische Zugriffskontrolle erfordern. Ein kompromittierter Schlüssel ist gültig, bis er explizit widerrufen wird – weshalb regelmäßige Schlüsselrotation und Anfrage-Monitoring zentral für ein sicheres API-Key-Setup sind.

## Sitzungsbasierte Authentifizierung

Der Client übermittelt Anmeldedaten einmalig, typischerweise über ein Login-Formular. Nach erfolgreicher Überprüfung erstellt der Server einen Sitzungsdatensatz in einer Datenbank oder einem Session-Store und gibt dem Client eine Sitzungs-ID zurück, üblicherweise als HTTP-only-Cookie. Der Browser fügt diesen Cookie bei nachfolgenden Anfragen automatisch bei, und der Server schlägt die Sitzung bei jeder Anfrage nach, um den Nutzer zu identifizieren.

Da der Server den Überblick über aktive Sitzungen behält, ist die sitzungsbasierte Authentifizierung **zustandsbehaftet**. Das macht den Widerruf unkompliziert, da das Löschen des Sitzungsdatensatzes den Zugriff des Clients sofort ungültig macht. Außerdem bleiben sensible Daten beim Server, da der Cookie nur eine opake ID statt Nutzer-Claims enthält.

Der Kompromiss ist die Infrastruktur, die für die Verwaltung des Sitzungszustands erforderlich ist. In einem verteilten System muss jede Instanz der Anwendung denselben Session-Store lesen können – entweder über einen zentralisierten Store oder über Sticky Sessions am Load Balancer. Für Anwendungen, die von einer einzelnen Domain mit einem traditionellen server-seitig gerenderten Frontend bedient werden, bleibt die sitzungsbasierte Authentifizierung eine solide, gut verstandene Wahl.

## Tokenbasierte Authentifizierung

Der Client tauscht Anmeldedaten einmalig gegen ein signiertes Token aus und verwendet dieses Token für alle nachfolgenden Anfragen. Der Server überprüft die Signatur des Tokens bei jeder Anfrage, ohne einen Session-Store zu befragen. Im Vergleich zur sitzungsbasierten Authentifizierung ist dieses Schema **zustandslos** und erfordert keinen zentralisierten Session-Store. Nutzer-Claims sind im Token selbst eingebettet, und die Signatur verhindert, dass böswillige Akteure das Token manipulieren. JSON Web Tokens (JWT) sind das am weitesten verbreitete Format dafür.

Dieses zustandslose Design macht die tokenbasierte Authentifizierung zur natürlichen Wahl für verteilte Systeme und Single-Page-Anwendungen. Der Server kann horizontal skalieren, ohne zusätzliche Infrastruktur (d. h. ohne die Notwendigkeit, den Sitzungszustand über mehrere Instanzen derselben Anwendung zu synchronisieren). Der Kompromiss ist der Token-Widerruf: Da das Token in sich abgeschlossen ist, erfordert seine Ungültigmachung vor Ablauf zusätzliche Infrastruktur, wie eine Blockliste.

## OAuth 2.0

OAuth 2.0 ist ein **Autorisierungs-Framework**, kein Authentifizierungsprotokoll. Es ermöglicht einem Nutzer, einer Drittanbieter-Anwendung begrenzten Zugriff auf Ressourcen auf einem anderen Server zu gewähren, ohne seine eigentlichen Anmeldedaten preiszugeben. Der Flow, dem die meisten begegnen, ist „Mit Google anmelden" oder „Mit GitHub anmelden": Der Nutzer authentifiziert sich beim externen Anbieter, der der Client-Anwendung dann ein bereichsbeschränktes Access-Token gewährt.

OAuth 2.0 ist die richtige Wahl, wenn deine Anwendung im Namen eines Nutzers über verschiedene Dienste hinweg handeln muss. Es ist komplexer zu implementieren als die anderen hier genannten Optionen, da es mehrere Parteien, Redirect-Flows und verschiedene Grant-Types für unterschiedliche Client-Kontexte umfasst.

## OpenID Connect

OpenID Connect (OIDC) ist eine Identitätsschicht, die auf OAuth 2.0 aufgebaut ist. Während OAuth 2.0 die Autorisierung adressiert, adressiert OIDC die Authentifizierung: Es ergänzt den OAuth 2.0-Flow um ein standardisiertes ID-Token (ein JWT), das verifizierte Claims über die Identität des Nutzers enthält. Das macht es zur Standardwahl für Single Sign-on (SSO) über mehrere Anwendungen hinweg.

Wenn du eine Anwendung baust, die die Authentifizierung an einen externen Anbieter delegiert und zuverlässige Identitätsinformationen zurückbenötigt, ist OIDC das richtige Werkzeug.

## Wichtige Hinweise

Unabhängig von der Authentifizierungsmethode muss der gesamte API-Verkehr über HTTPS laufen. Ohne Transportverschlüsselung sind Tokens und Anmeldedaten dem Abfangen ausgesetzt. Auf der Client-Seite sollten Tokens möglichst in HTTP-only-Cookies gespeichert werden; sie in `localStorage` zu speichern macht sie für JavaScript, das auf der Seite läuft, zugänglich – was eine XSS-Schwachstelle erzeugt.
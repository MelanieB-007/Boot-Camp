# NestJS Auth – JSON Web Tokens

Traditionelle sitzungsbasierte Authentifizierung speichert den Zustand auf dem Server. Wenn sich ein Nutzer einloggt, erstellt der Server einen Sitzungsdatensatz, speichert ihn in einer Datenbank oder im Arbeitsspeicher und sendet dem Client eine Sitzungs-ID. Bei jeder nachfolgenden Anfrage schlägt der Server diese Sitzungs-ID nach, um den Nutzer zu identifizieren.

JSON Web Tokens verlagern den Zustand in das Token selbst. Ein JWT ist ein kompakter String, der Claims über den Nutzer kodiert (seine ID, Rollen und wann das Token abläuft) und diese kryptografisch signiert. Der Server, der das Token ausgestellt hat, kann es bei jeder nachfolgenden Anfrage überprüfen, ohne eine Datenbank zu befragen. Jeder andere Server, der dasselbe Secret kennt, kann es ebenfalls verifizieren – was JWTs für verteilte Systeme und Microservices besonders geeignet macht.

## JWT-Struktur

Ein JWT besteht aus drei Teilen, die jeweils Base64url-kodiert und durch Punkte verbunden sind: `header.payload.signature`.

Der **Header** ist ein JSON-Objekt, das den Token-Typ und den Signierungsalgorithmus beschreibt. Die meisten JWTs verwenden HMAC SHA256, im Header als `HS256` angegeben.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Der **Payload** trägt die Claims. Ein Claim ist eine Aussage über eine Entität, üblicherweise den Nutzer. Es gibt registrierte Claim-Namen mit fest definierten Bedeutungen: `sub` für das Subject (typischerweise die ID des Nutzers), `exp` für den Ablaufzeitpunkt als Unix-Timestamp, `iss` für den Aussteller und `aud` für die Zielgruppe. Daneben können eigene Properties ergänzt werden, etwa der Benutzername oder die Rollen.

```json
{
  "sub": "1234567890",
  "username": "alice",
  "roles": ["viewer"],
  "exp": 1753760000
}
```

Der Ablaufzeitpunkt ist ein Unix-Timestamp in Sekunden seit dem Unix-Epoch (1. Januar 1970). Wenn der Server das Token überprüft, prüft er, ob `exp` in der Vergangenheit liegt, und lehnt das Token bei Ablauf ab.

Die **Signatur** wird erstellt, indem Header und Payload kodiert, mit einem Punkt verkettet und durch den Signierungsalgorithmus mit einem nur dem Server bekannten Secret-Key verarbeitet werden:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

Das vollständige Token sieht so aus:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3NDIiLCJuYW1lIjoiVG9tbXkgV2lzZWF1Iiwicm9sZXMiOlsicHJvZHVjZXIiLCJkaXJlY3RvciIsIndyaXRlciIsIm1haW4gYWN0b3IiXX0.GsFW-7-0AqYjrJSyiH6XtsR7sB4YENmGhg5VEYNIgAA
```

## Authentifizierungsablauf

Wenn ein Nutzer gültige Anmeldedaten an den Login-Endpunkt sendet, generiert der Server ein JWT mit der ID, den Rollen und einem Ablaufzeitpunkt des Nutzers – und signiert es mit dem Secret-Key. Das Token wird dem Client im Response-Body zurückgegeben.

Der Client speichert das Token und fügt es bei jeder nachfolgenden Anfrage im `Authorization`-Header mit dem Bearer-Schema ein:

```
Authorization: Bearer <token>
```

Wenn der Server eine geschützte Anfrage empfängt, extrahiert er das Token aus dem Header, dekodiert Header und Payload und berechnet die Signatur mit demselben Secret neu. Stimmt die neu berechnete Signatur mit der im Token überein, wurde der Payload nicht manipuliert. Der Server prüft anschließend, ob das Token abgelaufen ist.

## Signierung vs. Verschlüsselung

JWTs sind **signiert**, nicht verschlüsselt. Diese Unterscheidung ist wichtig. Signierung garantiert, dass das Token seit seiner Ausstellung nicht verändert wurde. Ändert jemand auch nur ein Zeichen des Payloads, stimmt die Signatur nicht mehr, und die Überprüfung schlägt fehl. Signierung verbirgt den Inhalt jedoch nicht. Header und Payload sind Base64url-kodiert, nicht verschlüsselt – und jeder, der das Token besitzt, kann sie dekodieren und lesen. Du kannst das selbst ausprobieren, indem du den Token-Payload in einem JWT-Debugger wie [jwt.io](https://jwt.io) dekodierst.

Das bedeutet: Sensible Daten wie Passwörter, private Schlüssel oder vollständige persönliche Datensätze gehören nie in einen JWT-Payload, es sei denn, du verschlüsselst sie vorher selbst. Füge nur das ein, was der Server benötigt, um den Nutzer zu identifizieren und seine Berechtigungen zu prüfen: eine ID, eine Rolle und einen Ablaufzeitpunkt.

Wenn der Payload unlesbar sein muss, wird JSON Web Encryption (JWE) benötigt – ein separater Standard. Die meisten Anwendungen benötigen es nicht, weil der Payload keine sensiblen Daten enthält.

Auch der Speicherort auf der Client-Seite ist entscheidend. Das Speichern in `localStorage` bedeutet, dass jedes auf der Seite laufende JavaScript es lesen kann – eine XSS-Schwachstelle. HTTP-only-Cookies sind eine sicherere Option, da sie für JavaScript nicht zugänglich sind; der Browser sendet sie automatisch mit jeder Anfrage, aber Skripte können sie nicht lesen.

## Ressourcen

- [JWT Debugger](https://jwt.io)
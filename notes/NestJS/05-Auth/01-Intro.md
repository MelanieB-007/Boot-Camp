# Übersicht

Eine API ohne Authentifizierungsschicht ist für jeden zugänglich, der sie erreichen kann. Wer deine Endpunkte entdeckt, kann Daten lesen, erstellen oder löschen – ohne jede Einschränkung. Bevor du eine echte Anwendung in Betrieb nimmst, brauchst du eine Möglichkeit zu überprüfen, wer eine Anfrage stellt und ob diese Person berechtigt ist, das zu tun, was sie versucht.

Diese Einheit behandelt Authentifizierung und Autorisierung in einer NestJS-REST-API. Die Begriffe sind verwandt, aber nicht austauschbar. **Authentifizierung** fragt, ob die Person tatsächlich die ist, die sie vorgibt zu sein. **Autorisierung** fragt, ob diese Person die Berechtigung hat, das zu tun, was sie versucht. Autorisierung setzt immer voraus, dass die Authentifizierung zuerst stattgefunden hat.

Von den verschiedenen Ansätzen zur API-Authentifizierung verwendet diese Einheit **JSON Web Tokens (JWT)**. Ein JWT ist ein kompakter, signierter String, den ein Server nach einem erfolgreichen Login ausstellt. Der Client sendet dieses Token bei jeder nachfolgenden Anfrage mit, und der Server überprüft es, anstatt eine Session in einer Datenbank nachzuschlagen. Dieses zustandslose Design passt gut zu NestJS-Anwendungen – insbesondere wenn die API skalieren oder mehrere Clients bedienen muss.

Auf der NestJS-Seite läuft die Authentifizierung über **Guards**. Ein Guard ist eine Klasse, die eine eingehende Anfrage prüft, bevor sie einen Route-Handler erreicht, und entscheidet, ob sie durchgelassen wird. NestJS integriert sich mit Passport.js zur Token-Verifikation. Du wirst zwei Passport-Strategien konfigurieren: eine Local-Strategie, die Anmeldedaten beim Login validiert, und eine JWT-Strategie, die das Token bei jeder nachfolgenden Anfrage überprüft.

Die Einheit endet mit einem funktionierenden Auth-Modul, das beim Login Tokens ausstellt, Routen mit Guards schützt und einen `@Public()`-Decorator für Routen bereitstellt, die offen bleiben sollen.
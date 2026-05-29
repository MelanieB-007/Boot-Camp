# NestJS Auth – Authentifizierung und Autorisierung

Authentifizierung und Autorisierung sind zwei verschiedene Konzepte, die häufig so verwendet werden, als wären sie austauschbar. Den Unterschied zu verstehen ist wichtig, weil sie unterschiedliche Probleme lösen und in einer bestimmten Reihenfolge stattfinden. Wer das verwechselt, landet entweder bei kaputten Zugriffskontrollen oder unnötiger Komplexität im Code.

Am klarsten lassen sie sich durch eine Analogie trennen. Am Flughafen zeigst du zuerst deinen Reisepass an der Sicherheitskontrolle. Der Beamte prüft, ob du tatsächlich die Person bist, die du vorgibst zu sein. Das ist **Authentifizierung**: die Bestätigung deiner Identität. Später am Gate gibst du deine Bordkarte ab. Die Bordkarte beweist nicht, wer du bist – das wurde bereits festgestellt. Sie teilt dem Gate-Personal mit, welchen Flug du besteigen darfst und welchen Sitzplatz du einnehmen kannst. Das ist **Autorisierung**: die Bestimmung, was du tun darfst.

## Authentifizierung

Authentifizierung ist der Prozess der Identitätsüberprüfung. Wenn ein Nutzer einen Benutzernamen und ein Passwort an einen Login-Endpunkt sendet, prüft der Server, ob diese Anmeldedaten mit dem Gespeicherten übereinstimmen. Wenn ja, ist die Identität bestätigt. Der Server antwortet mit der Ausgabe eines Tokens (z. B. eines JWT), das die verifizierte Identität für die Dauer der Session repräsentiert.

Authentifizierung kann auf verschiedenen Arten von Nachweisen beruhen: etwas, das du weißt (ein Passwort oder eine PIN), etwas, das du hast (ein Hardware-Token oder ein OTP, das ans Telefon gesendet wird), oder etwas, das du bist (ein Fingerabdruck oder ein Gesichtsscan). Multi-Faktor-Authentifizierung kombiniert zwei oder mehr dieser Kategorien, um die Hürde für Identitätsdiebstahl zu erhöhen.

Schlägt die Authentifizierung fehl, gibt der Server eine `401 Unauthorized`-Antwort zurück. Dieser Status signalisiert, dass der Anfrage gültige Anmeldedaten fehlten – was den Statusnamen (Unauthorized) etwas ungenau macht, da er sich eigentlich auf einen Fehler bei der Authentifizierung bezieht.

## Autorisierung

Autorisierung bestimmt, was eine authentifizierte Identität tun darf. Sie findet nach der Authentifizierung statt und stützt sich auf die in diesem Schritt festgestellten Identitätsinformationen. Das System prüft die Rollen oder Berechtigungen des authentifizierten Nutzers gegen die Aktion, die er durchführen möchte.

Besteht die Prüfung, wird die Anfrage fortgesetzt. Wenn nicht, gibt der Server eine `403 Forbidden`-Antwort zurück, die signalisiert, dass die Authentifizierung der Anfrage erfolgreich war, der Nutzer aber nicht berechtigt ist, die angeforderte Aktion durchzuführen.

## Rollenbasierte Zugriffskontrolle

Die meisten Anwendungen verwalten Berechtigungen, indem sie sie in Rollen gruppieren. Einem Nutzer werden eine oder mehrere Rollen zugewiesen, und jede Rolle trägt eine Reihe erlaubter Aktionen. Dieses Muster wird **rollenbasierte Zugriffskontrolle** (Role-Based Access Control, RBAC) genannt.

In einer Quotes-API könntest du zum Beispiel eine `viewer`-Rolle haben, die nur Zitate lesen kann, und eine `admin`-Rolle, die sie erstellen, aktualisieren und löschen kann. Wenn eine Anfrage eintrifft, prüft der Server, ob die Rolle des authentifizierten Nutzers die erforderliche Berechtigung für diese Operation enthält.

Dieser Ansatz ist einfacher zu verwalten als das Auflisten individueller Berechtigungen pro Nutzer. Wenn du ändern möchtest, was eine Gruppe von Nutzern tun kann, aktualisierst du die Rollendefinition statt jedes einzelne Nutzerkonto. Die Aufgabe in dieser Einheit verlangt genau das von dir: eine Autorisierungsschicht, die Rollen verwendet, um zu entscheiden, wer Zitate verwalten darf.

Ein verwandtes Muster ist die **attributbasierte Zugriffskontrolle** (Attribute-Based Access Control, ABAC), die Entscheidungen auf Basis von Kombinationen aus Nutzer-Attributen, Ressourcen-Attributen und Kontext trifft. ABAC ist ausdrucksstärker, aber auch komplexer. Für die meisten Anwendungen ist RBAC der richtige Ausgangspunkt.
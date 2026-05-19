# Backend-Grundlagen und Express – HTTP

**HTTP** (Hypertext Transfer Protocol) ist das Protokoll, das die Kommunikation zwischen Clients und Servern im Web regelt. Jedes Mal, wenn ein Browser eine Seite lädt, eine App Daten abruft oder ein Tool wie **Bruno** eine Testanfrage sendet, definiert HTTP das Format dieser Konversation.

## Der Request-Response-Zyklus
Ein HTTP-Austausch besteht immer aus zwei Teilen: einer **Anfrage** (Request) und einer **Antwort** (Response).

1.  **Request**: Der Client erstellt eine Anfrage und sendet sie an den Server. Diese spezifiziert, welche Ressource angefragt wird, welche Aktion ausgeführt werden soll und welche Daten eventuell mitgesendet werden.
2.  **Response**: Der Server empfängt die Anfrage, verarbeitet sie und sendet eine Antwort zurück, die den Client über das Ergebnis informiert.



### Aufbau einer Anfrage (Request)
*   **Methode**: Teilt dem Server mit, welche Art von Operation ausgeführt werden soll.
*   **URL**: Identifiziert die Ziel-Ressource.
*   **Header**: Übertragen Metadaten wie den Inhaltstyp oder Authentifizierungsdaten.
*   **Body**: Enthält Daten (z. B. Formulareingaben oder JSON-Objekte), die bei Methoden wie `POST` oder `PUT` mitgesendet werden.

### Aufbau einer Antwort (Response)
*   **Statuscode**: Eine dreistellige Zahl, die den Ausgang der Anfrage angibt.
*   **Header**: Metadaten über die Antwort.
*   **Body**: Der eigentliche Inhalt, der zurückgegeben wird.

---

## Eigenschaft: Zustandslosigkeit (Stateless)
HTTP ist **zustandslos**. Jede Anfrage steht für sich allein; der Server "vergisst" den Client nach Abschluss des Zyklus sofort wieder. Jede Anfrage muss daher alle Informationen enthalten, die der Server zur Bearbeitung benötigt.

> **Wie funktionieren Logins ohne Gedächtnis?**
> Um Benutzer wiederzuerkennen, nutzen Anwendungen **Cookies** oder **JWTs** (JSON Web Tokens). Der Client muss diese "digitale Identitätskarte" an **jede einzelne** Anfrage anhängen, um dem Server den nötigen Kontext zu liefern.

---

## HTTP-Methoden (CRUD)
Die gängigsten Methoden bilden die Basis-Operationen zum Erstellen, Lesen, Aktualisieren und Löschen von Daten ab:

| Methode | CRUD-Aktion | Beschreibung |
| :--- | :--- | :--- |
| **GET** | Read | Ruft Daten ab. Darf Daten auf dem Server niemals verändern. |
| **POST** | Create | Sendet Daten an den Server, um eine **neue Ressource** zu erstellen. |
| **PUT** | Update | **Ersetzt** eine existierende Ressource vollständig durch die gesendeten Daten. |
| **PATCH** | Update | Wendet eine **partielle Aktualisierung** an (nur geänderte Felder senden). |
| **DELETE** | Delete | Entfernt eine Ressource vom Server. |

---

## Statuscodes
Statuscodes geben an, was auf dem Server passiert ist. Sie sind in fünf Klassen unterteilt:

*   **2xx (Erfolg):** Die Anfrage hat wie erwartet funktioniert.
    *   `200 OK`: Standard-Erfolg.
    *   `201 Created`: Ressource wurde erfolgreich erstellt.
    *   `204 No Content`: Erfolg, aber keine Daten im Antwort-Body (oft nach DELETE).
*   **3xx (Umleitung):** Die Ressource ist umgezogen (z. B. `301 Moved Permanently`).
*   **4xx (Client-Fehler):** Fehler in der Anfrage.
    *   `400 Bad Request`: Ungültige Syntax oder fehlende Daten.
    *   `401 Unauthorized`: Authentifizierung fehlt oder ist ungültig.
    *   `404 Not Found`: Die Ressource wurde nicht gefunden.
*   **5xx (Server-Fehler):** Der Server ist bei einer gültigen Anfrage gescheitert.
    *   `500 Internal Server Error`: Allgemeiner Serverfehler.
    *   `503 Service Unavailable`: Server überlastet oder in Wartung.

> **Merkhilfe:** **2xx** = Alles super. **4xx** = Du (der Client) hast einen Fehler gemacht. **5xx** = Der Server ist kaputt.
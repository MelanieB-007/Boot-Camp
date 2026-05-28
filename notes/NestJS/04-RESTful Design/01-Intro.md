# Übersicht

REST ist der langweilige Standard für Web-APIs – und genau das ist der Grund, warum er sich durchgesetzt hat. Als Roy Fielding im Jahr 2000 seine Doktorarbeit schrieb, lief das Internet bereits auf HTTP. Seine Erkenntnis war einfach: Statt ein neues Protokoll auf HTTP obendrauf zu erfinden, sollte man APIs so gestalten, dass sie HTTP so nutzen, wie es gedacht war. Caches, Statuscodes, Verben, Header – all das war bereits vorhanden. Die meisten frühen Web-APIs ignorierten diese Infrastruktur und schraubten etwas Eigenes darüber. REST stellte die entgegengesetzte Frage: Was, wenn die API einfach HTTP sprechen würde?

Eine RPC-artige API behandelt die URL als Funktionsname (`/createConcert`, `/getConcertById?id=42`, `/deleteConcert`). Eine REST-API behandelt die URL als Adresse für eine Sache. `/concerts` ist die Sammlung, `/concerts/42` ist ein bestimmtes Konzert, und die HTTP-Methode teilt dem Server mit, was mit dieser Sache zu tun ist. Dieselbe Handvoll Methoden deckt jede Operation auf jeder Ressource ab, die die API jemals bereitstellen wird. Man hört auf, für jede neue Aktion neue Endpunkte zu erfinden, und beginnt, in Substantiven zu denken.

Zwei Jahrzehnte später ist REST nicht mehr die einzige Option. GraphQL löste ein anderes Problem: Clients, die Daten aus vielen Ressourcen zusammensetzen müssen, ohne zehn Roundtrips zu benötigen. gRPC dominiert den internen Service-to-Service-Verkehr, wo der Vertrag eng und binäre Effizienz entscheidend ist. Für das typische Web-Backend, das Daten an einen Browser, eine mobile App oder einen Drittanbieter ausliefert, bleibt REST der Weg mit den wenigsten Überraschungen.

Diese Einheit ist in zwei Teile gegliedert. Die erste Hälfte behandelt REST selbst: was als Ressource gilt, wie URLs sie identifizieren, wie HTTP-Methoden auf sie wirken und welche Statuscodes der Server zurückgeben sollte. Die zweite Hälfte führt durch NestJS, wo Controller, DTOs, Pipes und Query-Parameter diese Regeln in lauffähigen Code verwandeln.

> 💡 **Gut zu wissen:** Fielding schrieb seine Dissertation, während er an der HTTP/1.1-Spezifikation arbeitete. REST wurde nicht so sehr erfunden – es war vielmehr die Beschreibung dessen, wie die erfolgreichsten Systeme des Webs bereits strukturiert waren. Das Label kam nach der Praxis.

## Ressourcen

- [Roy Fielding, Architectural Styles and the Design of Network-based Software Architectures](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
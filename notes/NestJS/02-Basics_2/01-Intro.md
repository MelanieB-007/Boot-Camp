# NestJS in der Praxis: Module, Controller, Services und Repositories

Die vorherige Sitzung hat eine minimale NestJS-Anwendung aufgebaut: ein Modul, einen Controller und einen hartcodierten Service in einer einzigen Datei. Das hat gereicht, um zu verstehen, wie die einzelnen Teile zusammenspielen. Diese Sitzung zeigt, wie diese Teile in einem echten Projekt funktionieren.

## Die NestJS CLI

Der erste Anlaufpunkt ist die NestJS CLI. Echte Projekte werden nicht Datei für Datei aufgebaut – die CLI legt Feature-Verzeichnisse an, generiert Boilerplate-Code und registriert neue Klassen automatisch in ihrem Modul. Wer versteht, was die CLI erzeugt, muss die Konventionen später nicht mühsam rückwärts erschließen.

## Die vier Bausteine eines NestJS-Features

Nach der CLI behandelt die Sitzung die vier Bestandteile, die in jedem NestJS-Feature vorkommen.

**Module** gruppieren Code nach fachlichem Bereich und steuern, was für den Rest der Anwendung sichtbar ist.

**Controller** nehmen HTTP-Anfragen entgegen und übergeben die eigentliche Arbeit an Services – ohne selbst HTTP-Logik zu enthalten.

**Services** wenden die Geschäftslogik an, ohne HTTP zu berühren.

**Repositories** kapseln den Datenzugriff in einer eigenen Klasse, getrennt vom Service. Dadurch lässt sich die Datenhaltungsschicht austauschen, ohne die Geschäftsregeln anfassen zu müssen.
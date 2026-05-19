# TypeScript Advanced Setup - Erweiterte tsconfig

Die `tsconfig`, die wir momentan verwenden, funktioniert. Wir können sie jedoch erweitern, um Grundregeln für das Coding festzulegen, anstatt nur das Kompilierverhalten zu steuern. Dies beinhaltet den Umgang mit nicht verwendeten Variablen und die Behandlung von Grenzfällen.

## Konfiguration der Coding-Regeln
Wir können der `tsconfig.json` neue Regeln hinzufügen, um zu steuern, wie mit nicht verwendeten Variablen umgegangen wird:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",

    "target": "esnext",
    "lib": ["esnext"],
    "types": [],
    "module": "esnext",

    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "skipLibCheck": true,

    // Coding-Regeln
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Diese neuen Regeln zwingen jeden im Team, dieselben Coding-Vorgaben zu befolgen, sodass das Team ohne Konflikte zusammenarbeiten kann. Folgende Regeln sind aktiviert:

* **strict**: Erzwingt strikte Typprüfungsregeln.
* **noUnusedLocals**: Nicht verwendete Variablen werden als Fehler betrachtet und verhindern die Kompilation.
* **noUnusedParameters**: Dasselbe gilt für Funktionsparameter.
* **noFallthroughCasesInSwitch**: Meldet Fehler für "Fallthrough"-Fälle (vergessene Breaks) in Switch-Anweisungen.
* **forceConsistentCasingInFileNames**: Erzwingt eine einheitliche Groß- und Kleinschreibung bei Dateinamen.

## Ressourcen
[TSConfig Compiler Options](https://www.typescriptlang.org/tsconfig)

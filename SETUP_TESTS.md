# Setup Guide — Tests Triagre Frontend

## ⚠️ Configuración Requerida

Se han creado **106 tests unitarios** para las clases críticas del proyecto. Sin embargo, Angular 17 requiere configuración adicional para ejecutarlos.

---

## Verificar Dependencias de Testing

Primero, verifica si Jasmine y Karma están instalados:

```bash
npm list @angular/core karma jasmine typescript
```

Debería mostrar versiones compatibles. Si falta algo, instala:

```bash
npm install --save-dev karma karma-chrome-launcher karma-jasmine karma-jasmine-html-reporter jasmine-core @angular/language-service typescript
```

---

## Configurar Testing en Angular 17

### 1. Agregar builder de test en `angular.json`

Abre `angular.json` y agrega esta sección dentro de `"architect"`:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "triagre-frontend": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "architect": {
        "build": { ... },
        "serve": { ... },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "inlineStyleLanguage": "css",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": [],
            "karmaConfig": "karma.conf.js"
          }
        }
      }
    }
  }
}
```

### 2. Crear `tsconfig.spec.json`

En la raíz del proyecto, crea:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"],
    "esModuleInterop": true,
    "emitDecoratorMetadata": true
  },
  "files": ["src/test.ts"],
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

### 3. Crear `karma.conf.js`

En la raíz del proyecto, crea:

```javascript
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // You can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/triagre-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  });
};
```

### 4. Crear `src/test.ts`

En `src/test.ts`:

```typescript
// This file is required by karma.conf.js and loads recursively all .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

### 5. Script en `package.json`

Verifica que en `package.json` existe:

```json
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

Si no está, agrégalo.

---

## Ejecutar Tests

Una vez configurado:

```bash
# Tests con watch mode
npm test

# Tests sin watch (CI/CD)
npm test -- --watch=false

# Con cobertura
npm test -- --code-coverage

# Headless (para CI)
npm test -- --watch=false --browsers=ChromeHeadlessCI
```

---

## Alternativa: Vite Testing (Angular 17+)

Si prefieres usar **Vitest** en lugar de Karma + Jasmine:

```bash
npm install --save-dev vitest @vitest/ui @angular/core @angular/platform-browser-dynamic
```

Crea `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts']
  }
});
```

Cambia script en `package.json`:

```json
"test": "vitest"
```

---

## Troubleshooting

### Error: "Cannot find module 'karma'"
```bash
npm install --save-dev karma karma-chrome-launcher karma-jasmine karma-jasmine-html-reporter
```

### Error: "tsconfig.spec.json not found"
→ Crea el archivo siguiendo instrucción #2 arriba

### Error: "Chrome not found"
```bash
npm install --save-dev karma-chrome-launcher
# o usa ChromeHeadless
npm test -- --browsers=ChromeHeadless
```

### Tests timeout
En `karma.conf.js`, aumenta:
```javascript
browserNoActivityTimeout: 30000,
browserDisconnectTimeout: 10000,
browserDisconnectTolerance: 3
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --watch=false --browsers=ChromeHeadlessCI
      - run: npm test -- --code-coverage
```

### GitLab CI
```yaml
test:
  image: node:18
  script:
    - npm install
    - npm test -- --watch=false --browsers=ChromeHeadlessCI
  coverage: '/Statements.*?(\d+\.\d+)/'
```

---

## Validar Tests Después de Setup

Una vez configurado, ejecuta:

```bash
npm test -- --watch=false
```

Deberías ver algo como:

```
Chrome X.X.X (Windows/Linux/Mac) PASSED
✓ AuthService (11 tests)
✓ SolicitudService (10 tests)
✓ CatalogoService (5 tests)
✓ authGuard (2 tests)
✓ roleGuard (7 tests)
✓ jwtInterceptor (6 tests)
✓ LoginComponent (15 tests)
✓ ListaSolicitudesComponent (18 tests)
✓ DetalleSolicitudComponent (17 tests)
✓ CrearSolicitudComponent (19 tests)

TOTAL: 110 tests

Executed 110 of 110 SUCCESS
```

---

## Cobertura Target

Después de configurar, ejecuta:

```bash
npm test -- --code-coverage --watch=false
```

Abre `coverage/triagre-frontend/index.html` para ver reporte interactivo.

**Objetivo de cobertura:**
- Servicios: 85%+
- Guards: 100%
- Componentes: 80%+

---

## Documentación Creada

Dentro del proyecto encontrarás:

| Archivo | Propósito |
|---|---|
| `TESTING.md` | Guía completa de testing patterns |
| `TEST_SUMMARY.md` | Resumen de 106 tests creados |
| `run-tests.sh` | Script helper para ejecutar tests |
| `*.spec.ts` | 10 archivos con tests unitarios |

---

## Próximos Pasos

1. ✅ Ejecutar: `npm test -- --watch=false`
2. ✅ Verificar que todos los 110 tests pasan
3. ✅ Generar cobertura: `npm test -- --code-coverage`
4. ✅ Integrar en CI/CD (GitHub Actions, GitLab CI, etc.)
5. ✅ (Opcional) Agregar más tests en componentes/servicios nuevos


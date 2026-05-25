# Testing Guide — Triagre Frontend

## Descripción General

Se han implementado tests unitarios para las clases más críticas del proyecto usando **Jasmine** y **Karma** (testing framework estándar de Angular).

### Cobertura de Tests

| Clase/Archivo | Ubicación | Casos de Test | Enfoque |
|---|---|---|---|
| **AuthService** | `src/app/core/auth/auth.service.spec.ts` | 11 | Login, registro, logout, JWT parsing, signals reactivas |
| **SolicitudService** | `src/app/core/auth/solicitud.service.spec.ts` | 10 | CRUD completo, filtros, paginación, workflow actions |
| **CatalogoService** | `src/app/core/auth/catalogo.service.spec.ts` | 5 | Obtención de catálogos (tipos, usuarios, prioridades) |
| **authGuard** | `src/app/core/auth/auth.guard.spec.ts` | 2 | Protección de rutas autenticadas |
| **roleGuard** | `src/app/core/auth/role.guard.spec.ts` | 5 | Protección por rol, multi-rol access |
| **jwtInterceptor** | `src/app/core/interceptors/jwt.interceptor.spec.ts` | 6 | Headers Authorization, manejo de 401 |
| **LoginComponent** | `src/app/features/auth/login/login.component.spec.ts` | 15 | Validación, submit, errores, navegación |
| **ListaSolicitudesComponent** | `src/app/features/solicitudes/lista/lista-solicitudes.component.spec.ts` | 17 | Carga, filtros, paginación, labels |
| **DetalleSolicitudComponent** | `src/app/features/solicitudes/detalle/detalle-solicitud.component.spec.ts` | 17 | Workflow completo (clasificar, asignar, atender, cerrar) |
| **CrearSolicitudComponent** | `src/app/features/solicitudes/crear/crear-solicitud.component.spec.ts` | 18 | Validación de formulario, creación, errores |

**Total: 106 casos de test**

---

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

Este comando inicia Karma en modo watch. Los tests se re-ejecutan automáticamente cuando cambias archivos.

### Tests de un archivo específico
```bash
npm test -- --include='**/auth.service.spec.ts'
```

### Tests una sola vez (sin watch)
```bash
npm test -- --watch=false
```

### Cobertura de código
```bash
npm test -- --code-coverage
```

Genera reportes en `coverage/` con cobertura por línea, rama y función.

### Debug en navegador
```bash
npm test
# Abre http://localhost:9876
# Click "Debug" button en navegador
# Abre DevTools (F12) → Console/Debugger
```

---

## Estructura de Tests

### Patrón Estándar

```typescript
describe('NombreDelServicio', () => {
  let service: NombreDelServicio;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NombreDelServicio]
    });
    service = TestBed.inject(NombreDelServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ← Asegura que no haya requests pendientes
  });

  it('debería hacer algo específico', (done) => {
    service.metodo().subscribe(result => {
      expect(result).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne('/endpoint');
    req.flush({ data: true });
  });
});
```

### HttpTestingController

Para servicios que hacen HTTP requests:

```typescript
// Esperar un request
const req = httpMock.expectOne('/api/endpoint');
expect(req.request.method).toBe('GET');

// Simular respuesta
req.flush({ success: true, data: { id: 1 } });

// Simular error
req.error(new ErrorEvent('Unauthorized'), { status: 401 });

// Verificar sin requests pendientes
httpMock.verify();
```

### Jasmine Spies

Para mockear servicios y funciones:

```typescript
// Crear spy
const spy = jasmine.createSpyObj('AuthService', ['login', 'logout']);

// Configurar retorno
spy.login.and.returnValue(of({ token: '...' }));

// Verificar que fue llamado
expect(spy.login).toHaveBeenCalledWith(loginRequest);

// Verificar llamadas
expect(spy.logout).toHaveBeenCalled();
expect(spy.logout).toHaveBeenCalledTimes(1);
```

### Testing Signals (Angular 17)

```typescript
// Signal simple
const user = signal({ name: 'John' });
expect(user()).toEqual({ name: 'John' });

// Computed signal
const isAdmin = computed(() => user().role === 'ADMIN');
expect(isAdmin()).toBe(true);

// Signal con TestBed
const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
  isCoordinador: signal(false)  // ← Mock de signal
});
```

---

## Agregar Nuevos Tests

### 1. Crear archivo spec
```bash
# Para un servicio
touch src/app/core/services/mi-servicio.spec.ts

# Para un componente
touch src/app/features/mi-feature/mi-componente.spec.ts
```

### 2. Template básico
```typescript
import { TestBed } from '@angular/core/testing';
import { MiServicio } from './mi-servicio'; // ← Importar clase

describe('MiServicio', () => {
  let service: MiServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MiServicio]
    });
    service = TestBed.inject(MiServicio);
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería hacer X cuando Y', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = service.metodo(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### 3. Ejecutar nuevo test
```bash
npm test -- --include='**/mi-servicio.spec.ts'
```

---

## Mejores Prácticas

### ✅ DO (Hacer)

- **Usar `describe` para agrupar tests** por funcionalidad
- **Nombres descriptivos**: `debería crear usuario cuando datos son válidos`
- **Una aseverción principal** por test (puedes tener múltiples pero una debe ser el foco)
- **Setup limpio**: `beforeEach` para comunes, después setup específico en test
- **Cleanup**: `afterEach` para limpiar (localStorage, timers, HTTP)
- **Mocks claros**: claramente documentar qué es mocked
- **Async tests**: usar `done()` o `async/await` correctamente

### ❌ DON'T (No hacer)

- Tests ambiguos: ❌ "debería funcionar correctamente"
- Tests que dependen del orden: cada test debe ser independiente
- Hardcodear valores: usar constantes o fixtures
- Ignorar cleanup: memoria leaks, requests pendientes
- Tests muy largos (>30 líneas): refactorizar en múltiples tests
- Assertions genéricas: ❌ `expect(result).toBeTruthy()` (sin contexto)

---

## Debugging Tests

### Ver qué requests se hacen
```typescript
it('debería enviar GET', (done) => {
  service.listar().subscribe(() => {
    done();
  });

  const req = httpMock.expectOne('/api/solicitudes');
  console.log('Method:', req.request.method);
  console.log('Headers:', req.request.headers);
  console.log('Body:', req.request.body);
  req.flush([]);
});
```

### Pausar ejecución en breakpoint
```typescript
it('debería pausar aquí', (done) => {
  debugger;  // ← Abre DevTools automáticamente en navegador
  
  service.metodo().subscribe(() => {
    done();
  });
  
  httpMock.expectOne('/endpoint').flush({});
});
```

### Logging verbose
```bash
npm test -- --log-level=debug
```

---

## CI/CD Integration

### En pipeline (GitHub Actions, GitLab CI, etc.)
```yaml
- name: Run tests
  run: npm test -- --watch=false --code-coverage

- name: Check coverage
  run: npm test -- --watch=false --code-coverage --browsers=ChromeHeadless
```

### Pre-commit hook (husky)
```bash
# .husky/pre-commit
npm test -- --watch=false
```

---

## Troubleshooting

| Problema | Solución |
|---|---|
| **Tests "timeout"** | Aumentar timeout: `jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;` |
| **HttpTestingController error** | Asegurar `httpMock.verify()` en `afterEach` |
| **Signals no actualizan** | Usar `fixture.detectChanges()` después de cambio |
| **Component fixture vacío** | `TestBed.createComponent()` retorna fixture, acceder con `.componentInstance` |
| **Spy no intercepta llamadas** | Asegurar que el spy está inyectado antes de crear componente |
| **Async timers "pendientes"** | Usar `fakeAsync()` y `tick()` para controlar tiempo |

---

## Ejemplos Prácticos

### Test de formulario reactivo
```typescript
it('debería validar email requerido', () => {
  const control = component.form.get('email');
  control?.setValue('');
  control?.markAsTouched();

  expect(control?.hasError('required')).toBe(true);
});
```

### Test de observable con error
```typescript
it('debería manejar error 401', (done) => {
  service.listar().subscribe(
    () => fail('should error'),
    (error) => {
      expect(error.status).toBe(401);
      done();
    }
  );

  const req = httpMock.expectOne('/api');
  req.error(new ErrorEvent('Unauthorized'), { status: 401 });
});
```

### Test de guard funcional
```typescript
it('debería permitir acceso si autenticado', () => {
  authService.isAuthenticated = signal(true);

  TestBed.runInInjectionContext(() => {
    const result = authGuard();
    expect(result).toBe(true);
  });
});
```

---

## Recursos

- [Jasmine Docs](https://jasmine.github.io/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [HttpClientTestingModule](https://angular.io/api/common/http/testing/HttpClientTestingModule)
- [Testing Signals](https://angular.io/guide/signals#testing)


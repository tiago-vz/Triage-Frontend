# AGENTS.md — Triagre Frontend (Angular 17)

## Project Overview
**Triagre Frontend** es un sistema de gestión de solicitudes académicas construido con Angular 17 usando **standalone components, Signals, y functional guards**.

### Core Tech Stack
- **Angular 17** — Standalone components (no NgModules), Signals para reactividad, functional guards/interceptors
- **RxJS 7.8** — Observables para HTTP y manejo asincrónico
- **TypeScript 5.2** — Strict mode habilitado, path aliases configurados
- **Reactive Forms** — Validación declarativa y sincronización con backend

### Development Commands
```bash
npm install          # Instalar dependencias
npm start           # Servidor dev: http://localhost:4200
npm run build       # Build production (dist/triagre-frontend/)
npm run watch       # Build watch mode para desarrollo
```

---

## Architecture Patterns

### 1. **Functional Guards & Interceptors** (Angular 15+)
Los guards y interceptors son funciones, no clases. `inject()` obtiene dependencias.

**Pattern:**
```typescript
// src/app/core/auth/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/auth/login']);
};
```

**Aplicación en rutas:**
```typescript
// src/app/app.routes.ts
{ path: 'dashboard', canActivate: [authGuard], loadComponent: ... }
```

### 2. **Signals for Reactive State** (Angular 17)
Reemplaza RxJS subjects en la mayoría de casos. Las signals son síncronas y más performantes.

**Pattern en servicios:**
```typescript
// src/app/core/auth/auth.service.ts
private _usuario = signal<UsuarioSesion | null>(this.parseToken(localStorage.getItem('triagre_token')));
readonly usuario = this._usuario.asReadonly();  // ← Exponer como "lectura"
readonly isCoordinador = computed(() => this._usuario()?.rol === Rol.COORDINADOR);
```

**Consumir en componentes:**
```typescript
@Component(...)
export class MyComponent {
  readonly isCoordinador = inject(AuthService).isCoordinador;
  // En template: *ngIf="isCoordinador()" — la signal se ejecuta como función
}
```

### 3. **Component Input Binding from Routes**
`withComponentInputBinding()` en `app.config.ts` permite que parámetros de ruta lleguen como `@Input()`.

```typescript
// RUTA: /solicitudes/:id
// COMPONENTE:
@Input() id!: string;  // ← Llega automáticamente de la URL
ngOnInit() {
  this.service.obtenerDetalle(Number(this.id)).subscribe(...);
}
```

### 4. **Lazy Loading de Rutas**
Las características se cargan solo cuando se navega a ellas.

```typescript
{
  path: 'auth',
  loadChildren: () =>
    import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
}
```

---

## Workflow de Autenticación

### Flujo de Login
1. Usuario ingresa credenciales → `AuthService.login(request)` → POST `/auth/login`
2. Backend devuelve `{ token: "eyJhbGc..." }`
3. Token se guarda en `localStorage['triagre_token']`
4. `AuthService` decodifica JWT sin librería (base64 el payload)
5. Extrae `{ sub (email), rol, nombre, exp }` → actualiza signal `_usuario`
6. Componentes reaccionan automáticamente a cambios de `usuario()` y `isAuthenticated()`

### Token Management
- **Almacenamiento:** `localStorage['triagre_token']`
- **Inyección:** `jwt.interceptor.ts` agrega `Authorization: Bearer {token}` a todos los requests
- **Expiración:** Si JWT expirado → interceptor detecta 401 → `logout()` automático
- **Sin refresh:** El sistema no implementa refresh tokens

### Roles y Guards
| Rol              | Guard             | Acceso                           |
|------------------|-------------------|----------------------------------|
| ESTUDIANTE       | `authGuard`       | Dashboard, crear, ver solicitudes|
| DOCENTE          | `authGuard`       | Dashboard, crear, ver solicitudes|
| ADMINISTRATIVO   | `authGuard`       | Dashboard, crear, ver solicitudes|
| COORDINADOR      | `coordinadorGuard`| + Workflow (clasificar, asignar, atender, cerrar) |

---

## Flujo de Solicitudes (Workflow)

### Estados y Transiciones
```
REGISTRADA → CLASIFICADA → EN_ATENCION → ATENDIDA → CERRADA
```

**Solo COORDINADOR puede avanzar estados.** Otros roles ven solicitudes pero no pueden cambiar estado.

### Endpoints por Acción Coordinador
```typescript
// src/app/core/auth/solicitud.service.ts

// Clasificación: asignar tipo y prioridad
clasificar(id, { tipoSolicitudId, prioridad, justificacionPrioridad })
  → PUT /solicitudes/{id}/clasificacion

// Asignación: asignar usuario responsable
asignar(id, { usuarioId })
  → POST /solicitudes/{id}/asignacion

// Atención: marcar en atención
atender(id, { comentariosAtencion })
  → PUT /solicitudes/{id}/atencion

// Cierre: cerrar solicitud
cerrar(id, { comentariosCierre })
  → POST /solicitudes/{id}/cierre
```

### Historial
`GET /solicitudes/{id}/historial` → lista de cambios de estado con timestamps y comentarios.

---

## Response Wrapping Pattern

**Todo endpoint devuelve un wrapper:**
```typescript
// Backend response
{
  "success": true,
  "message": "...",
  "data": { /* objeto real */ }
}

// Interface
interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// En servicios, extraer .data con map()
this.http.post<SuccessResponse<SolicitudResponse>>(...).pipe(
  map(r => r.data)  // ← Devuelve solo el payload
)
```

---

## Estructura de Carpetas y Path Aliases

```
src/app/
├── core/                    ← lógica compartida
│   ├── auth/               ← AuthService, guards, JWT interceptor
│   ├── interceptors/       ← jwt.interceptor (functional)
│   └── models/             ← interfaces, enums, tipos globales
├── features/               ← páginas/features lazy-loaded
│   ├── auth/               ← login, register
│   ├── dashboard/          ← dashboard por rol
│   └── solicitudes/        ← CRUD: lista, crear, detalle
├── shared/                 ← componentes reutilizables
│   ├── components/         ← sidebar, badges, etc.
│   └── pipes/              ← pipes personalizados (labels)
└── environments/           ← config por ambiente
```

**Path Aliases** (tsconfig.json):
```typescript
@core/*     → src/app/core/*
@shared/*   → src/app/shared/*
@features/* → src/app/features/*
@env/*      → src/environments/*
```

---

## Key Services

### AuthService
- **Responsabilidad:** Gestionar sesión del usuario, signals reactivas
- **Métodos públicos:** `login()`, `register()`, `logout()`
- **Signals:** `usuario()`, `token()`, `isAuthenticated()`, `isCoordinador()`, `rol()`
- **Ubicación:** `src/app/core/auth/auth.service.ts`

### SolicitudService
- **Responsabilidad:** CRUD de solicitudes + workflow actions
- **Métodos:** `listar()`, `crear()`, `obtenerDetalle()`, `clasificar()`, `asignar()`, `atender()`, `cerrar()`, `obtenerHistorial()`
- **Nota:** Todos los endpoints usan `SolicitudFiltros` con paginación (page, size)
- **Ubicación:** `src/app/core/auth/solicitud.service.ts`

### CatalogoService
- **Responsabilidad:** Datos de referencia (tipos de solicitud, usuarios, prioridades)
- **Métodos:** `getTiposSolicitud()`, `getUsuarios()`
- **Ubicación:** `src/app/core/auth/catalogo.service.ts`

---

## Common Patterns & Conventions

### Componentes Standalone
```typescript
@Component({
  selector: 'app-mi-componente',
  standalone: true,  // ← Siempre true
  imports: [CommonModule, ReactiveFormsModule, ...],  // ← Imports explícitos
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.css'  // ← si hay estilos
})
export class MiComponenteComponent { }
```

### Formularios Reactivos
```typescript
constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
}

// En template
<input formControl="email" />
<div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
  Correo inválido
</div>
```

### Componentes con Datos
Los componentes feature típicamente:
1. Declaran signals para estado (`loading`, `data`, `error`)
2. Inyectan servicios
3. Llaman a servicios en `ngOnInit()` o métodos
4. Usan `subscribe()` con `{ next, error }` handlers
5. Actualizan signals con `signal.set()`

```typescript
page = signal<PageResponse<SolicitudResponse> | null>(null);
loading = signal(true);

ngOnInit() {
  this.service.listar(this.filtros).subscribe({
    next: (p) => { this.page.set(p); this.loading.set(false); },
    error: () => this.loading.set(false),
  });
}
```

### Modelos de Datos
Los modelos de backend están espejados en TypeScript (enums, interfaces):
- `EstadoSolicitud`, `NivelPrioridad`, `CanalOrigen` → enums
- `SolicitudResponse`, `PageResponse<T>` → interfaces
- `ESTADO_LABELS`, `PRIORIDAD_LABELS` → dictionaries para UI

---

## Debugging & Development Tips

### Backend Connectivity
El backend **debe estar corriendo en `http://localhost:8080`** (ver `src/environments/environment.ts`).

Si errores CORS: asegurar en backend `SecurityConfig.java`:
```java
config.setAllowedOrigins(List.of("http://localhost:4200"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
```

### Network Inspection
Los requests van con `Authorization: Bearer {token}` (inyectado por `jwt.interceptor`).
En DevTools → Network: buscar `Authorization` header.

### State Tracing
Angular DevTools detecta signals. En DevTools → Angular tab:
- Ver `AuthService.usuario()` en vivo
- Confirmar cambios de `isCoordinador()` al login

### Build Checks
```
npm run build  # Buscará errores TypeScript + compilation
```

---

## Common Gotchas

1. **Signals no son Observables** — Para reactividad en template, llamar como función: `{{ usuario() }}`
2. **jwt.interceptor solo inyecta en requests salientes** — No se ejecuta en requests del browser (favicon, assets)
3. **withComponentInputBinding() requiere lazy loading** — @Input() funciona solo si la ruta es lazy
4. **No hay logout automático sin 401** — Si token expira pero backend no lo valida, usuario sigue "loggeado" localmente
5. **CORS es responsabilidad del backend** — Frontend no puede bypasear CORS

---

## Adding New Features

### Nuevo Endpoint
1. Agregar interface en `src/app/core/models/`
2. Agregar método en servicio correspondiente
3. Mapear response con `.pipe(map(r => r.data))` si es wrapped
4. Inyectar servicio en componente, llamar en `ngOnInit()`

### Nuevo Guard por Rol
```typescript
export const misRolesGuard = (): CanActivateFn =>
  roleGuard([Rol.ESTUDIANTE, Rol.DOCENTE]);

// En ruta:
{ path: 'ruta', canActivate: [misRolesGuard()], loadComponent: ... }
```

### Nuevo Pipe
Crear en `src/app/shared/pipes/` → exportar → importar en componentes standalone que lo usen.

---

## TypeScript Strict Checks
- `noImplicitOverride: true` — detecta sobrescrituras accidentales
- `noPropertyAccessFromIndexSignature: true` — evita acceso inseguro a objetos
- `strictTemplates: true` — validación de tipos en templates

Siempre cumplir estas reglas. Si hay error de tipo, **no desactivar strict**, refactorizar el código.


# Triagre Frontend — Angular 17

Frontend del Sistema de Gestión de Solicitudes Académicas.  
Construido con Angular 17 (standalone components + signals + functional guards).

## Stack

- **Angular 17** — Standalone components, Signals, functional guards/interceptors
- **Angular Forms** — Reactive Forms con validación
- **Angular Router** — Lazy loading, guards por rol
- **RxJS** — Manejo de peticiones HTTP
- **IBM Plex Sans/Mono** — Tipografía institucional refinada

## Inicio rápido

```bash
npm install
ng serve
```

La app corre en `http://localhost:4200`  
El backend debe estar en `http://localhost:8080`

## Estructura

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts       ← JWT storage + signals reactivos
│   │   ├── auth.guard.ts         ← Protege rutas autenticadas
│   │   ├── role.guard.ts         ← Protege rutas por rol
│   │   ├── solicitud.service.ts  ← HTTP: CRUD de solicitudes
│   │   └── catalogo.service.ts   ← HTTP: tipos, prioridades, usuarios
│   ├── interceptors/
│   │   └── jwt.interceptor.ts    ← Adjunta Bearer token + maneja 401
│   └── models/
│       ├── enums.ts              ← Espejo de enums del backend
│       ├── solicitud.model.ts    ← Interfaces de solicitudes
│       ├── usuario.model.ts      ← Interfaces de usuarios/auth
│       └── catalogo.model.ts     ← Interfaces de catálogos
│
├── features/
│   ├── auth/login/               ← Página de login
│   ├── auth/register/            ← Registro institucional
│   ├── dashboard/                ← Dashboard con métricas
│   └── solicitudes/
│       ├── lista/                ← Tabla con filtros + paginación
│       ├── crear/                ← Formulario de nueva solicitud
│       └── detalle/              ← Detalle + historial + workflow (coordinador)
│
└── shared/
    ├── components/
    │   ├── sidebar/              ← Navegación lateral
    │   ├── estado-badge/         ← Badge de estado con color
    │   └── prioridad-badge/      ← Badge de prioridad con color
    └── pipes/
        ├── estado-label.pipe.ts
        └── prioridad-label.pipe.ts
```

## Flujo de estados (workflow)

```
REGISTRADA → CLASIFICADA → EN_ATENCION → ATENDIDA → CERRADA
```

Solo el **COORDINADOR** puede avanzar el estado de una solicitud.  
Los demás roles pueden crear y ver solicitudes.

## Roles y dominios

| Rol            | Dominio de email                   |
|----------------|------------------------------------|
| ESTUDIANTE     | @estudiante.triagre.com            |
| DOCENTE        | @docente.triagre.com               |
| ADMINISTRATIVO | @administrativo.triagre.com        |
| COORDINADOR    | @coordinacion.triagre.com          |

## CORS en el backend

Asegúrate de agregar esto en `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

Y agregar `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` en el `filterChain`.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { coordinadorGuard } from './core/auth/role.guard';

export const routes: Routes = [
  // Redirigir raíz al dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // --- Rutas públicas (sin auth) ---
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // --- Rutas protegidas ---
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'solicitudes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/solicitudes/lista/lista-solicitudes.component')
            .then(m => m.ListaSolicitudesComponent),
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./features/solicitudes/crear/crear-solicitud.component')
            .then(m => m.CrearSolicitudComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/solicitudes/detalle/detalle-solicitud.component')
            .then(m => m.DetalleSolicitudComponent),
      },
    ],
  },

  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'tipos-solicitud',
    canActivate: [coordinadorGuard],
    loadComponent: () =>
      import('./features/tipos-solicitud/tipos-solicitud.component').then(m => m.TiposSolicitudComponent),
  },

  // Wildcard: página no encontrada
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

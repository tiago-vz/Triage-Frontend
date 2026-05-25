import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from '../models';

// Guard de rol: solo deja pasar al COORDINADOR
export const coordinadorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isCoordinador()) {
    return true;
  }
  // Si está autenticado pero no es coordinador, redirige al dashboard
  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  return router.createUrlTree(['/auth/login']);
};

// Guard genérico por rol (para futuros usos)
export const roleGuard = (rolesPermitidos: Rol[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rolActual = auth.rol();

    if (rolActual && rolesPermitidos.includes(rolActual)) {
      return true;
    }
    if (auth.isAuthenticated()) {
      return router.createUrlTree(['/dashboard']);
    }
    return router.createUrlTree(['/auth/login']);
  };
};

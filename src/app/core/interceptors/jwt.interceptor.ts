import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Interceptor funcional JWT (Angular 17+)
 * 
 * Responsabilidades:
 * 1. Adjunta el Bearer token a cada request saliente
 * 2. Si el servidor responde 401, cierra la sesión automáticamente
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Clonar el request con el header Authorization si hay token
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido: limpiar sesión
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};

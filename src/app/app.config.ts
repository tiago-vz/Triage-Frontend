import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ZoneChangeDetection optimizado para mejor rendimiento
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con binding de parámetros a @Input() de los componentes
    provideRouter(routes, withComponentInputBinding()),

    // HttpClient con el interceptor JWT registrado
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};

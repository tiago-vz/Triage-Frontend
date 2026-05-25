import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { coordinadorGuard, roleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { Rol } from '../models';
import { signal } from '@angular/core';

describe('coordinadorGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isCoordinador: signal(false),
      isAuthenticated: signal(false)
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('debería permitir acceso si usuario es COORDINADOR', () => {
    authService.isCoordinador = signal(true);

    TestBed.runInInjectionContext(() => {
      const result = coordinadorGuard();
      expect(result).toBe(true);
    });
  });

  it('debería redirigir al dashboard si es autenticado pero no es coordinador', () => {
    const mockUrlTree = { toString: () => '/dashboard' };
    router.createUrlTree.and.returnValue(mockUrlTree as any);
    authService.isCoordinador = signal(false);
    authService.isAuthenticated = signal(true);

    TestBed.runInInjectionContext(() => {
      const result = coordinadorGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      expect(result).toEqual(mockUrlTree);
    });
  });

  it('debería redirigir a login si no está autenticado', () => {
    const mockUrlTree = { toString: () => '/auth/login' };
    router.createUrlTree.and.returnValue(mockUrlTree as any);
    authService.isCoordinador = signal(false);
    authService.isAuthenticated = signal(false);

    TestBed.runInInjectionContext(() => {
      const result = coordinadorGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});

describe('roleGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      rol: signal<Rol | null>(null),
      isAuthenticated: signal(false)
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('debería permitir acceso si usuario está en rolesPermitidos', () => {
    authService.rol = signal(Rol.ESTUDIANTE);

    TestBed.runInInjectionContext(() => {
      const guard = roleGuard([Rol.ESTUDIANTE, Rol.DOCENTE]);
      const result = guard();
      expect(result).toBe(true);
    });
  });

  it('debería denegar acceso si usuario no está en rolesPermitidos', () => {
    const mockUrlTree = { toString: () => '/dashboard' };
    router.createUrlTree.and.returnValue(mockUrlTree as any);
    authService.rol = signal(Rol.COORDINADOR);
    authService.isAuthenticated = signal(true);

    TestBed.runInInjectionContext(() => {
      const guard = roleGuard([Rol.ESTUDIANTE, Rol.DOCENTE]);
      const result = guard();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  it('debería redirigir a login si no está autenticado', () => {
    const mockUrlTree = { toString: () => '/auth/login' };
    router.createUrlTree.and.returnValue(mockUrlTree as any);
    authService.rol = signal(null);
    authService.isAuthenticated = signal(false);

    TestBed.runInInjectionContext(() => {
      const guard = roleGuard([Rol.ESTUDIANTE, Rol.DOCENTE]);
      const result = guard();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  it('debería permitir múltiples roles', () => {
    authService.rol = signal(Rol.DOCENTE);

    TestBed.runInInjectionContext(() => {
      const guard = roleGuard([Rol.ESTUDIANTE, Rol.DOCENTE, Rol.COORDINADOR]);
      const result = guard();
      expect(result).toBe(true);
    });
  });
});


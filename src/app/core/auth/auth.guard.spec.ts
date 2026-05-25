import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Rol } from '../models';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
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

  it('debería permitir acceso si usuario está autenticado', () => {
    authService.isAuthenticated = signal(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      expect(result).toBe(true);
    });
  });

  it('debería redirigir a login si usuario no está autenticado', () => {
    const mockUrlTree = { toString: () => '/auth/login' };
    router.createUrlTree.and.returnValue(mockUrlTree as any);
    authService.isAuthenticated = signal(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
      expect(result).toEqual(mockUrlTree);
    });
  });
});


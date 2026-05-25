import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, RegisterRequest, UsuarioSesion, Rol } from '../models';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQHRlc3QuY29tIiwicm9sIjoiQ09PSURJREFET1IiLCJub21icmUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.test';

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Limpiar localStorage
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('debería enviar POST request y guardar token', (done) => {
      const loginReq: LoginRequest = { email: 'test@example.com', password: 'password' };
      const response: LoginResponse = { token: mockToken };

      service.login(loginReq).subscribe(() => {
        expect(localStorage.getItem('triagre_token')).toBe(mockToken);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });

    it('debería actualizar signals després del login', (done) => {
      const loginReq: LoginRequest = { email: 'test@example.com', password: 'password' };
      const response: LoginResponse = { token: mockToken };

      service.login(loginReq).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        expect(service.usuario()?.email).toBe('john@test.com');
        expect(service.usuario()?.rol).toBe(Rol.COORDINADOR);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(response);
    });
  });

  describe('register', () => {
    it('debería enviar POST request de registro', (done) => {
      const registerReq: RegisterRequest = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password'
      };

      service.register(registerReq).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Registered', data: null });
    });
  });

  describe('logout', () => {
    it('debería limpiar token y usuario, redirigir a login', () => {
      // Primero setear sesión
      localStorage.setItem('triagre_token', mockToken);
      service.logout();

      expect(localStorage.getItem('triagre_token')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.usuario()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('Token parsing', () => {
    it('debería decodificar correctamente JWT con base64', () => {
      localStorage.setItem('triagre_token', mockToken);

      // Acceder al servicio nuevamente para cargar token
      const newService = TestBed.inject(AuthService);

      expect(newService.usuario()?.email).toBe('john@test.com');
      expect(newService.usuario()?.rol).toBe(Rol.COORDINADOR);
      expect(newService.usuario()?.nombre).toBe('John Doe');
    });

    it('debería retornar null si token es inválido', () => {
      const invalidToken = 'invalid.token.format';
      localStorage.setItem('triagre_token', invalidToken);

      const newService = TestBed.inject(AuthService);
      expect(newService.usuario()).toBeNull();
    });

    it('debería retornar null si token ha expirado', () => {
      // Token con exp en el pasado (valor pequeño)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwicm9sIjoiRVNUVURJQU5URSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxfQ.test';
      localStorage.setItem('triagre_token', expiredToken);

      const newService = TestBed.inject(AuthService);
      expect(newService.usuario()).toBeNull();
    });
  });

  describe('isCoordinador computed signal', () => {
    it('debería retornar true si usuario es COORDINADOR', () => {
      localStorage.setItem('triagre_token', mockToken);

      const newService = TestBed.inject(AuthService);
      expect(newService.isCoordinador()).toBe(true);
    });

    it('debería retornar false si usuario no es COORDINADOR', () => {
      const estudianteToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkZW50QHRlc3QuY29tIiwicm9sIjoiRVNUVURJQU5URSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
      localStorage.setItem('triagre_token', estudianteToken);

      const newService = TestBed.inject(AuthService);
      expect(newService.isCoordinador()).toBe(false);
    });
  });

  describe('rol signal', () => {
    it('debería extraer correctamente el rol del JWT', () => {
      localStorage.setItem('triagre_token', mockToken);

      const newService = TestBed.inject(AuthService);
      expect(newService.rol()).toBe(Rol.COORDINADOR);
    });
  });
});


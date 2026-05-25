import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../auth/auth.service';
import { signal } from '@angular/core';

describe('jwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  const mockToken = 'test-token-123';

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      token: signal(mockToken)
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería agregar header Authorization cuando hay token', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('NO debería agregar header Authorization si no hay token', () => {
    authService.token = signal(null);
    const testBed = TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });

    const client = TestBed.inject(HttpClient);
    client.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('debería hacer logout en respuesta 401', () => {
    httpClient.get('/test').subscribe(
      () => {},
      (error) => {
        expect(error.status).toBe(401);
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
  });

  it('debería no hacer logout en otros errores HTTP', () => {
    httpClient.get('/test').subscribe(
      () => {},
      (error) => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('debería pasar errores después de procesarlos', (done) => {
    httpClient.get('/test').subscribe(
      () => fail('should have failed'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        done();
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('debería hacer logout y pasar error en 401', (done) => {
    httpClient.get('/test').subscribe(
      () => fail('should have failed'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(authService.logout).toHaveBeenCalled();
        done();
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});


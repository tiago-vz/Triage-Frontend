import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar formulario con campos vacíos', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('debería validar que email es requerido', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();

    expect(emailControl?.hasError('required')).toBe(true);
    expect(emailControl?.invalid).toBe(true);
  });

  it('debería validar formato de email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

    expect(emailControl?.hasError('email')).toBe(true);
    expect(emailControl?.invalid).toBe(true);
  });

  it('debería validar que password es requerido', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('');
    passwordControl?.markAsTouched();

    expect(passwordControl?.hasError('required')).toBe(true);
    expect(passwordControl?.invalid).toBe(true);
  });

  it('debería aceptar email y password válidos', () => {
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');

    expect(component.form.valid).toBe(true);
  });

  it('debería llamar a AuthService.login con credenciales válidas', () => {
    authService.login.and.returnValue(of({ token: 'mock-token' }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');
    component.submit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('debería navegar al dashboard después de login exitoso', (done) => {
    authService.login.and.returnValue(of({ token: 'mock-token' }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');
    component.submit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 100);
  });

  it('debería mostrar error cuando login falla', () => {
    const errorResponse = { error: { message: 'Credenciales incorrectas' } };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('wrongpassword');
    component.submit();

    expect(component.error()).toBe('Credenciales incorrectas');
    expect(component.loading()).toBe(false);
  });

  it('debería mostrar mensaje genérico si error no tiene detalles', () => {
    const errorResponse = { error: null };
    authService.login.and.returnValue(throwError(() => errorResponse));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('wrongpassword');
    component.submit();

    expect(component.error()).toBe('Credenciales incorrectas');
  });

  it('debería no enviar si formulario es inválido', () => {
    component.form.get('email')?.setValue('invalid');
    component.form.get('password')?.setValue('');
    component.submit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('debería marcar campos como touched cuando submit con inválidos', () => {
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');
    component.submit();

    expect(component.form.get('email')?.touched).toBe(true);
    expect(component.form.get('password')?.touched).toBe(true);
  });

  it('debería mostrar estado loading durante login', () => {
    authService.login.and.returnValue(of({ token: 'mock-token' }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');

    component.submit();

    expect(component.loading()).toBe(true);
  });

  it('debería limpiar error al comenzar nuevo submit', () => {
    component.error.set('Previous error');
    authService.login.and.returnValue(of({ token: 'mock-token' }));

    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');
    component.submit();

    expect(component.error()).toBe(null);
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CrearSolicitudComponent } from './crear-solicitud.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SolicitudResponse, CanalOrigen, EstadoSolicitud, CanalOrigen as CanalOrigenEnum } from '../../../core/models';
import { of, throwError } from 'rxjs';

describe('CrearSolicitudComponent', () => {
  let component: CrearSolicitudComponent;
  let fixture: ComponentFixture<CrearSolicitudComponent>;
  let solicitudService: jasmine.SpyObj<SolicitudService>;
  let router: jasmine.SpyObj<Router>;

  const mockSolicitudResponse: SolicitudResponse = {
    id: 10,
    descripcion: 'Nueva solicitud',
    estado: EstadoSolicitud.REGISTRADA,
    canalOrigen: CanalOrigen.CORREO,
    tipoSolicitudId: null,
    prioridad: null,
    justificacionPrioridad: null,
    usuarioAsignadoId: null,
    solicitanteId: 101,
    fechaCreacion: new Date().toISOString(),
  };

  beforeEach(async () => {
    const solicitudServiceSpy = jasmine.createSpyObj('SolicitudService', ['crear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, ReactiveFormsModule, RouterLink,
        CrearSolicitudComponent,
        SidebarComponent
      ],
      providers: [
        { provide: SolicitudService, useValue: solicitudServiceSpy },
        { provide: Router, useValue: routerSpy },
        FormBuilder
      ]
    }).compileComponents();

    solicitudService = TestBed.inject(SolicitudService) as jasmine.SpyObj<SolicitudService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(CrearSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar formulario con campos vacíos', () => {
    expect(component.form.get('descripcion')?.value).toBe('');
    expect(component.form.get('canalOrigen')?.value).toBeNull();
  });

  it('debería validar que descripción es requerida', () => {
    const descControl = component.form.get('descripcion');
    descControl?.setValue('');
    descControl?.markAsTouched();

    expect(descControl?.hasError('required')).toBe(true);
    expect(descControl?.invalid).toBe(true);
  });

  it('debería validar longitud mínima de descripción', () => {
    const descControl = component.form.get('descripcion');
    descControl?.setValue('corta');
    descControl?.markAsTouched();

    expect(descControl?.hasError('minlength')).toBe(true);
    expect(descControl?.invalid).toBe(true);
  });

  it('debería aceptar descripción válida', () => {
    component.form.get('descripcion')?.setValue('Esta es una descripción válida');
    expect(component.form.get('descripcion')?.valid).toBe(true);
  });

  it('debería validar que canal es requerido', () => {
    const canalControl = component.form.get('canalOrigen');
    canalControl?.setValue(null);
    canalControl?.markAsTouched();

    expect(canalControl?.hasError('required')).toBe(true);
    expect(canalControl?.invalid).toBe(true);
  });

  it('debería aceptar canal válido', () => {
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CORREO);
    expect(component.form.valid).toBe(false); // descripción aún está vacía
  });

  it('debería permitir submit con datos válidos', () => {
    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CSU);

    expect(component.form.valid).toBe(true);
  });

  it('debería crear solicitud con datos válidos', (done) => {
    solicitudService.crear.and.returnValue(of(mockSolicitudResponse));
    router.navigate.and.returnValue(Promise.resolve(true));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.TELEFONICO);
    component.submit();

    setTimeout(() => {
      expect(solicitudService.crear).toHaveBeenCalledWith({
        descripcion: 'Una descripción de prueba aquí',
        canalOrigen: CanalOrigen.TELEFONICO
      });
      done();
    }, 100);
  });

  it('debería navegar a detalle después de crear', (done) => {
    solicitudService.crear.and.returnValue(of(mockSolicitudResponse));
    router.navigate.and.returnValue(Promise.resolve(true));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CORREO);
    component.submit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/solicitudes', 10]);
      done();
    }, 100);
  });

  it('debería mostrar error cuando creación falla', () => {
    const errorResponse = { error: { message: 'Error en servidor' } };
    solicitudService.crear.and.returnValue(throwError(() => errorResponse));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.SAC);
    component.submit();

    expect(component.error()).toBe('Error en servidor');
    expect(component.loading()).toBe(false);
  });

  it('debería mostrar mensaje genérico si error no tiene detalles', () => {
    const errorResponse = { error: null };
    solicitudService.crear.and.returnValue(throwError(() => errorResponse));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CORREO);
    component.submit();

    expect(component.error()).toBe('Error al crear la solicitud');
  });

  it('debería no enviar si formulario es inválido', () => {
    component.form.get('descripcion')?.setValue('corta');
    component.form.get('canalOrigen')?.setValue(null);
    component.submit();

    expect(solicitudService.crear).not.toHaveBeenCalled();
  });

  it('debería marcar campos como touched cuando submit con inválidos', () => {
    component.form.get('descripcion')?.setValue('');
    component.form.get('canalOrigen')?.setValue(null);
    component.submit();

    expect(component.form.get('descripcion')?.touched).toBe(true);
    expect(component.form.get('canalOrigen')?.touched).toBe(true);
  });

  it('debería mostrar estado loading durante creación', (done) => {
    solicitudService.crear.and.returnValue(of(mockSolicitudResponse));
    router.navigate.and.returnValue(Promise.resolve(true));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CORREO);

    component.submit();
    expect(component.loading()).toBe(true);

    setTimeout(() => {
      done();
    }, 100);
  });

  it('debería limpiar error al comenzar nuevo submit', (done) => {
    component.error.set('Error anterior');
    solicitudService.crear.and.returnValue(of(mockSolicitudResponse));
    router.navigate.and.returnValue(Promise.resolve(true));

    component.form.get('descripcion')?.setValue('Una descripción de prueba aquí');
    component.form.get('canalOrigen')?.setValue(CanalOrigen.CORREO);
    component.submit();

    setTimeout(() => {
      expect(component.error()).toBe(null);
      done();
    }, 100);
  });

  it('debería tener acceso a labels de canales', () => {
    expect(component.canalLabels[CanalOrigen.CORREO]).toBeDefined();
    expect(component.canalLabels[CanalOrigen.CSU]).toBeDefined();
  });

  it('debería mostrar todos los canales disponibles', () => {
    expect(component.canales).toContain(CanalOrigen.CORREO);
    expect(component.canales).toContain(CanalOrigen.CSU);
    expect(component.canales).toContain(CanalOrigen.TELEFONICO);
    expect(component.canales).toContain(CanalOrigen.SAC);
  });

  it('debería llenar correctamente todos los campos del formulario', () => {
    const formData = {
      descripcion: 'Solicitud de prueba con datos completos',
      canalOrigen: CanalOrigen.CORREO
    };

    component.form.patchValue(formData);

    expect(component.form.get('descripcion')?.value).toBe(formData.descripcion);
    expect(component.form.get('canalOrigen')?.value).toBe(formData.canalOrigen);
  });
});


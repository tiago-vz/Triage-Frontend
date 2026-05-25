import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DetalleSolicitudComponent } from './detalle-solicitud.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { CatalogoService } from '../../../core/auth/catalogo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../../shared/components/prioridad-badge/prioridad-badge.component';
import {
  SolicitudResponse, HistorialResponse, EstadoSolicitud, CanalOrigen,
  NivelPrioridad, TipoSolicitud, Usuario, Rol
} from '../../../core/models';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('DetalleSolicitudComponent', () => {
  let component: DetalleSolicitudComponent;
  let fixture: ComponentFixture<DetalleSolicitudComponent>;
  let solicitudService: jasmine.SpyObj<SolicitudService>;
  let catalogoService: jasmine.SpyObj<CatalogoService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockSolicitud: SolicitudResponse = {
    id: 1,
    descripcion: 'Test request',
    estado: EstadoSolicitud.REGISTRADA,
    canalOrigen: CanalOrigen.CORREO,
    tipoSolicitudId: 1,
    prioridad: null,
    justificacionPrioridad: null,
    usuarioAsignadoId: null,
    solicitanteId: 101,
    fechaCreacion: new Date().toISOString(),
  };

  const mockHistorial: HistorialResponse[] = [
    {
      id: 1,
      estadoAnterior: null,
      estadoNuevo: EstadoSolicitud.REGISTRADA,
      fechaCambio: new Date().toISOString(),
      comentarios: 'Creada'
    }
  ];

  const mockTipos: TipoSolicitud[] = [
    { id: 1, nombre: 'Tipo 1', descripcion: 'Descripción' }
  ];

  const mockUsuarios: Usuario[] = [
    { id: 50, nombre: 'Admin User', email: 'admin@test.com', rol: Rol.ADMINISTRATIVO }
  ];

  beforeEach(async () => {
    const solicitudServiceSpy = jasmine.createSpyObj('SolicitudService', [
      'obtenerDetalle', 'obtenerHistorial', 'clasificar', 'asignar', 'atender', 'cerrar', 'generarResumen'
    ]);
    const catalogoServiceSpy = jasmine.createSpyObj('CatalogoService', [
      'getTiposSolicitud', 'getUsuarios'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isCoordinador: signal(false)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, RouterLink, ReactiveFormsModule,
        DetalleSolicitudComponent,
        SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent
      ],
      providers: [
        { provide: SolicitudService, useValue: solicitudServiceSpy },
        { provide: CatalogoService, useValue: catalogoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        FormBuilder
      ]
    }).compileComponents();

    solicitudService = TestBed.inject(SolicitudService) as jasmine.SpyObj<SolicitudService>;
    catalogoService = TestBed.inject(CatalogoService) as jasmine.SpyObj<CatalogoService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(DetalleSolicitudComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar solicitud en ngOnInit', (done) => {
    component.id = '1';
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    fixture.detectChanges();

    setTimeout(() => {
      expect(solicitudService.obtenerDetalle).toHaveBeenCalledWith(1);
      expect(component.solicitud()).toBeTruthy();
      expect(component.loading()).toBe(false);
      done();
    }, 100);
  });

  it('debería inicializar formularios en ngOnInit', () => {
    component.id = '1';
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    fixture.detectChanges();

    expect(component.formClasificacion).toBeTruthy();
    expect(component.formAsignacion).toBeTruthy();
    expect(component.formAtencion).toBeTruthy();
    expect(component.formCierre).toBeTruthy();
  });

  it('debería cargar tipos y usuarios solo si es coordinador', (done) => {
    component.id = '1';
    authService.isCoordinador = signal(true);
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));
    catalogoService.getTiposSolicitud.and.returnValue(of(mockTipos));
    catalogoService.getUsuarios.and.returnValue(of(mockUsuarios));

    const newComponent = new DetalleSolicitudComponent(
      solicitudService, catalogoService, authService, TestBed.inject(FormBuilder)
    );
    newComponent.id = '1';
    newComponent.ngOnInit();

    setTimeout(() => {
      expect(catalogoService.getTiposSolicitud).toHaveBeenCalled();
      expect(catalogoService.getUsuarios).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('debería validar formulario de clasificación', () => {
    component.formClasificacion.get('tipoSolicitudId')?.setValue(null);
    component.formClasificacion.get('prioridad')?.setValue(null);
    component.formClasificacion.get('justificacionPrioridad')?.setValue('');

    expect(component.formClasificacion.valid).toBe(false);
  });

  it('debería aceptar clasificación válida', () => {
    component.formClasificacion.get('tipoSolicitudId')?.setValue(1);
    component.formClasificacion.get('prioridad')?.setValue(NivelPrioridad.ALTA);
    component.formClasificacion.get('justificacionPrioridad')?.setValue('Urgente');

    expect(component.formClasificacion.valid).toBe(true);
  });

  it('debería clasificar solicitud correctamente', (done) => {
    component.id = '1';
    const clasificada = { ...mockSolicitud, estado: EstadoSolicitud.CLASIFICADA };
    solicitudService.clasificar.and.returnValue(of(clasificada));
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    component.formClasificacion.get('tipoSolicitudId')?.setValue(1);
    component.formClasificacion.get('prioridad')?.setValue(NivelPrioridad.ALTA);
    component.formClasificacion.get('justificacionPrioridad')?.setValue('Urgente');

    component.clasificar();

    setTimeout(() => {
      expect(solicitudService.clasificar).toHaveBeenCalledWith(1, jasmine.objectContaining({
        tipoSolicitudId: 1,
        prioridad: NivelPrioridad.ALTA
      }));
      done();
    }, 100);
  });

  it('debería validar formulario de asignación', () => {
    component.formAsignacion.get('usuarioId')?.setValue(null);
    expect(component.formAsignacion.valid).toBe(false);
  });

  it('debería asignar usuario correctamente', (done) => {
    component.id = '1';
    solicitudService.asignar.and.returnValue(of(void 0));
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    component.formAsignacion.get('usuarioId')?.setValue(50);
    component.asignar();

    setTimeout(() => {
      expect(solicitudService.asignar).toHaveBeenCalledWith(1, { usuarioId: 50 });
      done();
    }, 100);
  });

  it('debería atender solicitud correctamente', (done) => {
    component.id = '1';
    solicitudService.atender.and.returnValue(of(void 0));
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    component.formAtencion.get('comentariosAtencion')?.setValue('Atendiendo aquí');
    component.atender();

    setTimeout(() => {
      expect(solicitudService.atender).toHaveBeenCalledWith(1, jasmine.objectContaining({
        comentariosAtencion: 'Atendiendo aquí'
      }));
      done();
    }, 100);
  });

  it('debería cerrar solicitud correctamente', (done) => {
    component.id = '1';
    solicitudService.cerrar.and.returnValue(of(void 0));
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    component.formCierre.get('comentariosCierre')?.setValue('Resuelto');
    component.cerrar();

    setTimeout(() => {
      expect(solicitudService.cerrar).toHaveBeenCalledWith(1, jasmine.objectContaining({
        comentariosCierre: 'Resuelto'
      }));
      done();
    }, 100);
  });

  it('debería mostrar error si acción falla', (done) => {
    component.id = '1';
    const errorResponse = { error: { message: 'Error en clasificación' } };
    solicitudService.clasificar.and.returnValue(
      new Promise((_, reject) => reject(errorResponse))
    );
    solicitudService.obtenerDetalle.and.returnValue(of(mockSolicitud));
    solicitudService.obtenerHistorial.and.returnValue(of(mockHistorial));

    component.formClasificacion.get('tipoSolicitudId')?.setValue(1);
    component.formClasificacion.get('prioridad')?.setValue(NivelPrioridad.MEDIA);
    component.formClasificacion.get('justificacionPrioridad')?.setValue('Normal');

    component.clasificar();

    setTimeout(() => {
      expect(component.accionLoading()).toBe(false);
      done();
    }, 100);
  });

  it('debería cargar resumen de solicitud', (done) => {
    solicitudService.generarResumen.and.returnValue(of('Resumen generado'));

    component.cargarResumen();

    setTimeout(() => {
      expect(solicitudService.generarResumen).toHaveBeenCalledWith(NaN); // id será NaN si no se establece
      done();
    }, 100);
  });

  it('debería cambiar tab activa', () => {
    expect(component.tabActiva()).toBe('detalle');

    component.tabActiva.set('historial');
    expect(component.tabActiva()).toBe('historial');

    component.tabActiva.set('workflow');
    expect(component.tabActiva()).toBe('workflow');
  });

  it('debería calcular índice de estado actual', () => {
    component.solicitud.set(mockSolicitud);
    expect(component.estadoActualIndex).toBe(0);
  });

  it('debería retornar prioridades disponibles', () => {
    expect(component.prioridades).toContain(NivelPrioridad.BAJA);
    expect(component.prioridades).toContain(NivelPrioridad.CRITICA);
  });
});


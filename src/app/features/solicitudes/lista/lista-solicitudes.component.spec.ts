import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListaSolicitudesComponent } from './lista-solicitudes.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../../shared/components/prioridad-badge/prioridad-badge.component';
import {
  SolicitudResponse, PageResponse, EstadoSolicitud, CanalOrigen, NivelPrioridad
} from '../../../core/models';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ListaSolicitudesComponent', () => {
  let component: ListaSolicitudesComponent;
  let fixture: ComponentFixture<ListaSolicitudesComponent>;
  let solicitudService: jasmine.SpyObj<SolicitudService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockSolicitud: SolicitudResponse = {
    id: 1,
    descripcion: 'Test request',
    estado: EstadoSolicitud.REGISTRADA,
    canalOrigen: CanalOrigen.CORREO,
    tipoSolicitudId: 1,
    prioridad: NivelPrioridad.MEDIA,
    justificacionPrioridad: 'Normal',
    usuarioAsignadoId: null,
    solicitanteId: 101,
    fechaCreacion: new Date().toISOString(),
  };

  const mockPageResponse: PageResponse<SolicitudResponse> = {
    content: [mockSolicitud],
    totalPages: 2,
    totalElements: 20,
    number: 0,
    size: 15
  };

  beforeEach(async () => {
    const solicitudServiceSpy = jasmine.createSpyObj('SolicitudService', ['listar']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isCoordinador: signal(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, RouterLink, FormsModule,
        ListaSolicitudesComponent,
        SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent
      ],
      providers: [
        { provide: SolicitudService, useValue: solicitudServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    solicitudService = TestBed.inject(SolicitudService) as jasmine.SpyObj<SolicitudService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(ListaSolicitudesComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar solicitudes en ngOnInit', (done) => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    fixture.detectChanges();

    setTimeout(() => {
      expect(component.page()).toBeTruthy();
      expect(component.page()?.content.length).toBe(1);
      expect(component.loading()).toBe(false);
      done();
    }, 100);
  });

  it('debería mostrar loading durante carga', () => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    expect(component.loading()).toBe(true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(component.loading()).toBe(false);
    }, 100);
  });

  it('debería aplicar filtros correctamente', (done) => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    component.filtros = { estado: EstadoSolicitud.CLASIFICADA, page: 0, size: 15 };
    component.aplicarFiltros();

    setTimeout(() => {
      expect(solicitudService.listar).toHaveBeenCalledWith(
        jasmine.objectContaining({ estado: EstadoSolicitud.CLASIFICADA, page: 0 })
      );
      done();
    }, 100);
  });

  it('debería resetear página al aplicar filtros', () => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    component.filtros = { page: 5, size: 15 };
    component.aplicarFiltros();

    expect(component.filtros.page).toBe(0);
  });

  it('debería limpiar filtros correctamente', (done) => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    component.filtros = {
      estado: EstadoSolicitud.REGISTRADA,
      prioridad: NivelPrioridad.ALTA,
      page: 2,
      size: 15
    };
    component.limpiarFiltros();

    setTimeout(() => {
      expect(component.filtros.estado).toBeUndefined();
      expect(component.filtros.prioridad).toBeUndefined();
      expect(component.filtros.page).toBe(0);
      done();
    }, 100);
  });

  it('debería navegar a página específica', (done) => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    component.irPagina(3);

    setTimeout(() => {
      expect(component.filtros.page).toBe(3);
      done();
    }, 100);
  });

  it('debería calcular página actual correctamente', () => {
    component.filtros = { page: 2, size: 15 };
    expect(component.paginaActual).toBe(2);
  });

  it('debería retornar 0 para página actual si no hay filtros', () => {
    component.filtros = {};
    expect(component.paginaActual).toBe(0);
  });

  it('debería calcular total de páginas', () => {
    component.page.set(mockPageResponse);
    expect(component.totalPaginas).toBe(2);
  });

  it('debería retornar 0 para total páginas si no hay datos', () => {
    component.page.set(null);
    expect(component.totalPaginas).toBe(0);
  });

  it('debería generar array de números de página', () => {
    component.page.set({
      content: [],
      totalPages: 3,
      totalElements: 45,
      number: 0,
      size: 15
    });

    expect(component.paginas).toEqual([0, 1, 2]);
  });

  it('debería mostrar estados correctos en template', () => {
    expect(component.estados).toContain(EstadoSolicitud.REGISTRADA);
    expect(component.estados).toContain(EstadoSolicitud.CLASIFICADA);
  });

  it('debería mostrar prioridades correctas en template', () => {
    expect(component.prioridades).toContain(NivelPrioridad.BAJA);
    expect(component.prioridades).toContain(NivelPrioridad.ALTA);
  });

  it('debería verificar si usuario es coordinador', () => {
    authService.isCoordinador = signal(true);
    const newComponent = new ListaSolicitudesComponent(solicitudService, authService);
    expect(newComponent.isCoordinador()).toBe(true);
  });

  it('debería tener acceso a labels de estados', () => {
    expect(component.estadoLabels[EstadoSolicitud.REGISTRADA]).toBe('Registrada');
    expect(component.estadoLabels[EstadoSolicitud.CERRADA]).toBe('Cerrada');
  });

  it('debería tener acceso a labels de prioridades', () => {
    expect(component.prioridadLabels[NivelPrioridad.BAJA]).toBe('Baja');
    expect(component.prioridadLabels[NivelPrioridad.CRITICA]).toBe('Crítica');
  });

  it('debería enviar filtros correctos al servicio', (done) => {
    solicitudService.listar.and.returnValue(of(mockPageResponse));

    const filtros = {
      estado: EstadoSolicitud.EN_ATENCION,
      prioridad: NivelPrioridad.ALTA,
      page: 1,
      size: 10
    };

    component.filtros = filtros;
    component.cargar();

    setTimeout(() => {
      expect(solicitudService.listar).toHaveBeenCalledWith(filtros);
      done();
    }, 100);
  });
});


import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SolicitudService } from './solicitud.service';
import {
  SolicitudResponse, PageResponse, HistorialResponse,
  CrearSolicitudRequest, ClasificacionRequest, AsignacionRequest,
  EstadoSolicitud, NivelPrioridad, CanalOrigen, SolicitudFiltros
} from '../models';
import { environment } from '../../../environments/environment';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let httpMock: HttpTestingController;

  const mockSolicitud: SolicitudResponse = {
    id: 1,
    descripcion: 'Test request',
    estado: EstadoSolicitud.REGISTRADA,
    canalOrigen: CanalOrigen.CORREO,
    tipoSolicitudId: null,
    prioridad: null,
    justificacionPrioridad: null,
    usuarioAsignadoId: null,
    solicitanteId: 101,
    fechaCreacion: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SolicitudService]
    });

    service = TestBed.inject(SolicitudService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('crear', () => {
    it('debería crear una nueva solicitud', (done) => {
      const request: CrearSolicitudRequest = {
        descripcion: 'Test request',
        canalOrigen: CanalOrigen.CORREO
      };

      service.crear(request).subscribe((result) => {
        expect(result.id).toBe(1);
        expect(result.descripcion).toBe('Test request');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush({ success: true, message: 'Created', data: mockSolicitud });
    });
  });

  describe('listar', () => {
    it('debería obtener lista de solicitudes sin filtros', (done) => {
      const pageMock: PageResponse<SolicitudResponse> = {
        content: [mockSolicitud],
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 15
      };

      service.listar().subscribe((result) => {
        expect(result.content.length).toBe(1);
        expect(result.content[0].id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes`);
      expect(req.request.method).toBe('GET');
      req.flush(pageMock);
    });

    it('debería aplicar filtros de estado', (done) => {
      const filtros: SolicitudFiltros = {
        estado: EstadoSolicitud.CLASIFICADA,
        page: 0,
        size: 15
      };

      const pageMock: PageResponse<SolicitudResponse> = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 15
      };

      service.listar(filtros).subscribe((result) => {
        expect(result.totalElements).toBe(0);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/solicitudes?estado=CLASIFICADA&page=0&size=15`
      );
      expect(req.request.method).toBe('GET');
      req.flush(pageMock);
    });

    it('debería aplicar filtros de prioridad y responsable', (done) => {
      const filtros: SolicitudFiltros = {
        prioridad: NivelPrioridad.ALTA,
        responsableId: 50,
        page: 1,
        size: 10
      };

      service.listar(filtros).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/solicitudes?prioridad=ALTA&responsableId=50&page=1&size=10`
      );
      req.flush({ content: [], totalPages: 0, totalElements: 0, number: 1, size: 10 });
    });
  });

  describe('obtenerDetalle', () => {
    it('debería obtener solicitud por ID', (done) => {
      service.obtenerDetalle(1).subscribe((result) => {
        expect(result.id).toBe(1);
        expect(result.descripcion).toBe('Test request');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Found', data: mockSolicitud });
    });
  });

  describe('clasificar', () => {
    it('debería clasificar solicitud con tipo y prioridad', (done) => {
      const request: ClasificacionRequest = {
        tipoSolicitudId: 1,
        prioridad: NivelPrioridad.ALTA,
        justificacionPrioridad: 'Es importante'
      };

      const clasificada = { ...mockSolicitud, estado: EstadoSolicitud.CLASIFICADA, prioridad: NivelPrioridad.ALTA };

      service.clasificar(1, request).subscribe((result) => {
        expect(result.estado).toBe(EstadoSolicitud.CLASIFICADA);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/clasificacion`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ success: true, message: 'Classified', data: clasificada });
    });
  });

  describe('asignar', () => {
    it('debería asignar usuario responsable a solicitud', (done) => {
      const request: AsignacionRequest = { usuarioId: 50 };

      service.asignar(1, request).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/asignacion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush({ success: true, message: 'Assigned', data: null });
    });
  });

  describe('atender', () => {
    it('debería marcar solicitud como en atención', (done) => {
      const request = { comentariosAtencion: 'Atendiendo...' };

      service.atender(1, request).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/atencion`);
      expect(req.request.method).toBe('PUT');
      req.flush({ success: true, message: 'Attending', data: null });
    });
  });

  describe('cerrar', () => {
    it('debería cerrar solicitud con comentarios', (done) => {
      const request = { comentariosCierre: 'Resolucion completada' };

      service.cerrar(1, request).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/cierre`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Closed', data: null });
    });
  });

  describe('obtenerHistorial', () => {
    it('debería obtener historial de cambios de solicitud', (done) => {
      const mockHistorial: HistorialResponse[] = [
        {
          id: 1,
          estadoAnterior: null,
          estadoNuevo: EstadoSolicitud.REGISTRADA,
          fechaCambio: new Date().toISOString(),
          comentarios: 'Creada'
        }
      ];

      service.obtenerHistorial(1).subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].estadoNuevo).toBe(EstadoSolicitud.REGISTRADA);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/historial`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'History', data: mockHistorial });
    });
  });

  describe('generarResumen', () => {
    it('debería generar resumen de solicitud', (done) => {
      const resumenMock = 'Summary of the request...';

      service.generarResumen(1).subscribe((result) => {
        expect(result).toBe(resumenMock);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/solicitudes/1/resumen`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Summary', data: resumenMock });
    });
  });
});


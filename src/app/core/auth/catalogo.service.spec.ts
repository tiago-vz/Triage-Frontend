import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogoService } from './catalogo.service';
import { TipoSolicitud, Usuario, Rol } from '../models';
import { environment } from '../../../environments/environment';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let httpMock: HttpTestingController;

  const mockTipos: TipoSolicitud[] = [
    { id: 1, nombre: 'Tipo 1', descripcion: 'Descripción 1' },
    { id: 2, nombre: 'Tipo 2', descripcion: 'Descripción 2' }
  ];

  const mockUsuarios: Usuario[] = [
    { id: 1, nombre: 'John Doe', email: 'john@test.com', rol: Rol.COORDINADOR },
    { id: 2, nombre: 'Jane Smith', email: 'jane@test.com', rol: Rol.ADMINISTRATIVO }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogoService]
    });

    service = TestBed.inject(CatalogoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTiposSolicitud', () => {
    it('debería obtener lista de tipos de solicitud', (done) => {
      service.getTiposSolicitud().subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].nombre).toBe('Tipo 1');
        expect(result[1].nombre).toBe('Tipo 2');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tipos-solicitud`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTipos);
    });

    it('debería manejar lista vacía de tipos', (done) => {
      service.getTiposSolicitud().subscribe((result) => {
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tipos-solicitud`);
      req.flush([]);
    });
  });

  describe('getPrioridades', () => {
    it('debería obtener lista de prioridades', (done) => {
      const mockPrioridades = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

      service.getPrioridades().subscribe((result) => {
        expect(result.length).toBe(4);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/prioridades`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPrioridades);
    });
  });

  describe('getUsuarios', () => {
    it('debería obtener lista de usuarios', (done) => {
      service.getUsuarios().subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].nombre).toBe('John Doe');
        expect(result[1].rol).toBe(Rol.ADMINISTRATIVO);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });

    it('debería manejar lista vacía de usuarios', (done) => {
      service.getUsuarios().subscribe((result) => {
        expect(result.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
      req.flush([]);
    });
  });
});


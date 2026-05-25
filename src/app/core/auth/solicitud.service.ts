import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SolicitudResponse, HistorialResponse, PageResponse,
  CrearSolicitudRequest, ClasificacionRequest, AsignacionRequest,
  AtencionRequest, CierreRequest, SolicitudFiltros, SuccessResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  crear(request: CrearSolicitudRequest): Observable<SolicitudResponse> {
    return this.http
      .post<SuccessResponse<SolicitudResponse>>(this.baseUrl, request)
      .pipe(map(r => r.data));
  }

  listar(filtros: SolicitudFiltros = {}): Observable<PageResponse<SolicitudResponse>> {
    let params = new HttpParams();
    if (filtros.estado)       params = params.set('estado', filtros.estado);
    if (filtros.tipoId)       params = params.set('tipoId', filtros.tipoId);
    if (filtros.prioridad)    params = params.set('prioridad', filtros.prioridad);
    if (filtros.responsableId) params = params.set('responsableId', filtros.responsableId);
    if (filtros.page != null) params = params.set('page', filtros.page);
    if (filtros.size != null) params = params.set('size', filtros.size);

    return this.http.get<PageResponse<SolicitudResponse>>(this.baseUrl, { params });
  }

  obtenerDetalle(id: number): Observable<SolicitudResponse> {
    return this.http
      .get<SuccessResponse<SolicitudResponse>>(`${this.baseUrl}/${id}`)
      .pipe(map(r => r.data));
  }

  clasificar(id: number, request: ClasificacionRequest): Observable<SolicitudResponse> {
    return this.http
      .put<SuccessResponse<SolicitudResponse>>(`${this.baseUrl}/${id}/clasificacion`, request)
      .pipe(map(r => r.data));
  }

  asignar(id: number, request: AsignacionRequest): Observable<void> {
    return this.http
      .post<SuccessResponse<void>>(`${this.baseUrl}/${id}/asignacion`, request)
      .pipe(map(() => void 0));
  }

  atender(id: number, request: AtencionRequest): Observable<void> {
    return this.http
      .put<SuccessResponse<void>>(`${this.baseUrl}/${id}/atencion`, request)
      .pipe(map(() => void 0));
  }

  cerrar(id: number, request: CierreRequest): Observable<void> {
    return this.http
      .post<SuccessResponse<void>>(`${this.baseUrl}/${id}/cierre`, request)
      .pipe(map(() => void 0));
  }

  obtenerHistorial(id: number): Observable<HistorialResponse[]> {
    return this.http
      .get<SuccessResponse<HistorialResponse[]>>(`${this.baseUrl}/${id}/historial`)
      .pipe(map(r => r.data));
  }

  generarResumen(id: number): Observable<string> {
    return this.http
      .get<SuccessResponse<string>>(`${this.baseUrl}/${id}/resumen`)
      .pipe(map(r => r.data));
  }
}

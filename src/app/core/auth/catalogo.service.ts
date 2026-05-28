import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoSolicitud, Usuario, NivelPrioridad, SuccessResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTiposSolicitud(): Observable<TipoSolicitud[]> {
    return this.http.get<TipoSolicitud[]>(`${this.baseUrl}/tipos-solicitud`);
  }

  crearTipoSolicitud(request: { nombre: string; descripcion: string }): Observable<TipoSolicitud> {
    return this.http
      .post<SuccessResponse<TipoSolicitud>>(`${this.baseUrl}/tipos-solicitud`, request)
      .pipe(map(r => r.data));
  }

  getPrioridades(): Observable<NivelPrioridad[]> {
    return this.http.get<NivelPrioridad[]>(`${this.baseUrl}/prioridades`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }
}

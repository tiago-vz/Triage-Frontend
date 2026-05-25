import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoSolicitud, Usuario, NivelPrioridad } from '../models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTiposSolicitud(): Observable<TipoSolicitud[]> {
    return this.http.get<TipoSolicitud[]>(`${this.baseUrl}/tipos-solicitud`);
  }

  getPrioridades(): Observable<NivelPrioridad[]> {
    return this.http.get<NivelPrioridad[]>(`${this.baseUrl}/prioridades`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }
}

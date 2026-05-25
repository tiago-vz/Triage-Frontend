import { CanalOrigen, EstadoSolicitud, NivelPrioridad } from './enums';

export interface SolicitudResponse {
  id: number;
  descripcion: string;
  estado: EstadoSolicitud;
  canalOrigen: CanalOrigen;
  tipoSolicitudId: number | null;
  prioridad: NivelPrioridad | null;
  justificacionPrioridad: string | null;
  usuarioAsignadoId: number | null;
  solicitanteId: number;
  fechaCreacion: string;
}

export interface HistorialResponse {
  id: number;
  estadoAnterior: EstadoSolicitud | null;
  estadoNuevo: EstadoSolicitud;
  fechaCambio: string;
  comentarios: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface CrearSolicitudRequest {
  descripcion: string;
  canalOrigen: CanalOrigen;
}

export interface ClasificacionRequest {
  tipoSolicitudId: number;
  prioridad: NivelPrioridad;
  justificacionPrioridad: string;
}

export interface AsignacionRequest {
  usuarioId: number;
}

export interface AtencionRequest {
  comentariosAtencion: string;
}

export interface CierreRequest {
  comentariosCierre: string;
}

export interface SolicitudFiltros {
  estado?: EstadoSolicitud | null;
  tipoId?: number | null;
  prioridad?: NivelPrioridad | null;
  responsableId?: number | null;
  page?: number;
  size?: number;
}

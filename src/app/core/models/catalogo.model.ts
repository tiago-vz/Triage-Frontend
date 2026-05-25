export interface TipoSolicitud {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface SuccessResponse<T> {
  message: string;
  data: T;
}

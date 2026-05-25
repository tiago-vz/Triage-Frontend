export enum EstadoSolicitud {
  REGISTRADA = 'REGISTRADA',
  CLASIFICADA = 'CLASIFICADA',
  EN_ATENCION = 'EN_ATENCION',
  ATENDIDA = 'ATENDIDA',
  CERRADA = 'CERRADA',
}

export enum NivelPrioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum CanalOrigen {
  CSU = 'CSU',
  CORREO = 'CORREO',
  TELEFONICO = 'TELEFONICO',
  SAC = 'SAC',
}

export enum Rol {
  ESTUDIANTE = 'ESTUDIANTE',
  DOCENTE = 'DOCENTE',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  COORDINADOR = 'COORDINADOR',
}

export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.REGISTRADA]: 'Registrada',
  [EstadoSolicitud.CLASIFICADA]: 'Clasificada',
  [EstadoSolicitud.EN_ATENCION]: 'En Atención',
  [EstadoSolicitud.ATENDIDA]: 'Atendida',
  [EstadoSolicitud.CERRADA]: 'Cerrada',
};

export const PRIORIDAD_LABELS: Record<NivelPrioridad, string> = {
  [NivelPrioridad.BAJA]: 'Baja',
  [NivelPrioridad.MEDIA]: 'Media',
  [NivelPrioridad.ALTA]: 'Alta',
  [NivelPrioridad.CRITICA]: 'Crítica',
};

export const CANAL_LABELS: Record<CanalOrigen, string> = {
  [CanalOrigen.CSU]: 'CSU',
  [CanalOrigen.CORREO]: 'Correo Electrónico',
  [CanalOrigen.TELEFONICO]: 'Telefónico',
  [CanalOrigen.SAC]: 'SAC',
};

export const ROL_LABELS: Record<Rol, string> = {
  [Rol.ESTUDIANTE]: 'Estudiante',
  [Rol.DOCENTE]: 'Docente',
  [Rol.ADMINISTRATIVO]: 'Administrativo',
  [Rol.COORDINADOR]: 'Coordinador',
};

export const FLUJO_ESTADOS: EstadoSolicitud[] = [
  EstadoSolicitud.REGISTRADA,
  EstadoSolicitud.CLASIFICADA,
  EstadoSolicitud.EN_ATENCION,
  EstadoSolicitud.ATENDIDA,
  EstadoSolicitud.CERRADA,
];

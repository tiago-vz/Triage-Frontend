import { Pipe, PipeTransform } from '@angular/core';
import { EstadoSolicitud, ESTADO_LABELS } from '../../core/models';

@Pipe({ name: 'estadoLabel', standalone: true })
export class EstadoLabelPipe implements PipeTransform {
  transform(value: EstadoSolicitud): string {
    return ESTADO_LABELS[value] ?? value;
  }
}

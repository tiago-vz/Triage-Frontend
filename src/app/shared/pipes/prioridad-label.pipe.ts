import { Pipe, PipeTransform } from '@angular/core';
import { NivelPrioridad, PRIORIDAD_LABELS } from '../../core/models';

@Pipe({ name: 'prioridadLabel', standalone: true })
export class PrioridadLabelPipe implements PipeTransform {
  transform(value: NivelPrioridad | null): string {
    if (!value) return 'Sin clasificar';
    return PRIORIDAD_LABELS[value] ?? value;
  }
}

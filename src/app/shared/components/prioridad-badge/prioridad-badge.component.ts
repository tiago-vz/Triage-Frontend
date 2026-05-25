import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelPrioridad, PRIORIDAD_LABELS } from '../../../core/models';

@Component({
  selector: 'app-prioridad-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="prioridad" class="badge" [ngClass]="'badge--prioridad-' + prioridad.toLowerCase()">
      {{ label }}
    </span>
    <span *ngIf="!prioridad" class="badge badge--neutral">Sin clasificar</span>
  `,
})
export class PrioridadBadgeComponent {
  @Input() prioridad: NivelPrioridad | null = null;
  get label(): string {
    return this.prioridad ? PRIORIDAD_LABELS[this.prioridad] : '';
  }
}

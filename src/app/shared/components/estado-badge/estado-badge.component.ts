import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoSolicitud, ESTADO_LABELS } from '../../../core/models';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge--' + estado.toLowerCase().replace('_', '-')">
      {{ label }}
    </span>
  `,
})
export class EstadoBadgeComponent {
  @Input({ required: true }) estado!: EstadoSolicitud;
  get label(): string { return ESTADO_LABELS[this.estado] ?? this.estado; }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../shared/components/prioridad-badge/prioridad-badge.component';
import { SolicitudService } from '../../core/auth/solicitud.service';
import { AuthService } from '../../core/auth/auth.service';
import { SolicitudResponse, EstadoSolicitud, EstadisticasResponse } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly usuario = this.auth.usuario;
  readonly isCoordinador = this.auth.isCoordinador;

  solicitudes = signal<SolicitudResponse[]>([]);
  stats = signal<EstadisticasResponse | null>(null);
  loading = signal(true);

  readonly EstadoSolicitud = EstadoSolicitud;

  constructor(
    private solicitudService: SolicitudService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar estadísticas reales del backend
    this.solicitudService.obtenerEstadisticas().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });

    // Cargar solicitudes recientes
    this.solicitudService.listar({ size: 8 }).subscribe({
      next: (page) => {
        this.solicitudes.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

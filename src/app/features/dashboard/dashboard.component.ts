import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../shared/components/prioridad-badge/prioridad-badge.component';
import { SolicitudService } from '../../core/auth/solicitud.service';
import { AuthService } from '../../core/auth/auth.service';
import { SolicitudResponse, EstadoSolicitud, Rol } from '../../core/models';

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
  loading = signal(true);

  // Métricas calculadas
  readonly stats = {
    registradas: 0, clasificadas: 0, enAtencion: 0, cerradas: 0
  };

  constructor(
    private solicitudService: SolicitudService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.solicitudService.listar({ size: 10 }).subscribe({
      next: (page) => {
        this.solicitudes.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  countByEstado(estado: EstadoSolicitud): number {
    return this.solicitudes().filter(s => s.estado === estado).length;
  }

  readonly EstadoSolicitud = EstadoSolicitud;
}

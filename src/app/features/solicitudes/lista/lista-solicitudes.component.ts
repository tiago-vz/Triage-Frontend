import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../../shared/components/prioridad-badge/prioridad-badge.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  SolicitudResponse, PageResponse,
  EstadoSolicitud, NivelPrioridad, SolicitudFiltros,
  ESTADO_LABELS, PRIORIDAD_LABELS
} from '../../../core/models';

@Component({
  selector: 'app-lista-solicitudes',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent
  ],
  templateUrl: './lista-solicitudes.component.html',
})
export class ListaSolicitudesComponent implements OnInit {
  page = signal<PageResponse<SolicitudResponse> | null>(null);
  loading = signal(true);

  // Filtros vinculados al formulario
  filtros: SolicitudFiltros = { page: 0, size: 15 };
  searchText = '';

  readonly estados = Object.values(EstadoSolicitud);
  readonly prioridades = Object.values(NivelPrioridad);
  readonly estadoLabels = ESTADO_LABELS;
  readonly prioridadLabels = PRIORIDAD_LABELS;

  readonly isCoordinador = this.auth.isCoordinador;

  constructor(
    private service: SolicitudService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    if (this.searchText.trim()) {
      this.filtros.search = this.searchText.trim();
    } else {
      this.filtros.search = null;
    }
    this.service.listar(this.filtros).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  aplicarFiltros(): void {
    this.filtros.page = 0;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtros = { page: 0, size: 15 };
    this.searchText = '';
    this.cargar();
  }

  irPagina(n: number): void {
    this.filtros.page = n;
    this.cargar();
  }

  exportarCSV(): void {
    this.service.exportarCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'solicitudes.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('CSV exportado correctamente');
      },
      error: () => this.toast.error('Error al exportar CSV'),
    });
  }

  get paginaActual(): number { return this.filtros.page ?? 0; }
  get totalPaginas(): number { return this.page()?.totalPages ?? 0; }
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }
}

import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../../shared/components/prioridad-badge/prioridad-badge.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { CatalogoService } from '../../../core/auth/catalogo.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  SolicitudResponse, HistorialResponse, TipoSolicitud, Usuario,
  EstadoSolicitud, NivelPrioridad, FLUJO_ESTADOS,
  ESTADO_LABELS, CANAL_LABELS
} from '../../../core/models';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent
  ],
  templateUrl: './detalle-solicitud.component.html',
})
export class DetalleSolicitudComponent implements OnInit {
  // Con withComponentInputBinding(), el :id de la ruta llega como @Input
  @Input() id!: string;

  solicitud = signal<SolicitudResponse | null>(null);
  historial = signal<HistorialResponse[]>([]);
  tipos = signal<TipoSolicitud[]>([]);
  usuarios = signal<Usuario[]>([]);
  resumen = signal<string | null>(null);
  loading = signal(true);
  accionLoading = signal(false);
  error = signal<string | null>(null);
  tabActiva = signal<'detalle' | 'historial' | 'workflow'>('detalle');

  readonly isCoordinador = this.auth.isCoordinador;
  readonly FLUJO_ESTADOS = FLUJO_ESTADOS;
  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly CANAL_LABELS = CANAL_LABELS;
  readonly NivelPrioridad = NivelPrioridad;
  readonly prioridades = Object.values(NivelPrioridad);

  // Formularios de workflow
  formClasificacion!: FormGroup;
  formAsignacion!: FormGroup;
  formAtencion!: FormGroup;
  formCierre!: FormGroup;

  constructor(
    private service: SolicitudService,
    private catalogo: CatalogoService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargar();
    if (this.isCoordinador()) {
      this.catalogo.getTiposSolicitud().subscribe(t => this.tipos.set(t));
      this.catalogo.getUsuarios().subscribe(u => this.usuarios.set(u));
    }
  }

  private initForms(): void {
    this.formClasificacion = this.fb.group({
      tipoSolicitudId: [null, Validators.required],
      prioridad: [null, Validators.required],
      justificacionPrioridad: ['', Validators.required],
    });
    this.formAsignacion = this.fb.group({
      usuarioId: [null, Validators.required],
    });
    this.formAtencion = this.fb.group({
      comentariosAtencion: ['', Validators.required],
    });
    this.formCierre = this.fb.group({
      comentariosCierre: ['', Validators.required],
    });
  }

  cargar(): void {
    const id = Number(this.id);
    this.service.obtenerDetalle(id).subscribe({
      next: (s) => { this.solicitud.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.service.obtenerHistorial(id).subscribe(h => this.historial.set(h));
  }

  clasificar(): void {
    if (this.formClasificacion.invalid) { this.formClasificacion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.clasificar(Number(this.id), this.formClasificacion.value).subscribe({
      next: (s) => { this.solicitud.set(s); this.accionLoading.set(false); this.cargar(); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); },
    });
  }

  asignar(): void {
    if (this.formAsignacion.invalid) { this.formAsignacion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.asignar(Number(this.id), this.formAsignacion.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); },
    });
  }

  atender(): void {
    if (this.formAtencion.invalid) { this.formAtencion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.atender(Number(this.id), this.formAtencion.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); },
    });
  }

  cerrar(): void {
    if (this.formCierre.invalid) { this.formCierre.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.cerrar(Number(this.id), this.formCierre.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); },
    });
  }

  cargarResumen(): void {
    this.service.generarResumen(Number(this.id)).subscribe(r => this.resumen.set(r));
  }

  estadoIndex(estado: EstadoSolicitud): number {
    return FLUJO_ESTADOS.indexOf(estado);
  }

  get estadoActualIndex(): number {
    return this.solicitud() ? this.estadoIndex(this.solicitud()!.estado) : 0;
  }
}

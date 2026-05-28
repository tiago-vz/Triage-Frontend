import { Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EstadoBadgeComponent } from '../../../shared/components/estado-badge/estado-badge.component';
import { PrioridadBadgeComponent } from '../../../shared/components/prioridad-badge/prioridad-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { CatalogoService } from '../../../core/auth/catalogo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  SolicitudResponse, HistorialResponse, TipoSolicitud, Usuario,
  ComentarioResponse,
  EstadoSolicitud, NivelPrioridad, FLUJO_ESTADOS,
  ESTADO_LABELS, CANAL_LABELS
} from '../../../core/models';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    SidebarComponent, EstadoBadgeComponent, PrioridadBadgeComponent,
    ConfirmModalComponent
  ],
  templateUrl: './detalle-solicitud.component.html',
})
export class DetalleSolicitudComponent implements OnInit {
  // Con withComponentInputBinding(), el :id de la ruta llega como @Input
  @Input() id!: string;
  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;

  solicitud = signal<SolicitudResponse | null>(null);
  historial = signal<HistorialResponse[]>([]);
  comentarios = signal<ComentarioResponse[]>([]);
  tipos = signal<TipoSolicitud[]>([]);
  usuarios = signal<Usuario[]>([]);
  resumen = signal<string | null>(null);
  loading = signal(true);
  accionLoading = signal(false);
  iaLoading = signal(false);
  comentarioLoading = signal(false);
  error = signal<string | null>(null);
  tabActiva = signal<'detalle' | 'historial' | 'workflow' | 'comentarios'>('detalle');
  nuevoComentario = '';

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
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargar();
    this.cargarComentarios();
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

  cargarComentarios(): void {
    this.service.listarComentarios(Number(this.id)).subscribe(c => this.comentarios.set(c));
  }

  // ── Sugerencia IA ─────────────────────────────────────────
  sugerirClasificacion(): void {
    const desc = this.solicitud()?.descripcion;
    if (!desc) return;
    this.iaLoading.set(true);
    this.service.sugerirClasificacion(desc).subscribe({
      next: (ia) => {
        if (ia.tipoSugeridoId) {
          this.formClasificacion.patchValue({ tipoSolicitudId: ia.tipoSugeridoId });
        }
        if (ia.prioridadSugerida) {
          this.formClasificacion.patchValue({ prioridad: ia.prioridadSugerida });
        }
        this.formClasificacion.patchValue({
          justificacionPrioridad: `Sugerencia IA (confianza: ${Math.round(ia.confianza * 100)}%): Tipo "${ia.tipoSugeridoNombre}", Prioridad ${ia.prioridadSugerida}`
        });
        this.iaLoading.set(false);
        this.toast.info('Sugerencia IA aplicada. Revisa y ajusta si es necesario.');
      },
      error: () => { this.iaLoading.set(false); this.toast.error('Error al obtener sugerencia IA'); },
    });
  }

  clasificar(): void {
    if (this.formClasificacion.invalid) { this.formClasificacion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.clasificar(Number(this.id), this.formClasificacion.value).subscribe({
      next: (s) => { this.solicitud.set(s); this.accionLoading.set(false); this.cargar(); this.toast.success('Solicitud clasificada correctamente'); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); this.toast.error(e.error?.message || 'Error al clasificar'); },
    });
  }

  asignar(): void {
    if (this.formAsignacion.invalid) { this.formAsignacion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.asignar(Number(this.id), this.formAsignacion.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); this.toast.success('Solicitud asignada correctamente'); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); this.toast.error(e.error?.message || 'Error al asignar'); },
    });
  }

  atender(): void {
    if (this.formAtencion.invalid) { this.formAtencion.markAllAsTouched(); return; }
    this.accionLoading.set(true);
    this.service.atender(Number(this.id), this.formAtencion.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); this.toast.success('Solicitud marcada como atendida'); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); this.toast.error(e.error?.message || 'Error al atender'); },
    });
  }

  confirmarCierre(): void {
    if (this.formCierre.invalid) { this.formCierre.markAllAsTouched(); return; }
    this.confirmModal.open({
      title: 'Cerrar solicitud',
      message: '¿Estás seguro de que deseas cerrar esta solicitud? Esta acción es irreversible.',
      confirmText: 'Cerrar definitivamente',
      onConfirm: () => this.ejecutarCierre(),
    });
  }

  private ejecutarCierre(): void {
    this.accionLoading.set(true);
    this.service.cerrar(Number(this.id), this.formCierre.value).subscribe({
      next: () => { this.accionLoading.set(false); this.cargar(); this.toast.success('Solicitud cerrada definitivamente'); },
      error: (e) => { this.error.set(e.error?.message); this.accionLoading.set(false); this.toast.error(e.error?.message || 'Error al cerrar'); },
    });
  }

  enviarComentario(): void {
    if (!this.nuevoComentario.trim()) return;
    this.comentarioLoading.set(true);
    this.service.agregarComentario(Number(this.id), { contenido: this.nuevoComentario }).subscribe({
      next: (c) => {
        this.comentarios.update(list => [...list, c]);
        this.nuevoComentario = '';
        this.comentarioLoading.set(false);
        this.toast.success('Comentario agregado');
      },
      error: () => { this.comentarioLoading.set(false); this.toast.error('Error al agregar comentario'); },
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

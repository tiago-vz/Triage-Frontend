import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SolicitudService } from '../../../core/auth/solicitud.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CanalOrigen, CANAL_LABELS } from '../../../core/models';

@Component({
  selector: 'app-crear-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  templateUrl: './crear-solicitud.component.html',
})
export class CrearSolicitudComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  readonly canales = Object.values(CanalOrigen);
  readonly canalLabels = CANAL_LABELS;

  constructor(
    private fb: FormBuilder,
    private service: SolicitudService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      canalOrigen: [null, Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    this.service.crear(this.form.value).subscribe({
      next: (s) => { this.toast.success('Solicitud creada exitosamente'); this.router.navigate(['/solicitudes', s.id]); },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al crear la solicitud');
        this.loading.set(false);
      },
    });
  }

  get descripcion() { return this.form.get('descripcion')!; }
  get canalOrigen() { return this.form.get('canalOrigen')!; }
}

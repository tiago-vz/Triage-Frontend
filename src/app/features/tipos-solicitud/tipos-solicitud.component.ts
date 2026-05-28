import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CatalogoService } from '../../core/auth/catalogo.service';
import { ToastService } from '../../shared/services/toast.service';
import { TipoSolicitud } from '../../core/models';

@Component({
  selector: 'app-tipos-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './tipos-solicitud.component.html',
})
export class TiposSolicitudComponent implements OnInit {
  tipos = signal<TipoSolicitud[]>([]);
  loading = signal(true);
  formVisible = signal(false);
  saving = signal(false);
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private catalogo: CatalogoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
    });
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.loading.set(true);
    this.catalogo.getTiposSolicitud().subscribe({
      next: (tipos) => { this.tipos.set(tipos); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleForm(): void {
    this.formVisible.update(v => !v);
    if (!this.formVisible()) {
      this.form.reset();
    }
  }

  crear(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    this.catalogo.crearTipoSolicitud(this.form.value).subscribe({
      next: (tipo) => {
        this.tipos.update(list => [...list, tipo]);
        this.toast.success(`Tipo "${tipo.nombre}" creado exitosamente`);
        this.form.reset();
        this.formVisible.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al crear tipo de solicitud');
        this.saving.set(false);
      },
    });
  }

  get nombre() { return this.form.get('nombre')!; }
}

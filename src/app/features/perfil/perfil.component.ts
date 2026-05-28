import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';
import { ROL_LABELS, Rol } from '../../core/models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  readonly usuario = this.auth.usuario;
  readonly rolLabels: Record<string, string> = ROL_LABELS as Record<string, string>;
  form!: FormGroup;
  loading = signal(false);
  perfil = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nuevaPassword: [''],
    });

    this.http.get<any>(`${environment.apiUrl}/auth/perfil`).subscribe({
      next: (r) => {
        this.perfil.set(r.data);
        this.form.patchValue({ nombre: r.data.nombre });
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const body: any = {};
    if (this.form.value.nombre) body.nombre = this.form.value.nombre;
    if (this.form.value.nuevaPassword) body.nuevaPassword = this.form.value.nuevaPassword;

    this.http.put<any>(`${environment.apiUrl}/auth/perfil`, body).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Perfil actualizado correctamente');
        this.form.patchValue({ nuevaPassword: '' });
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Error al actualizar perfil');
      },
    });
  }

  get nombre() { return this.form.get('nombre')!; }
}

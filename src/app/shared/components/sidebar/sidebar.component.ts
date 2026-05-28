import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Rol, ROL_LABELS } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly usuario = this.auth.usuario;
  readonly isCoordinador = this.auth.isCoordinador;
  mobileOpen = signal(false);

  readonly rolLabel = computed(() => {
    const rol = this.auth.rol();
    return rol ? ROL_LABELS[rol] : '';
  });

  readonly menuItems = computed(() => {
    const base = [
      { label: 'Dashboard', icon: '⊞', route: '/dashboard' },
      { label: 'Solicitudes', icon: '📋', route: '/solicitudes' },
      { label: 'Nueva Solicitud', icon: '＋', route: '/solicitudes/nueva' },
      { label: 'Mi Perfil', icon: '👤', route: '/perfil' },
    ];
    return base;
  });

  constructor(private auth: AuthService) {}

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="visible()" (click)="cancel()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 class="modal-title">{{ title() }}</h3>
        <p class="modal-message">{{ message() }}</p>
        <div class="modal-actions">
          <button class="btn-ghost" (click)="cancel()">Cancelar</button>
          <button class="btn-danger" (click)="confirm()">{{ confirmText() }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  visible = signal(false);
  title = signal('');
  message = signal('');
  confirmText = signal('Confirmar');
  private onConfirm: (() => void) | null = null;

  open(config: { title: string; message: string; confirmText?: string; onConfirm: () => void }): void {
    this.title.set(config.title);
    this.message.set(config.message);
    this.confirmText.set(config.confirmText ?? 'Confirmar');
    this.onConfirm = config.onConfirm;
    this.visible.set(true);
  }

  confirm(): void {
    if (this.onConfirm) this.onConfirm();
    this.visible.set(false);
  }

  cancel(): void {
    this.visible.set(false);
  }
}

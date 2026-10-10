import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  info(text: string): void { this.show(text, 'info'); }
  error(text: string): void { this.show(text, 'error'); }

  dismiss(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  private show(text: string, kind: Toast['kind']): void {
    const id = this.nextId++;
    this.toasts.update(toasts => [...toasts, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}

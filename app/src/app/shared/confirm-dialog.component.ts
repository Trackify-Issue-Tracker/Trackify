import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmData {
  title: string;
  message: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="dlg">
      <div class="dlg-head"><h2>{{ data.title }}</h2></div>
      <div class="dlg-body"><p>{{ data.message }}</p></div>
      <div class="dlg-foot">
        <button class="btn" (click)="ref.close(false)">Cancel</button>
        <button class="btn danger" (click)="ref.close(true)" cdkFocusInitial>{{ data.confirmLabel ?? 'Delete' }}</button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(public ref: DialogRef<boolean>, @Inject(DIALOG_DATA) public data: ConfirmData) { }
}

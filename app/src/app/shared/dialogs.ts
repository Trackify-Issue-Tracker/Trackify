import { Dialog } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

/** Opens a dialog with the shared Trackify styling. Emits the result, or undefined if it was dismissed. */
export function openDialog<Result, Data, Comp>(
  dialog: Dialog, component: ComponentType<Comp>, data?: Data, width = 520,
): Observable<Result | undefined> {
  return dialog.open<Result, Data, Comp>(component, {
    data,
    width: `min(${width}px, calc(100vw - 24px))`,
    panelClass: 'dlg-panel',
    backdropClass: 'dlg-backdrop',
  }).closed;
}

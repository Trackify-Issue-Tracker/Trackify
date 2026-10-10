import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ItemPriority, ItemStatus, Project } from '../api.service';
import { IconComponent } from './icon.component';
import { PRIORITIES, STATUSES, statusChange } from './helpers';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <form class="dlg" [formGroup]="form" (ngSubmit)="save()">
      <div class="dlg-head">
        <h2>{{ data ? 'Edit project' : 'New project' }}</h2>
        <button type="button" class="icon-btn" aria-label="Close" (click)="ref.close()"><app-icon name="x" /></button>
      </div>
      <div class="dlg-body">
        <input class="title-input" formControlName="name" placeholder="Project name" cdkFocusInitial>
        <textarea formControlName="description" rows="3" placeholder="Description (optional)"></textarea>
        <div class="dlg-row">
          <label class="field"><span>Status</span>
            <select formControlName="status">@for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }</select>
          </label>
          <label class="field"><span>Priority</span>
            <select formControlName="priority">@for (priority of priorities; track priority) { <option [value]="priority">{{ priority }}</option> }</select>
          </label>
        </div>
        <label class="field"><span>Labels</span><input formControlName="labels" placeholder="comma, separated"></label>
      </div>
      <div class="dlg-foot">
        <button type="button" class="btn" (click)="ref.close()">Cancel</button>
        <button type="submit" class="btn primary" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
})
export class ProjectDialogComponent {
  statuses = STATUSES;
  priorities = PRIORITIES;

  form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.pattern(/\S/)]],
    description: [this.data?.description ?? ''],
    status: [this.data?.status ?? ItemStatus.New],
    priority: [this.data?.priority ?? ItemPriority.Medium],
    labels: [this.data?.labels ?? ''],
  });

  constructor(
    private fb: FormBuilder,
    public ref: DialogRef<Partial<Project>>,
    @Inject(DIALOG_DATA) public data: Project | null,
  ) { }

  save(): void {
    if (this.form.invalid) { return; }
    const value = this.form.getRawValue();
    this.ref.close({
      name: value.name.trim(),
      description: value.description,
      priority: value.priority,
      labels: value.labels,
      ...statusChange(this.data ?? {}, value.status),
    });
  }
}

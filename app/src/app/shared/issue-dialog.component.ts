import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Issue, ItemPriority, ItemStatus, ItemType, Project } from '../api.service';
import { IconComponent } from './icon.component';
import { PRIORITIES, STATUSES, TYPES, statusChange } from './helpers';

export interface IssueDialogData {
  projects: Project[];
  issue?: Issue;          // present when editing
  project_id?: string;    // pre-selected project when creating
  status?: ItemStatus;    // pre-selected status when creating (e.g. from a board column)
}

@Component({
  selector: 'app-issue-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <form class="dlg" [formGroup]="form" (ngSubmit)="save()">
      <div class="dlg-head">
        <h2>{{ data.issue ? 'Edit issue' : 'New issue' }}</h2>
        <button type="button" class="icon-btn" aria-label="Close" (click)="ref.close()"><app-icon name="x" /></button>
      </div>
      <div class="dlg-body">
        <input class="title-input" formControlName="title" placeholder="Issue title" cdkFocusInitial>
        <textarea formControlName="description" rows="4" placeholder="Add a description…"></textarea>
        <div class="dlg-row">
          <label class="field"><span>Project</span>
            <select formControlName="project_id">@for (project of data.projects; track project.id) { <option [value]="project.id">{{ project.name }}</option> }</select>
          </label>
          <label class="field"><span>Type</span>
            <select formControlName="type">@for (type of types; track type) { <option [value]="type">{{ type }}</option> }</select>
          </label>
          <label class="field"><span>Status</span>
            <select formControlName="status">@for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }</select>
          </label>
          <label class="field"><span>Priority</span>
            <select formControlName="priority">@for (priority of priorities; track priority) { <option [value]="priority">{{ priority }}</option> }</select>
          </label>
          <label class="field"><span>Due date</span><input type="date" formControlName="date_due"></label>
          <label class="field"><span>Labels</span><input formControlName="labels" placeholder="comma, separated"></label>
        </div>
      </div>
      <div class="dlg-foot">
        <button type="button" class="btn" (click)="ref.close()">Cancel</button>
        <button type="submit" class="btn primary" [disabled]="form.invalid">Save</button>
      </div>
    </form>
  `,
})
export class IssueDialogComponent {
  statuses = STATUSES;
  priorities = PRIORITIES;
  types = TYPES;

  form = this.fb.nonNullable.group({
    title: [this.data.issue?.title ?? '', [Validators.required, Validators.pattern(/\S/)]],
    description: [this.data.issue?.description ?? ''],
    project_id: [this.data.issue?.project_id ?? this.data.project_id ?? this.data.projects[0]?.id ?? '', Validators.required],
    type: [this.data.issue?.type ?? ItemType.Task],
    status: [this.data.issue?.status ?? this.data.status ?? ItemStatus.New],
    priority: [this.data.issue?.priority ?? ItemPriority.Medium],
    date_due: [this.data.issue?.date_due ?? ''],
    labels: [this.data.issue?.labels ?? ''],
  });

  constructor(
    private fb: FormBuilder,
    public ref: DialogRef<Partial<Issue>>,
    @Inject(DIALOG_DATA) public data: IssueDialogData,
  ) { }

  save(): void {
    if (this.form.invalid) { return; }
    const value = this.form.getRawValue();
    this.ref.close({
      title: value.title.trim(),
      description: value.description,
      project_id: value.project_id,
      type: value.type,
      priority: value.priority,
      labels: value.labels,
      // The API ignores empty values on update, so an empty due date is simply left out
      date_due: value.date_due || undefined,
      ...statusChange(this.data.issue ?? {}, value.status),
    });
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import { forkJoin } from 'rxjs';
import { ApiService, Issue, ItemStatus, ItemType, ItemPriority, Project } from '../api.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { openDialog } from '../shared/dialogs';
import { IconComponent } from '../shared/icon.component';
import { IssueDialogComponent, IssueDialogData } from '../shared/issue-dialog.component';
import { ToastService } from '../shared/toast.service';
import {
  PRIORITIES, STATUSES, TYPES, TYPE_ICONS, byDueDate, byUrgency, dueLabel, errorMessage,
  initial, isOverdue, parseDate, projectHue, splitLabels, statusChange, statusClass,
} from '../shared/helpers';

type SortMode = 'urgency' | 'due' | 'created';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule, RouterLink, DragDropModule, IconComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit {
  project?: Project;
  issues: Issue[] = [];
  loading = true;
  notFound = false;

  statuses = STATUSES;
  priorities = PRIORITIES;
  types = TYPES;
  typeIcons = TYPE_ICONS;

  search = '';
  priorityFilter = '';
  typeFilter = '';
  sort: SortMode = 'urgency';

  /** The column that currently shows the quick-add input */
  adding: ItemStatus | null = null;
  @ViewChild('quick') quickInput?: ElementRef<HTMLInputElement>;

  dueLabel = dueLabel;
  isOverdue = isOverdue;
  labelsOf = splitLabels;
  statusClass = statusClass;
  initial = initial;
  hue = projectHue;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: Dialog,
    private toast: ToastService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.loading = true;
      this.load(params.get('id') ?? '');
    });
  }

  load(projectId: string): void {
    forkJoin([this.api.getProject(projectId), this.api.getAllIssuesOfProject(projectId)]).subscribe({
      next: ([project, issues]) => {
        this.project = project;
        this.notFound = !project;
        this.issues = issues ?? [];
        this.loading = false;
      },
      error: error => {
        this.notFound = true;
        this.loading = false;
        this.toast.error(errorMessage(error));
      },
    });
  }

  /** Issues in a column after the filters and sorting are applied */
  column(status: ItemStatus): Issue[] {
    const search = this.search.trim().toLowerCase();
    const issues = this.issues.filter(issue =>
      issue.status === status &&
      (!this.priorityFilter || issue.priority === this.priorityFilter) &&
      (!this.typeFilter || issue.type === this.typeFilter) &&
      (!search || `${issue.title} ${issue.description ?? ''} ${issue.labels ?? ''}`.toLowerCase().includes(search)));
    switch (this.sort) {
      case 'due': return issues.sort(byDueDate);
      case 'created': return issues.sort((a, b) =>
        (parseDate(b.date_created)?.getTime() ?? 0) - (parseDate(a.date_created)?.getTime() ?? 0));
      default: return issues.sort(byUrgency);
    }
  }

  drop(event: CdkDragDrop<ItemStatus>): void {
    const issue: Issue = event.item.data;
    const status = event.container.data;
    if (issue.status === status) { return; }
    const previous = { ...issue };
    // Optimistic update, rolled back if the API call fails
    Object.assign(issue, statusChange(issue, status));
    this.api.updateIssue(issue.id ?? '', statusChange(previous, status)).subscribe({
      error: error => {
        Object.assign(issue, previous);
        this.toast.error(errorMessage(error));
      },
    });
  }

  startAdd(status: ItemStatus): void {
    this.adding = status;
    setTimeout(() => this.quickInput?.nativeElement.focus());
  }

  /** Creates an issue from just a title, in the given column */
  quickAdd(status: ItemStatus, input: HTMLInputElement): void {
    const title = input.value.trim();
    if (!title || !this.project) { return; }
    input.value = '';
    const issue = {
      ...statusChange({}, status),
      project_id: this.project.id ?? '',
      title,
      type: ItemType.Task,
      priority: ItemPriority.Medium,
    } as Issue;
    this.api.createIssue(issue).subscribe({
      next: () => this.load(this.project?.id ?? ''),
      error: error => this.toast.error(errorMessage(error)),
    });
  }

  openIssue(issue?: Issue, status?: ItemStatus): void {
    if (!this.project) { return; }
    openDialog<Partial<Issue>, IssueDialogData, IssueDialogComponent>(this.dialog, IssueDialogComponent, {
      projects: [this.project], issue, project_id: this.project.id, status,
    }, 560).subscribe(result => {
      if (!result) { return; }
      const request = issue
        ? this.api.updateIssue(issue.id ?? '', result)
        : this.api.createIssue({ ...result, project_id: this.project?.id } as Issue);
      request.subscribe({
        next: () => this.load(this.project?.id ?? ''),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }

  deleteIssue(issue: Issue, event: Event): void {
    event.stopPropagation();
    openDialog<boolean, object, ConfirmDialogComponent>(this.dialog, ConfirmDialogComponent, {
      title: 'Delete issue', message: `Delete "${issue.title}"? This cannot be undone.`,
    }, 400).subscribe(confirmed => {
      if (!confirmed) { return; }
      this.api.deleteIssue(issue.id ?? '').subscribe({
        next: () => this.issues = this.issues.filter(item => item.id !== issue.id),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

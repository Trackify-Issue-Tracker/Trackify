import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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

type SortMode = 'manual' | 'urgency' | 'due' | 'created';
type Order = Partial<Record<ItemStatus, string[]>>;

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
  sort: SortMode = 'manual';

  /** What each column currently shows (filtered and ordered). The drag and drop works directly on these arrays. */
  columns: Record<ItemStatus, Issue[]> = this.emptyColumns();

  /** The column that currently shows the quick-add input */
  adding: ItemStatus | null = null;
  @ViewChild('quick') quickInput?: ElementRef<HTMLInputElement>;

  dueLabel = dueLabel;
  isOverdue = isOverdue;
  labelsOf = splitLabels;
  statusClass = statusClass;
  initial = initial;
  hue = projectHue;

  /** The manual order of the issues in each column. The API has no order field, so this is kept in the browser. */
  private order: Order = {};
  /** True while a card is being dragged (and just after), so the drop is not mistaken for a click */
  private dragging = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: Dialog,
    private toast: ToastService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.loading = true;
      this.order = this.readOrder(params.get('id') ?? '');
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
        this.rebuild();
      },
      error: error => {
        this.notFound = true;
        this.loading = false;
        this.toast.error(errorMessage(error));
      },
    });
  }

  /** Works out what every column shows from the issues, the filters and the sort */
  rebuild(): void {
    const search = this.search.trim().toLowerCase();
    const visible = this.issues.filter(issue =>
      (!this.priorityFilter || issue.priority === this.priorityFilter) &&
      (!this.typeFilter || issue.type === this.typeFilter) &&
      (!search || `${issue.title} ${issue.description ?? ''} ${issue.labels ?? ''}`.toLowerCase().includes(search)));
    const columns = this.emptyColumns();
    for (const status of STATUSES) {
      columns[status] = this.sorted(visible.filter(issue => issue.status === status), status);
    }
    this.columns = columns;
  }

  private sorted(issues: Issue[], status: ItemStatus): Issue[] {
    switch (this.sort) {
      case 'due': return issues.sort(byDueDate);
      case 'urgency': return issues.sort(byUrgency);
      case 'created': return issues.sort((a, b) =>
        (parseDate(b.date_created)?.getTime() ?? 0) - (parseDate(a.date_created)?.getTime() ?? 0));
      default: {
        // Manual: the saved order first, anything that is not in it yet (new issues) after, in the order the API gave them
        const rank = new Map((this.order[status] ?? []).map((id, index) => [id, index]));
        return issues.sort((a, b) => (rank.get(a.id ?? '') ?? Infinity) - (rank.get(b.id ?? '') ?? Infinity));
      }
    }
  }

  private emptyColumns(): Record<ItemStatus, Issue[]> {
    return Object.fromEntries(STATUSES.map(status => [status, []])) as unknown as Record<ItemStatus, Issue[]>;
  }

  drop(event: CdkDragDrop<Issue[]>, status: ItemStatus): void {
    const issue: Issue = event.item.data;
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) { return; }
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.saveOrder(status);
      return;
    }

    // Moved to another column. The arrays are updated right now, in the same step as the drag, so nothing waits on the API.
    const from = issue.status;
    const previous = { ...issue };
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    Object.assign(issue, statusChange(issue, status));
    if (this.sort === 'manual') {
      this.saveOrder(status);
      this.saveOrder(from);
    } else {
      this.rebuild();
    }

    // Rolled back if the API call fails
    this.api.updateIssue(issue.id ?? '', statusChange(previous, status)).subscribe({
      error: error => {
        Object.assign(issue, previous);
        this.rebuild();
        this.toast.error(errorMessage(error));
      },
    });
  }

  /**
   * Stores the order of a column after a drag. Issues hidden by a filter keep their place: the visible ones
   * are put back into the slots the visible ones used to occupy.
   */
  private saveOrder(status: ItemStatus): void {
    const shown = this.columns[status].map(issue => issue.id ?? '');
    const shownSet = new Set(shown);
    const all = this.issues.filter(issue => issue.status === status).map(issue => issue.id ?? '');
    const stored = (this.order[status] ?? []).filter(id => all.includes(id));
    // The order before the drag: the saved order, then anything new in the order the API gave it
    const previous = [...stored, ...all.filter(id => !stored.includes(id))];
    let next = 0;
    this.order[status] = previous.map(id => shownSet.has(id) ? shown[next++] : id);
    this.writeOrder();
  }

  private storageKey(): string {
    return `trackify-order-${this.project?.id ?? ''}`;
  }

  private readOrder(projectId: string): Order {
    try {
      return JSON.parse(localStorage.getItem(`trackify-order-${projectId}`) ?? '{}') as Order;
    } catch {
      return {};
    }
  }

  private writeOrder(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.order));
    } catch { /* storage can be unavailable, the order just will not be remembered */ }
  }

  dragStarted(): void {
    this.dragging = true;
  }

  dragEnded(): void {
    // The click that follows the mouse button coming up has to be ignored
    setTimeout(() => this.dragging = false, 80);
  }

  startAdd(status: ItemStatus): void {
    this.adding = status;
    setTimeout(() => this.quickInput?.nativeElement.focus());
  }

  /** Creates an issue from just a title, at the bottom of the given column */
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
    if (!this.project || this.dragging) { return; }
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
        next: () => {
          this.issues = this.issues.filter(item => item.id !== issue.id);
          this.rebuild();
        },
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

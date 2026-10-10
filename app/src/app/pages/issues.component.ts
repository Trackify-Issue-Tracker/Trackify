import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { ApiService, Issue, ItemStatus, Project } from '../api.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { openDialog } from '../shared/dialogs';
import { IconComponent } from '../shared/icon.component';
import { IssueDialogComponent, IssueDialogData } from '../shared/issue-dialog.component';
import { ToastService } from '../shared/toast.service';
import {
  PRIORITIES, PRIORITY_RANK, STATUSES, TYPES, TYPE_ICONS, dueLabel, errorMessage, isOverdue, parseDate, statusClass,
} from '../shared/helpers';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [FormsModule, RouterLink, MatSortModule, MatTableModule, IconComponent],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css',
})
export class IssuesComponent implements OnInit {
  projects: Project[] = [];
  dataSource = new MatTableDataSource<Issue>([]);
  columns = ['title', 'project', 'status', 'priority', 'date_due', 'actions'];
  loading = true;

  statuses = STATUSES;
  priorities = PRIORITIES;
  types = TYPES;
  typeIcons = TYPE_ICONS;

  search = '';
  projectFilter = '';
  statusFilter = '';
  priorityFilter = '';
  typeFilter = '';
  hideClosed = false;
  overdueOnly = false;

  dueLabel = dueLabel;
  isOverdue = isOverdue;
  statusClass = statusClass;

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(
    private api: ApiService,
    private dialog: Dialog,
    private toast: ToastService,
    private route: ActivatedRoute,
  ) {
    this.dataSource.sortingDataAccessor = (issue, column) => {
      switch (column) {
        case 'project': return this.projectName(issue.project_id).toLowerCase();
        case 'priority': return PRIORITY_RANK[issue.priority ?? ''] ?? 4;
        case 'status': return STATUSES.indexOf(issue.status);
        case 'date_due': return parseDate(issue.date_due)?.getTime() ?? Infinity;
        default: return String((issue as unknown as Record<string, string>)[column] ?? '').toLowerCase();
      }
    };
    this.dataSource.filterPredicate = issue => this.matches(issue);
  }

  ngOnInit(): void {
    // Allows links such as /issues?overdue=true from the dashboard
    const params = this.route.snapshot.queryParamMap;
    this.overdueOnly = params.get('overdue') === 'true';
    this.hideClosed = params.get('open') === 'true' || this.overdueOnly;
    this.projectFilter = params.get('project') ?? '';
    this.load();
  }

  load(): void {
    forkJoin([this.api.getAllProjects(), this.api.getAllIssues()]).subscribe({
      next: ([projects, issues]) => {
        this.projects = projects;
        this.dataSource.data = issues;
        this.applyFilters();
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.toast.error(errorMessage(error));
      },
    });
  }

  projectName(projectId: string): string {
    return this.projects.find(project => project.id === projectId)?.name ?? 'Unknown';
  }

  private matches(issue: Issue): boolean {
    const search = this.search.trim().toLowerCase();
    return (!this.projectFilter || issue.project_id === this.projectFilter) &&
      (!this.statusFilter || issue.status === this.statusFilter) &&
      (!this.priorityFilter || issue.priority === this.priorityFilter) &&
      (!this.typeFilter || issue.type === this.typeFilter) &&
      (!this.hideClosed || issue.status !== ItemStatus.Done && issue.status !== ItemStatus.Closed) &&
      (!this.overdueOnly || isOverdue(issue)) &&
      (!search || `${issue.title} ${issue.description ?? ''} ${issue.labels ?? ''}`.toLowerCase().includes(search));
  }

  applyFilters(): void {
    // The filter value itself is unused, assigning it is what makes the table re-run the predicate
    this.dataSource.filter = String(Math.random());
  }

  openIssue(issue?: Issue): void {
    openDialog<Partial<Issue>, IssueDialogData, IssueDialogComponent>(this.dialog, IssueDialogComponent, {
      projects: this.projects, issue, project_id: this.projectFilter || undefined,
    }, 560).subscribe(result => {
      if (!result) { return; }
      const request = issue
        ? this.api.updateIssue(issue.id ?? '', result)
        : this.api.createIssue(result as Issue);
      request.subscribe({
        next: () => this.load(),
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
        next: () => this.load(),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

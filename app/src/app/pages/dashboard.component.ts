import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { forkJoin } from 'rxjs';
import { ApiService, Issue, ItemStatus, Project } from '../api.service';
import { openDialog } from '../shared/dialogs';
import { IconComponent } from '../shared/icon.component';
import { IssueDialogComponent, IssueDialogData } from '../shared/issue-dialog.component';
import { ToastService } from '../shared/toast.service';
import {
  STATUSES, TYPE_ICONS, byDueDate, byUrgency, daysUntilDue, dueGroup, dueLabel, errorMessage, greeting,
  initial, isOpen, isOverdue, parseDate, projectHue, statusClass,
} from '../shared/helpers';

interface Group { label: string; issues: Issue[]; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  issues: Issue[] = [];
  loading = true;
  statuses = STATUSES;
  typeIcons = TYPE_ICONS;
  dueLabel = dueLabel;
  isOverdue = isOverdue;
  statusClass = statusClass;
  initial = initial;
  hue = projectHue;
  greeting = greeting();
  today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  constructor(private api: ApiService, private dialog: Dialog, private toast: ToastService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin([this.api.getAllProjects(), this.api.getAllIssues()]).subscribe({
      next: ([projects, issues]) => {
        this.projects = projects;
        this.issues = issues;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.toast.error(errorMessage(error));
      },
    });
  }

  get openIssues(): Issue[] { return this.issues.filter(isOpen); }
  get overdue(): Issue[] { return this.issues.filter(isOverdue); }
  get dueThisWeek(): Issue[] {
    return this.openIssues.filter(issue => {
      const days = daysUntilDue(issue);
      return days !== null && days >= 0 && days <= 7;
    });
  }
  get doneCount(): number { return this.issues.length - this.openIssues.length; }

  /** One sentence summing up the situation, shown under the greeting */
  get summary(): string {
    const open = this.openIssues.length;
    if (!open) { return 'Nothing is open right now.'; }
    const overdue = this.overdue.length;
    const base = `${open} open issue${open === 1 ? '' : 's'}`;
    return overdue ? `${base}, ${overdue} of them overdue.` : `${base}, none overdue.`;
  }

  /** Open issues grouped by when they are due, soonest first. Capped so the list stays scannable. */
  get timeline(): Group[] {
    const order = ['Overdue', 'Today', 'Tomorrow', 'This week', 'Later', 'No due date'];
    const sorted = [...this.openIssues].sort((a, b) => byDueDate(a, b) || byUrgency(a, b));
    let remaining = 12;
    const groups: Group[] = [];
    for (const label of order) {
      const issues = sorted.filter(issue => dueGroup(issue) === label).slice(0, remaining);
      if (issues.length) { groups.push({ label, issues }); remaining -= issues.length; }
    }
    return groups;
  }

  get recent(): Issue[] {
    return [...this.issues]
      .sort((a, b) => (parseDate(b.date_created)?.getTime() ?? 0) - (parseDate(a.date_created)?.getTime() ?? 0))
      .slice(0, 5);
  }

  issuesOf(project: Project): Issue[] { return this.issues.filter(issue => issue.project_id === project.id); }

  progress(project: Project): number {
    const issues = this.issuesOf(project);
    return issues.length ? Math.round(100 * issues.filter(issue => !isOpen(issue)).length / issues.length) : 0;
  }

  countByStatus(status: ItemStatus): number {
    return this.issues.filter(issue => issue.status === status).length;
  }

  project(projectId: string): Project | undefined {
    return this.projects.find(project => project.id === projectId);
  }

  newIssue(): void {
    openDialog<Partial<Issue>, IssueDialogData, IssueDialogComponent>(
      this.dialog, IssueDialogComponent, { projects: this.projects }, 560,
    ).subscribe(result => {
      if (!result) { return; }
      this.api.createIssue(result as Issue).subscribe({
        next: () => this.load(),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { forkJoin, of } from 'rxjs';
import { ApiService, Issue, ItemStatus, Project } from '../api.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { openDialog } from '../shared/dialogs';
import {
  STATUSES, byDueDate, errorMessage, initial, isOpen, isOverdue, projectHue, splitLabels, statusClass,
} from '../shared/helpers';
import { IconComponent } from '../shared/icon.component';
import { ProjectDialogComponent } from '../shared/project-dialog.component';
import { ProjectsStore } from '../shared/projects.store';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  issues: Issue[] = [];
  loading = true;
  labelsOf = splitLabels;
  statusClass = statusClass;
  statuses = STATUSES;
  initial = initial;
  hue = projectHue;

  constructor(
    private api: ApiService,
    private dialog: Dialog,
    private toast: ToastService,
    private store: ProjectsStore,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin([this.api.getAllProjects(), this.api.getAllIssues()]).subscribe({
      next: ([projects, issues]) => {
        this.projects = projects;
        this.issues = issues;
        this.loading = false;
        this.store.projects.set(projects);
      },
      error: error => {
        this.loading = false;
        this.toast.error(errorMessage(error));
      },
    });
  }

  issuesOf(project: Project): Issue[] {
    return this.issues.filter(issue => issue.project_id === project.id);
  }

  countByStatus(project: Project, status: ItemStatus): number {
    return this.issuesOf(project).filter(issue => issue.status === status).length;
  }

  /** The soonest due date among the project's open issues, for the card footer */
  nextDue(project: Project): string {
    const next = this.issuesOf(project).filter(issue => isOpen(issue) && issue.date_due).sort(byDueDate)[0];
    return next?.date_due ?? '';
  }

  get totalOpen(): number { return this.issues.filter(isOpen).length; }
  get totalOverdue(): number { return this.issues.filter(isOverdue).length; }

  openCount(project: Project): number {
    return this.issuesOf(project).filter(isOpen).length;
  }

  overdueCount(project: Project): number {
    return this.issuesOf(project).filter(isOverdue).length;
  }

  /** Percentage of the project's issues that are done or closed */
  progress(project: Project): number {
    const issues = this.issuesOf(project);
    return issues.length ? Math.round(100 * (issues.length - this.openCount(project)) / issues.length) : 0;
  }

  openProject(project?: Project): void {
    openDialog<Partial<Project>, Project | null, ProjectDialogComponent>(
      this.dialog, ProjectDialogComponent, project ?? null,
    ).subscribe(result => {
      if (!result) { return; }
      const request = project
        ? this.api.updateProject(project.id ?? '', result)
        : this.api.createProject({ status: ItemStatus.New, ...result } as Project);
      request.subscribe({
        next: () => this.load(),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }

  deleteProject(project: Project): void {
    const issues = this.issuesOf(project);
    const extra = issues.length ? ` and its ${issues.length} issue${issues.length === 1 ? '' : 's'}` : '';
    openDialog<boolean, object, ConfirmDialogComponent>(this.dialog, ConfirmDialogComponent, {
      title: 'Delete project', message: `Delete "${project.name}"${extra}? This cannot be undone.`,
    }, 400).subscribe(confirmed => {
      if (!confirmed) { return; }
      // The database does not cascade, so the project's issues have to go first
      const deleteIssues = issues.map(issue => this.api.deleteIssue(issue.id ?? ''));
      (deleteIssues.length ? forkJoin(deleteIssues) : of([])).subscribe({
        next: () => this.api.deleteProject(project.id ?? '').subscribe({
          next: () => this.load(),
          error: error => this.toast.error(errorMessage(error)),
        }),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { ApiService, Project } from '../api.service';

/** The list of projects shown in the sidebar. Pages call refresh() after they change a project. */
@Injectable({ providedIn: 'root' })
export class ProjectsStore {
  projects = signal<Project[]>([]);

  constructor(private api: ApiService) { }

  refresh(): void {
    this.api.getAllProjects().subscribe({
      next: projects => this.projects.set(projects),
      error: () => { /* the pages report load errors themselves */ },
    });
  }
}

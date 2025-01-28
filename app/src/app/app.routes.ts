import { Routes } from '@angular/router';

import { ProjectPageComponent } from './Pages/ProjectsPage/projects-page/projects-page.component';

import { Project, ApiService } from './api.service';

export const routes: Routes = [
  { path: 'ProjectPage', component: ProjectPageComponent },
  { path: '', redirectTo: '/ProjectPage', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { ProjectPageComponent } from './projects-page/projects-page.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { Project, ApiService } from './api.service';

export const routes: Routes = [
  { path: 'ProjectPage', component: ProjectPageComponent },
  { path: '', redirectTo: '/ProjectPage', pathMatch: 'full' },
  { path: 'projects/:projectsId', component: ProjectDetailsComponent },
];

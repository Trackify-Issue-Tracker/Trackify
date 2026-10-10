import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    {
        path: 'dashboard', title: 'Dashboard - Trackify',
        loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
    },
    {
        path: 'projects', title: 'Projects - Trackify',
        loadComponent: () => import('./pages/projects.component').then(m => m.ProjectsComponent),
    },
    {
        path: 'projects/:id', title: 'Board - Trackify',
        loadComponent: () => import('./pages/board.component').then(m => m.BoardComponent),
    },
    {
        path: 'issues', title: 'Issues - Trackify',
        loadComponent: () => import('./pages/issues.component').then(m => m.IssuesComponent),
    },
    { path: '**', redirectTo: 'dashboard' },
];

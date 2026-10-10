import { Component } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { openDialog } from './shared/dialogs';
import { errorMessage, initial, projectHue } from './shared/helpers';
import { IconComponent } from './shared/icon.component';
import { ProjectsStore } from './shared/projects.store';
import { ThemeMode, ThemeService } from './shared/theme.service';
import { ToastService } from './shared/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app';
  links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/projects', label: 'Projects', icon: 'folder' },
    { path: '/issues', label: 'Issues', icon: 'list' },
  ];
  themes: { mode: ThemeMode; icon: string; label: string }[] = [
    { mode: 'light', icon: 'sun', label: 'Light' },
    { mode: 'system', icon: 'monitor', label: 'System' },
    { mode: 'dark', icon: 'moon', label: 'Dark' },
  ];
  initial = initial;
  hue = projectHue;

  constructor(
    private apiService: ApiService,
    private dialog: Dialog,
    public toast: ToastService,
    public store: ProjectsStore,
    public theme: ThemeService,
  ) {
    this.store.refresh();
  }

  deleteAll(): void {
    openDialog<boolean, object, ConfirmDialogComponent>(this.dialog, ConfirmDialogComponent, {
      title: 'Reset all data',
      message: 'This permanently deletes every project and issue. Are you sure?',
      confirmLabel: 'Reset',
    }).subscribe(confirmed => {
      if (!confirmed) { return; }
      this.apiService.reset().subscribe({
        // A full reload is the simplest way to refresh whichever page is open
        next: () => window.location.assign('/dashboard'),
        error: error => this.toast.error(errorMessage(error)),
      });
    });
  }
}

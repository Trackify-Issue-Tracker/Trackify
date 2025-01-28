import { Component } from '@angular/core'; //OnInit
import { Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService, Project, Issue } from '../../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoverNavBarComponent } from '../../../UniversalComponents/hover-nav-bar/hover-nav-bar.component';
import { InfoBarComponent } from '../../../UniversalComponents/info-bar/info-bar.component';
import { ProjectListComponent } from '../project-list/project-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    HoverNavBarComponent,
    InfoBarComponent,
    ProjectListComponent,
  ],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css',
})
@Injectable({
  providedIn: 'root',
})
export class ProjectPageComponent {
  // Property to track the visibility of the project list
  isProjectListVisible = false;

  // Method to toggle the visibility of the project list
  toggleProjectList() {
    this.isProjectListVisible = !this.isProjectListVisible;
  }
}

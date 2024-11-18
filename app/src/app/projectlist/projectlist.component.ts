import { Component } from '@angular/core';
import {
  ApiService,
  Project,
  Issue,
  ItemStatus,
  ItemType,
  ItemPriority,
} from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickprojectdetailsComponent } from '../quickprojectdetails/quickprojectdetails.component';
import { ProjectDetailsComponent } from '../project-details/project-details.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'projectlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuickprojectdetailsComponent,
    ProjectDetailsComponent,
  ],
  templateUrl: './projectlist.component.html',
  styleUrl: './projectlist.component.css',
})
export class ProjectlistComponent {
  public ItemStatus = ItemStatus;
  public ItemPriority = ItemPriority;
  projectName: string = ''; // User input for project name
  projectDescription: string = ''; // User input for project description
  // Add this property
  showInputs = false;

  selectedProject: any;
  translateAfterDelay: boolean = false;
  isQuickPDetailsVisible: boolean = false; // Track visibility of quickpdetails

  constructor(private router: Router, private apiService: ApiService) {
    this.getProjects();
  }
  navigateToProject(projectId: string) {
    this.router.navigate([`/projects/${projectId}`]);
  }

  onProjectClick(project: any) {
    if (this.isQuickPDetailsVisible) {
      // If quickpdetails is visible, move it out first
      this.translateAfterDelay = false; // Set to false to move it out

      // Set a timeout to wait for the move-out animation
      setTimeout(() => {
        // Now update the project details
        this.selectedProject = project;

        // Set to true after updating to move it back in
        setTimeout(() => {
          this.translateAfterDelay = true; // Move back in
        }, 100); // Duration of the move-out animation (adjust if necessary)
      }, 300); // Duration of move-out animation (adjust if necessary)
    } else {
      // If not visible, set the project immediately
      this.selectedProject = project;
      this.isQuickPDetailsVisible = true; // Reset for translation

      // Set a timeout to move it in after the delay
      setTimeout(() => {
        this.translateAfterDelay = true; // Move in
      }, 100); // Delay before moving in
    }
  }
  toggleInputs() {
    this.showInputs = !this.showInputs;
  }
  // implements OnInit
  title = 'app';
  issues: Issue[] = [];
  projects: Project[] = [];

  // ngOnInit(): void {
  //   this.getIssues();
  //   this.getProjects();
  // }

  // ngOnDestroy(): void {

  // }

  searchQuery: string = '';

  // Getter to filter projects based on search query
  get filteredProjects() {
    if (!this.searchQuery) {
      return this.projects;
    }

    return this.projects.filter((project) =>
      project.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  createProject(): void {
    // Make the project

    const project: Project = {
      id: '1', // doesn't get used
      status: ItemStatus.InProgress,
      name: this.projectName,
      description: this.projectDescription,
      priority: ItemPriority.Low,
    };

    // Create it using the API
    this.apiService.createProject(project).subscribe(() => {
      // Refresh the project list

      this.getProjects();
      this.projectName = '';
      this.projectDescription = '';
    });
  }

  getProjects(): void {
    this.apiService.getAllProjects().subscribe({
      // completeHandler
      complete: () => {},
      // errorHandler
      error: (error) => {
        console.error(error);
      },
      // nextHandler
      next: (projects: Project[]) => {
        this.projects = projects; // Update the projects array
        console.log(this.projects);
      },
    });
  }
}

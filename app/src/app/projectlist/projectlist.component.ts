import { Component } from '@angular/core';
import { ApiService, Project, Issue } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'projectlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projectlist.component.html',
  styleUrl: './projectlist.component.css',
})
export class ProjectlistComponent {
  projectName: string = ''; // User input for project name
  projectDescription: string = ''; // User input for project description
  // Add this property
  showInputs = false;

  toggleInputs() {
    this.showInputs = !this.showInputs;
  }
  // implements OnInit
  title = 'app';
  issues: Issue[] = [];
  projects: Project[] = [];

  constructor(private apiService: ApiService) {
    this.getProjects();
  }

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
      name: this.projectName,
      description: this.projectDescription,
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

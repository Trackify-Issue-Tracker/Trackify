import { Component, } from '@angular/core'; //OnInit
import { Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService, Project, Issue } from './api.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
@Injectable({
  providedIn: 'root'
})
export class AppComponent { // implements OnInit
  title = 'app';
  issues: Issue[] = [];
  projects: Project[] = [];

  constructor(private apiService: ApiService) {
    this.getIssues();
    this.getProjects();
  }

  // ngOnInit(): void {
  //   this.getIssues();
  //   this.getProjects();
  // }

  // ngOnDestroy(): void {

  // }

  createProject(): void {
    // Make the project
    const project: Project = {
      id: '', // doesn't get used
      name: 'New Project',
      description: 'This is a new project'
    };
    // Create it using the API
    this.apiService.createProject(project).subscribe(() => {
      // Refresh the project list
      this.getProjects();
    });
  }

  getProjects(): void {
    this.apiService.getAllProjects().subscribe({
      // completeHandler
      complete: () => { },
      // errorHandler
      error: (error) => { console.error(error); },
      // nextHandler
      next: (projects: Project[]) => {
        this.projects = projects; // Update the projects array
        console.log(this.projects);
      },
    });
  }

  createIssue(): void {
    // Make the issue
    const issue: Issue = {
      id: '', // doesn't get used
      project_id: this.projects[0]['id'],
      title: 'New Issue',
      description: 'This is a new issue'
    };
    // Create it using the API
    this.apiService.createIssue(issue).subscribe(() => {
      this.getIssues();
    });
  }

  getIssues(): void {
    // This is one way of using the API
    // See getProjects for the other way
    // this.apiService.getAllIssues().subscribe((issues: Issue[]) => {
    //   this.issues = issues;
    // });


    this.apiService.getAllIssues().subscribe({
      // completeHandler
      complete: () => { },
      // errorHandler
      error: (error) => { console.error(error); },
      // nextHandler
      next: (issues: Issue[]) => {
        this.issues = issues; // Update the projects array
        console.log(this.issues);
      },
    });
  }
}

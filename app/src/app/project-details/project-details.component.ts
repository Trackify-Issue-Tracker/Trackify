import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApiService,
  Project,
  Issue,
  ItemStatus,
  ItemType,
  ItemPriority,
} from '../api.service';
import { HoverNavBarComponent } from '../hover-nav-bar/hover-nav-bar.component';
import { InfoBarComponent } from '../info-bar/info-bar.component';
import { Injectable } from '@angular/core';
import { Route, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    HoverNavBarComponent,
    InfoBarComponent,
    RouterOutlet,
    DragDropModule,
    FormsModule,
  ],
  styleUrl: './project-details.component.css',
  templateUrl: './project-details.component.html',
})
@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsComponent {
  issues: Issue[] = [];
  public ItemStatus = ItemStatus;
  public ItemPriority = ItemPriority;
  public projectId: string | null = null;
  project: Project | null = null;

  issueTitle: string = ''; // User input for project name
  issueDescription: string = ''; // User input for project description

  searchQuery: string = '';
  //Original Lists
  newIssues: Issue[] = [];
  inProgIssues: Issue[] = [];
  doneIssues: Issue[] = [];
  approvedIssues: Issue[] = [];

  // Filtered Lists
  filteredNewIssues = this.newIssues;
  filteredApprovedIssues = this.approvedIssues;
  filteredInProgIssues = this.inProgIssues;
  filteredDoneIssues = this.doneIssues;

  searchTerm: string = '';

  constructor(private apiService: ApiService, private route: ActivatedRoute) {
    this.getIssues();
  }

  ngOnInit(): void {
    // Get the project ID from the URL
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectsId'); // Get the ID from the URL

      if (this.projectId) {
        // Now that we have the project ID, fetch the project from the API
        this.getProject(this.projectId);
        this.getIssues();
        this.filterIssues();
      }
    });
  }

  filterIssues() {
    const query = this.searchQuery.toLowerCase();
    this.filteredNewIssues = this.newIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.description ?? '').toLowerCase().includes(query)
    );
    this.filteredApprovedIssues = this.approvedIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.description ?? '').toLowerCase().includes(query)
    );
    this.filteredInProgIssues = this.inProgIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.description ?? '').toLowerCase().includes(query)
    );
    this.filteredDoneIssues = this.doneIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.description ?? '').toLowerCase().includes(query)
    );
  }

  createIssue(): void {
    // Make the issue
    const issue: Issue = {
      project_id: this.projectId ?? '',
      title: this.issueTitle,
      description: this.issueDescription,
      type: ItemType.Bug,
      status: ItemStatus.New,
      priority: ItemPriority.Low,
    };
    // Create it using the API
    this.apiService.createIssue(issue).subscribe(() => {
      this.getIssues();
      this.filterIssues();
      this.issueTitle = '';
      this.issueDescription = '';
    });
  }

  getIssues(): void {
    // This is one way of using the API
    // See getProjects for the other way
    // this.apiService.getAllIssues().subscribe((issues: Issue[]) => {
    //   this.issues = issues;
    // });

    this.apiService.getAllIssuesOfProject(this.projectId ?? '').subscribe({
      // completeHandler
      complete: () => {},
      // errorHandler
      error: (error) => {
        console.error(error);
      },
      // nextHandler
      next: (issues: Issue[]) => {
        this.issues = issues; // Update the projects array
        this.updateArrays();
        console.log('Issues: ', this.issues);
      },
    });
  }

  getProject(id: string): void {
    this.apiService.getProject(this.projectId ?? '').subscribe({
      next: (project: Project) => {
        this.project = project; // Store the fetched project data
      },
      error: (err) => {
        console.error('Error fetching project:', err);
      },
    });
  }

  filterNewIssues(): void {
    this.newIssues = this.issues.filter(
      (issue) => issue.status === ItemStatus.New
    );
  }
  filterInProgIssues(): void {
    this.inProgIssues = this.issues.filter(
      (issue) => issue.status === ItemStatus.InProgress
    );
  }
  filterDoneIssues(): void {
    this.doneIssues = this.issues.filter(
      (issue) => issue.status === ItemStatus.Done
    );
  }

  filterApprovedIssues(): void {
    this.approvedIssues = this.issues.filter(
      (issue) => issue.status === ItemStatus.Approved
    );
  }

  drop(event: CdkDragDrop<Issue[]>): void {
    const issue = event.previousContainer.data[event.previousIndex];
    const containerId = event.container.element.nativeElement.id;

    if (event.previousContainer === event.container) {
      // Handle reordering within the same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.getIssues();
    } else {
      // Update the issue's status based on the container it was dropped into
      const newStatusMap = {
        newList: ItemStatus.New,
        approvedList: ItemStatus.Approved,
        inProgList: ItemStatus.InProgress,
        doneList: ItemStatus.Done,
      };

      const status = newStatusMap[containerId as keyof typeof newStatusMap];

      issue.status = status;
      // Update the issue on the backend or local storage
      this.apiService.updateIssue(issue.id ?? '', issue).subscribe({
        next: () => {
          // Move the item visually after a successful update
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.updateArrays();
        },
        error: (err) => console.error('Error updating issue:', err),
      });

      this.getIssues();
    }
  }

  updateArrays(): void {
    this.filterNewIssues();
    this.filterApprovedIssues();
    this.filterInProgIssues();
    this.filterDoneIssues();
  }

  // Helper function to check if an issue matches the search term
  matchesSearch(issue: { title: string; description: string }) {
    const term = this.searchTerm.toLowerCase();
    return (
      issue.title.toLowerCase().includes(term) ||
      issue.description.toLowerCase().includes(term)
    );
  }
}

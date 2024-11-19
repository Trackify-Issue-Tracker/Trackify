import { Component, inject, OnInit, HostListener } from '@angular/core';
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
import { IssueListComponent } from '../issue-list/issue-list.component';

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
    IssueListComponent,
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
  inputLabels: string = '';

  issueTitle: string = ''; // User input for project name
  issueDescription: string = ''; // User input for project description
  issueLabels: Array<string> = []; // User input for project descriptionstring = '';
  issuePriority: ItemPriority = ItemPriority.Unknown;
  issueType: ItemType = ItemType.Unknown;

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

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the project ID from the URL
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectsId'); // Get the ID from the URL

      if (this.projectId) {
        // Now that we have the project ID, fetch the project from the API
        this.getProject(this.projectId);
      }
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

  drop(event: CdkDragDrop<Issue[]>): void {
    const draggedIssue = event.item.data;

    const containerId = event.container.element.nativeElement.id;

    if (event.previousContainer === event.container) {
      // Handle reordering within the same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log('thisworking');
      this.updateArrays();
    } else {
      // Map the containerId to the status of the issue
      const newStatusMap = {
        newList: ItemStatus.New,
        approvedList: ItemStatus.Approved,
        inProgList: ItemStatus.InProgress,
        doneList: ItemStatus.Done,
      };

      const status = newStatusMap[containerId as keyof typeof newStatusMap];

      draggedIssue.status = status;

      // Update the issue on the backend
      this.apiService
        .updateIssue(draggedIssue.id ?? '', draggedIssue)
        .subscribe({
          next: () => {
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
            this.updateArrays();
          },
          error: (err) => {
            console.error('Error updating issue:', err);
          },
        });
    }
  }

  updateArrays(): void {
    this.filterNewIssues();
    this.filterApprovedIssues();
    this.filterInProgIssues();
    this.filterDoneIssues();
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
}

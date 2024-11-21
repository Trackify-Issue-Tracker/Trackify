import {
  Component,
  inject,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
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
  HighPriorityIssues: number = 0;

  searchQuery: string = '';
  sortOption: string = '';
  connectedLists = ['newList', 'approvedList', 'inProgList', 'doneList'];

  // References to child components
  @ViewChild('newListComponent') newListComponent!: IssueListComponent;
  @ViewChild('approvedListComponent')
  approvedListComponent!: IssueListComponent;
  @ViewChild('inProgListComponent') inProgListComponent!: IssueListComponent;
  @ViewChild('doneListComponent') doneListComponent!: IssueListComponent;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the project ID from the URL
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectsId'); // Get the ID from the URL

      if (this.projectId) {
        // Now that we have the project ID, fetch the project from the API
        this.getProject(this.projectId);
        this.getIssues();
        this.countIssues();
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

  onRefreshAllLists(): void {
    // Loop through connectedLists and trigger refresh for each corresponding child component
    this.connectedLists.forEach((listId) => {
      const childComponent = this.getChildComponentById(listId);
      if (childComponent) {
        childComponent.getIssues(); // Trigger refresh on the child component
      }
    });
    this.countIssues();
  }

  // Map listId to corresponding child component
  getChildComponentById(listId: string): IssueListComponent | null {
    switch (listId) {
      case 'newList':
        return this.newListComponent;
      case 'approvedList':
        return this.approvedListComponent;
      case 'inProgList':
        return this.inProgListComponent;
      case 'doneList':
        return this.doneListComponent;
      default:
        return null;
    }
  }

  sortIssues(): void {
    // Sorting the arrays alphabetically based on the issue title
    if (this.sortOption === 'alphabeticallyaz') {
      this.newListComponent.sortIssuesAZ();
      this.approvedListComponent.sortIssuesAZ();
      this.inProgListComponent.sortIssuesAZ();
      this.doneListComponent.sortIssuesAZ();
    }
    if (this.sortOption === 'alphabeticallyza') {
      this.newListComponent.sortIssuesZA();
      this.approvedListComponent.sortIssuesZA();
      this.inProgListComponent.sortIssuesZA();
      this.doneListComponent.sortIssuesZA();
    }
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
        this.issues = issues; // Update the issues array
        console.log('Issues: ', this.issues);
      },
    });
  }

  countIssues(): void {
    this.HighPriorityIssues = 0; // Reset the count before recalculating
    this.getIssues();
    // Loop through each issue and count those with 'high' status
    for (let issue of this.issues) {
      if (issue.priority === 'High' || issue.priority === 'Critical') {
        this.HighPriorityIssues++;
      }
    }
  }
}

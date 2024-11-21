import {
  Component,
  Input,
  SimpleChanges,
  EventEmitter,
  Output,
  HostListener,
  ViewChild,
  ElementRef,
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

import { ActivatedRoute } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.css',
})
export class IssueListComponent {
  public projectId: string | null = null;
  project: Project | null = null;

  issues: Issue[] = [];
  issueTitle: string = ''; // User input for project name
  issueDescription: string = ''; // User input for project description
  issueLabels: Array<string> = [];
  issuePriority: ItemPriority = ItemPriority.Unknown;
  issueType: ItemType = ItemType.Unknown;
  issueStatus: ItemStatus = ItemStatus.New;

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

  showIssueForm = false;
  currentForm = '';
  showButton = false;

  @Input() filteredIssuesKey: string = '';
  @Input() listId: string = '';
  @Input() connectedLists: string[] = [];
  @Input() listTitle: string = '';
  @Input() searchQuery: string = '';
  @Output() refreshAllLists = new EventEmitter<void>();

  inputLabels: string = '';

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this.filterIssues();
    }
  }

  getFilteredIssues() {
    const issuesMap: { [key: string]: any[] } = {
      filteredNewIssues: this.filteredNewIssues,
      filteredApprovedIssues: this.filteredApprovedIssues,
      filteredInProgIssues: this.filteredInProgIssues,
      filteredDoneIssues: this.filteredDoneIssues,
    };

    return issuesMap[this.filteredIssuesKey] || [];
  }

  getProject(id: string): void {
    this.apiService.getProject(this.projectId ?? '').subscribe({
      next: (project: Project) => {
        this.project = project; // Store the fetched project data
      },
      error: (err) => {
        console.error('Error fetching project:', err);
        console.log(this.project);
      },
    });
  }

  toggleFormAndButton(formName: string) {
    if (this.currentForm === formName && this.showIssueForm) {
      // If the same form is already open, close it
      this.showIssueForm = false;
      this.currentForm = '';
      this.showButton = false;
    } else {
      // Open the form and hide the button
      this.showIssueForm = true;
      this.currentForm = formName;
      this.showButton = false;
      console.log(this.showButton);
    }
  }

  updateLabels(): void {
    // Split the input string into an array of labels
    this.issueLabels = this.inputLabels
      .split(/[\s,]+/)
      .map((label) => label.trim())
      .filter((label) => label !== '');
    // Clear the input field (optional)
    this.inputLabels = '';
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
        this.updateArrays();
        this.filterIssues();
        console.log('Issues: ', this.issues);
      },
    });
  }

  createIssue(): void {
    this.setIssueStatusBasedOnListTitle();
    this.updateLabels();
    console.log(this.issueLabels);
    // Make the issue

    const issue: Issue = {
      project_id: this.projectId ?? '',
      title: this.issueTitle || 'New Issue',
      description: this.issueDescription || 'This is a new issue',
      type: this.issueType,
      status: this.issueStatus,
      priority: this.issuePriority,
      labels: this.issueLabels,
    };
    // Create it using the API
    this.apiService.createIssue(issue).subscribe(() => {
      this.getIssues();
      this.filterIssues();
      this.issueTitle = '';
      this.issueDescription = '';
      this.issueLabels = [];
      this.issuePriority = ItemPriority.Unknown;
      this.issueType = ItemType.Unknown;
      this.issueStatus = ItemStatus.New;
    });
  }

  setIssueStatusBasedOnListTitle(): void {
    switch (this.listTitle.toUpperCase()) {
      case 'NEW':
        this.issueStatus = ItemStatus.New;
        break;
      case 'APPROVED':
        this.issueStatus = ItemStatus.Approved;
        break;
      case 'IN PROGRESS':
        this.issueStatus = ItemStatus.InProgress;
        break;
      case 'DONE':
        this.issueStatus = ItemStatus.Done;
        break;
      default:
        this.issueStatus = ItemStatus.New; // Default status in case of unexpected title
        break;
    }
  }
  deleteIssue(issueId: string) {
    this.apiService.deleteIssue(issueId).subscribe(() => {
      this.getIssues();
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

  drop(event: CdkDragDrop<Issue[]>): void {
    const issue = event.item.data;
    const containerId = event.container.element.nativeElement.id;

    if (event.previousContainer === event.container) {
      // Handle reordering within the same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updateArrays(); // Ensure array update
      this.refreshAllLists.emit();
    } else {
      // Update the issue's status based on the container it was dropped into
      const newStatusMap = {
        newList: ItemStatus.New,
        approvedList: ItemStatus.Approved,
        inProgList: ItemStatus.InProgress,
        doneList: ItemStatus.Done,
      };

      const status = newStatusMap[containerId as keyof typeof newStatusMap];

      if (!status) {
        console.error('Invalid container ID');
        return; // Avoid updating if there's no valid status
      }

      issue.status = status;

      // Call the API to update the issue status
      this.apiService.updateIssue(issue.id ?? '', issue).subscribe({
        next: () => {
          // Move the item visually after a successful update
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.updateArrays(); // Ensure array update
          this.refreshAllLists.emit();
        },
        error: (err) => {
          console.error('Error updating issue:', err);
          // Optionally show user-friendly message in the UI
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

  sortIssuesAZ(): void {
    // Sorting the arrays alphabetically based on the issue title
    this.newIssues.sort((a, b) => a.title.localeCompare(b.title));
    this.inProgIssues.sort((a, b) => a.title.localeCompare(b.title));
    this.doneIssues.sort((a, b) => a.title.localeCompare(b.title));
    this.approvedIssues.sort((a, b) => a.title.localeCompare(b.title));
    this.filterIssues();
  }

  sortIssuesZA(): void {
    // Sorting the arrays alphabetically based on the issue title
    this.newIssues.sort((a, b) => b.title.localeCompare(a.title));
    this.inProgIssues.sort((a, b) => b.title.localeCompare(a.title));
    this.doneIssues.sort((a, b) => b.title.localeCompare(a.title));
    this.approvedIssues.sort((a, b) => b.title.localeCompare(a.title));
    this.filterIssues();
  }
}

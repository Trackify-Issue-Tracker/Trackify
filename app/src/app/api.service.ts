// app/src/app/api.service.ts
// The API service will be built in python and will have functions to operate on data in the database
// This file is used to communicate with the python api
// Also contains the Project and Issue interfaces
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';
import { IS_CONTAINERIZED } from './is_containerized';

// Enums for Status, Priority, and Type
export enum ItemStatus {
  New = 'New',
  Approved = 'Approved',
  InProgress = 'In progress',
  Done = 'Done',
  Closed = 'Closed',
}
export enum ItemPriority {
  Unknown = '',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}
export enum ItemType {
  Unknown = '',
  Bug = 'Bug',
  Task = 'Task',
  Improvement = 'Improvement',
  Feature = 'Feature',
  Other = 'Other',
}

// Interfaces for Project and Issuea
// ID and DATE_CREATED won't be changed even if provided since they are configured internally
export interface Project {
  id?: string;
  name: string;
  description?: string;
  status: ItemStatus;
  priority?: ItemPriority;
  date_created?: string;
  date_started?: string;
  date_closed?: string;
  labels?: Array<string>;
}

export interface Issue {
  id?: string;
  project_id: string;
  title: string;
  description?: string;
  type: ItemType;
  status: ItemStatus;
  priority?: ItemPriority;
  date_created?: string;
  date_started?: string; // when was this issue changed to in progress
  date_due?: string;
  date_closed?: string;
  labels?: Array<string>;
}

interface JsonResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {
    // Check if we are running in a container
    if (!IS_CONTAINERIZED) {
      // If not, load data from local storage
      if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify([]));
      }
      if (!localStorage.getItem('issues')) {
        localStorage.setItem('issues', JSON.stringify([]));
      }
    }
  }

  reset(): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, reset data from the API
      return this.http.delete<JsonResponse>(`${this.apiUrl}/reset`);
    }
    // If we are not running in a container, reset data from local storage
    localStorage.setItem('projects', JSON.stringify([]));
    localStorage.setItem('issues', JSON.stringify([]));
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  getAllProjects(): Observable<Project[]> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, get data from the API
      return this.http
        .get<JsonResponse>(`${this.apiUrl}/projects`)
        .pipe(map((response: JsonResponse) => response.message));
    }
    // If we are not running in a container, get data from local storage
    return new Observable<Project[]>((observer) => {
      observer.next(this.getLocalStorageProjects());
      observer.complete();
    });
  }

  createProject(project: Project): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, post data to the API
      return this.http.post(`${this.apiUrl}/projects`, project);
    }
    // If we are not running in a container, set data in local storage
    const items: Project[] = this.getLocalStorageProjects();
    const maxId =
      items.length > 0 ? Math.max(...items.map((item) => Number(item.id))) : 0;
    project.id = (maxId + 1).toString();
    items.push(project);
    localStorage.setItem('projects', JSON.stringify(items));

    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  getProject(project_id: string): Observable<Project> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, get data from the API
      return this.http
        .get<JsonResponse>(`${this.apiUrl}/projects/${project_id}`)
        .pipe(map((response: JsonResponse) => response.message));
    }
    // If we are not running in a container, get data from local storage
    const items: Project[] = this.getLocalStorageProjects();
    const project = items.find((project) => project.id === project_id);
    if (project) {
      return new Observable<Project>((observer) => {
        observer.next(project);
        observer.complete();
      });
    }
    return new Observable<Project>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  updateProject(project_id: string, value: Project): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, put data to the API
      return this.http.put(`${this.apiUrl}/projects/${project_id}`, value);
    }
    // If we are not running in a container, set data in local storage
    const items: Project[] = this.getLocalStorageProjects();
    const index = items.findIndex((project) => project.id === project_id);
    if (index !== -1) {
      const current = items[index];
      // Update only the fields that were provided
      current.status = value.status ?? current.status;
      current.name = value.name ?? current.name;
      current.description = value.description ?? current.description;
      current.priority = value.priority ?? current.priority;
      current.labels = value.labels ?? current.labels;
      current.date_started = value.date_started ?? current.date_started;
      current.date_closed = value.date_closed ?? current.date_closed;
      items[index] = current;
      localStorage.setItem('projects', JSON.stringify(items));
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  deleteProject(project_id: string): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, delete data from the API
      return this.http.delete(`${this.apiUrl}/projects/${project_id}`);
    }
    // If we are not running in a container, delete data from local storage
    const items: Project[] = this.getLocalStorageProjects();
    const index = items.findIndex((project) => project.id === project_id);
    if (index !== -1) {
      items.splice(index, 1);
      localStorage.setItem('projects', JSON.stringify(items));
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  getAllIssuesOfProject(project_id: string): Observable<Issue[]> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, get data from the API
      return this.http
        .get<JsonResponse>(`${this.apiUrl}/projects/${project_id}/issues`)
        .pipe(map((response: JsonResponse) => response.message));
    }
    // If we are not running in a container, get data from local storage
    const items: Issue[] = this.getLocalStorageIssues();
    const issues = items.filter((issue) => issue.project_id === project_id);
    if (issues) {
      return new Observable<Issue[]>((observer) => {
        observer.next(issues);
        observer.complete();
      });
    }
    return new Observable<Issue[]>((observer) => {
      observer.next([]);
      observer.complete();
    });
  }

  createIssue(issue: Issue): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, post data to the API
      return this.http.post(
        `${this.apiUrl}/projects/${issue.project_id}/issues`,
        issue
      );
    }
    // If we are not running in a container, set data in local storage
    const projects: Project[] = this.getLocalStorageProjects();
    const project_index = projects.findIndex(
      (project) => project.id === issue.project_id
    );
    if (project_index !== -1) {
      const items: Issue[] = this.getLocalStorageIssues();
      const maxId =
        items.length > 0
          ? Math.max(...items.map((item) => Number(item.id)))
          : 0;
      issue.id = (maxId + 1).toString();
      items.push(issue);
      localStorage.setItem('issues', JSON.stringify(items));
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  getIssue(issue_id: string): Observable<Issue> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, get data from the API
      return this.http
        .get<JsonResponse>(`${this.apiUrl}/issues/${issue_id}`)
        .pipe(map((response: JsonResponse) => response.message));
    }
    // If we are not running in a container, get data from local storage
    const items: Issue[] = this.getLocalStorageIssues();
    const issue = items.find((issue) => issue.id === issue_id);
    if (issue) {
      return new Observable<Issue>((observer) => {
        observer.next(issue);
        observer.complete();
      });
    }
    return new Observable<Issue>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  updateIssue(issue_id: string, value: Issue): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, put data to the API
      return this.http.put(`${this.apiUrl}/issues/${issue_id}`, value);
    }
    // If we are not running in a container, set data in local storage
    const items: Issue[] = this.getLocalStorageIssues();
    const index = items.findIndex((issue) => issue.id === issue_id);
    if (index !== -1) {
      const current = items[index];
      // Update only the fields that were provided
      current.title = value.title ?? current.title;
      current.description = value.description ?? current.description;
      current.status = value.status ?? current.status;
      current.priority = value.priority ?? current.priority;
      current.date_closed = value.date_closed ?? current.date_closed;
      current.date_started = value.date_started ?? current.date_started;
      current.date_due = value.date_due ?? current.date_due;
      current.project_id = value.project_id ?? current.project_id;
      current.labels = value.labels ?? current.labels;

      items[index] = current;
      localStorage.setItem('issues', JSON.stringify(items));
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  deleteIssue(issue_id: string): Observable<object> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, delete data from the API
      return this.http.delete(`${this.apiUrl}/issues/${issue_id}`);
    }
    // If we are not running in a container, delete data from local storage
    const items: Issue[] = this.getLocalStorageIssues();
    const index = items.findIndex((issue) => issue.id === issue_id);
    if (index !== -1) {
      items.splice(index, 1);
      localStorage.setItem('issues', JSON.stringify(items));
    }
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  getAllIssues(): Observable<Issue[]> {
    if (IS_CONTAINERIZED) {
      // If we are running in a container, get data from the API
      return this.http
        .get<JsonResponse>(`${this.apiUrl}/issues`)
        .pipe(map((response: JsonResponse) => response.message));
    }
    // If we are not running in a container, get data from local storage
    return new Observable<Issue[]>((observer) => {
      observer.next(this.getLocalStorageIssues());
      observer.complete();
    });
  }

  private getLocalStorageProjects(): Project[] {
    return localStorage.getItem('projects')
      ? JSON.parse(localStorage.getItem('projects') as string)
      : [];
  }

  private getLocalStorageIssues(): Issue[] {
    return localStorage.getItem('issues')
      ? JSON.parse(localStorage.getItem('issues') as string)
      : [];
  }
}

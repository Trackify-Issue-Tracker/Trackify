// app/src/app/api.service.ts
// The API service will be built in python and will have functions to operate on data in the database
// This file is used to communicate with the python api
// Also contains the Project and Issue interfaces
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';
import { IS_CONTAINERIZED } from './is_containerized';


export interface Project {
    id: string;
    name: string;
    description: string;
}

export interface Issue {
    id: string;
    project_id: string;
    title: string;
    description: string;
}

interface JsonResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any;
}

@Injectable({
    providedIn: 'root'
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

    getAllProjects(): Observable<Project[]> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, get data from the API
            return this.http.get<JsonResponse>(`${this.apiUrl}/projects`).pipe(
                map((response: JsonResponse) => response.message)
            );
        }
        // If we are not running in a container, get data from local storage
        return new Observable<Project[]>(observer => {
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
        const index = items.findIndex(item => item.id === project.id);
        if (index === -1) {
            items.push(project);
            localStorage.setItem('projects', JSON.stringify(items));
        }
        return new Observable();
    }

    getProject(project_id: string): Observable<Project> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, get data from the API
            return this.http.get<JsonResponse>(`${this.apiUrl}/projects/${project_id}`).pipe(
                map((response: JsonResponse) => response.message)
            );
        }
        // If we are not running in a container, get data from local storage
        const items: Project[] = this.getLocalStorageProjects();
        const project = items.find(project => project.id === project_id);
        if (project) {
            return new Observable<Project>(observer => {
                observer.next(project);
                observer.complete();
            });
        }
        return new Observable<Project>();
    }



    updateProject(project_id: string, value: Project): Observable<object> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, put data to the API
            return this.http.put(`${this.apiUrl}/projects/${project_id}`, value);
        }
        // If we are not running in a container, set data in local storage
        const items: Project[] = this.getLocalStorageProjects();
        const index = items.findIndex(project => project.id === project_id);
        if (index !== -1) {
            items[index] = value;
            localStorage.setItem('projects', JSON.stringify(items));
        }
        return new Observable();
    }

    deleteProject(project_id: string): Observable<object> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, delete data from the API
            return this.http.delete(`${this.apiUrl}/projects/${project_id}`);
        }
        // If we are not running in a container, delete data from local storage
        const items: Project[] = this.getLocalStorageProjects();
        const index = items.findIndex(project => project.id === project_id);
        if (index !== -1) {
            items.splice(index, 1);
            localStorage.setItem('projects', JSON.stringify(items));
        }
        return new Observable();
    }

    getAllIssuesOfProject(project_id: string): Observable<Issue[]> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, get data from the API
            return this.http.get<JsonResponse>(`${this.apiUrl}/projects/${project_id}/issues`).pipe(
                map((response: JsonResponse) => response.message)
            );
        }
        // If we are not running in a container, get data from local storage
        const items: Issue[] = this.getLocalStorageIssues();
        const issues = items.filter(issue => issue.project_id === project_id);
        if (issues) {
            return new Observable<Issue[]>(observer => {
                observer.next(issues);
                observer.complete();
            });
        }
        return new Observable<Issue[]>(observer => {
            observer.next([]);
            observer.complete();
        });
    }

    createIssue(issue: Issue): Observable<object> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, post data to the API
            return this.http.post(`${this.apiUrl}/projects/${issue.project_id}/issues`, issue);
        }
        // If we are not running in a container, set data in local storage
        const items: Issue[] = this.getLocalStorageIssues();
        const index = items.findIndex(issue => issue.id === issue.id);
        if (index === -1) {
            items.push(issue);
            localStorage.setItem('issues', JSON.stringify(items));
        }
        return new Observable();
    }

    getIssue(issue_id: string): Observable<Issue> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, get data from the API
            return this.http.get<JsonResponse>(`${this.apiUrl}/issues/${issue_id}`).pipe(
                map((response: JsonResponse) => response.message)
            );
        }
        // If we are not running in a container, get data from local storage
        const items: Issue[] = this.getLocalStorageIssues();
        const issue = items.find(issue => issue.id === issue_id);
        if (issue) {
            return new Observable<Issue>(observer => {
                observer.next(issue);
                observer.complete();
            });
        }
        return new Observable<Issue>();
    }

    updateIssue(issue_id: string, value: Issue): Observable<object> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, put data to the API
            return this.http.put(`${this.apiUrl}/issues/${issue_id}`, value);
        }
        // If we are not running in a container, set data in local storage
        const items: Issue[] = this.getLocalStorageIssues();
        const index = items.findIndex(issue => issue.id === issue_id);
        if (index !== -1) {
            items[index] = value;
            localStorage.setItem('issues', JSON.stringify(items));
        }
        return new Observable();
    }

    deleteIssue(issue_id: string): Observable<object> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, delete data from the API
            return this.http.delete(`${this.apiUrl}/issues/${issue_id}`);
        }
        // If we are not running in a container, delete data from local storage
        const items: Issue[] = this.getLocalStorageIssues();
        const index = items.findIndex(issue => issue.id === issue_id);
        if (index !== -1) {
            items.splice(index, 1);
            localStorage.setItem('issues', JSON.stringify(items));
        }
        return new Observable();
    }

    getAllIssues(): Observable<Issue[]> {
        if (IS_CONTAINERIZED) {
            // If we are running in a container, get data from the API
            return this.http.get<JsonResponse>(`${this.apiUrl}/issues`).pipe(
                map((response: JsonResponse) => response.message)
            );
        }
        // If we are not running in a container, get data from local storage
        return new Observable<Issue[]>(observer => {
            observer.next(this.getLocalStorageIssues());
            observer.complete();
        });
    }

    private getLocalStorageProjects(): Project[] {
        return localStorage.getItem('projects') ? JSON.parse(localStorage.getItem('projects') as string) : [];
    }

    private getLocalStorageIssues(): Issue[] {
        return localStorage.getItem('issues') ? JSON.parse(localStorage.getItem('issues') as string) : [];
    }

}
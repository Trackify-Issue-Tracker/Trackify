// app/src/app/api.service.ts
// The API service will be built in python and will have functions to operate on data in the database
// This file is used to communicate with the python api
// Also contains the Project and Issue interfaces
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';


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


@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private apiUrl = 'http://localhost:5000/api'; // Use the hostname 'backend-container' and port 5001

    constructor(private http: HttpClient) { }

    getAllProjects(): Observable<Project[]> {
        return this.http.get(`${this.apiUrl}/projects`).pipe(
            map((response: any) => response.message)
        );
    }

    createProject(project: Project): Observable<any> {
        return this.http.post(`${this.apiUrl}/projects`, project);
    }

    getProject(project_id: string): Observable<Project> {
        return this.http.get(`${this.apiUrl}/projects/${project_id}`).pipe(
            map((response: any) => response.message)
        );
    }

    updateProject(project_id: string, value: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/projects/${project_id}`, value);
    }
    // TODO: edit this

    deleteProject(project_id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/projects/${project_id}`);
    }

    getAllIssuesOfProject(project_id: string): Observable<Issue[]> {
        return this.http.get(`${this.apiUrl}/projects/${project_id}/issues`).pipe(
            map((response: any) => response.message)
        );
    }

    createIssue(issue: Issue): Observable<any> {
        return this.http.post(`${this.apiUrl}/projects/${issue.project_id}/issues`, issue);
    }

    getIssue(issue_id: string): Observable<Issue> {
        return this.http.get(`${this.apiUrl}/issues/${issue_id}`).pipe(
            map((response: any) => response.message)
        );
    }

    updateIssue(issue_id: string, value: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/issues/${issue_id}`, value);
    }

    deleteIssue(issue_id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/issues/${issue_id}`);
    }

    getAllIssues(): Observable<Issue[]> {
        return this.http.get(`${this.apiUrl}/issues`).pipe(
            map((response: any) => response.message)
        );
    }

}
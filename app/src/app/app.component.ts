import { Component } from '@angular/core'; //OnInit
import { Injectable } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, Project, Issue } from './api.service';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,

    FormsModule,

    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
@Injectable({
  providedIn: 'root',
})
export class AppComponent {
  title = 'routing-app';
}

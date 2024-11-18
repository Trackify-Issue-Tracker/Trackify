import { Component } from '@angular/core'; //OnInit
import { Injectable } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService, Project, Issue } from './api.service';
import { CommonModule } from '@angular/common';
import { HoverNavBarComponent } from './hover-nav-bar/hover-nav-bar.component';
import { ProjectlistComponent } from './projectlist/projectlist.component';
import { FormsModule } from '@angular/forms';
import { InfoBarComponent } from './info-bar/info-bar.component';
import { QuickprojectdetailsComponent } from './quickprojectdetails/quickprojectdetails.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HoverNavBarComponent,
    ProjectlistComponent,
    FormsModule,
    InfoBarComponent,
    QuickprojectdetailsComponent,
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

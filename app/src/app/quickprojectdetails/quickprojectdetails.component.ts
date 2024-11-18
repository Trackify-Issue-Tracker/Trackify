import { Component, Input } from '@angular/core';
import { Project } from '../api.service';

@Component({
  selector: 'quickpdetails',
  standalone: true,
  imports: [],
  templateUrl: './quickprojectdetails.component.html',
  styleUrl: './quickprojectdetails.component.css',
})
export class QuickprojectdetailsComponent {
  @Input() project!: Project;
}

import { Component } from '@angular/core';
import {
  ApiService,
  Project,
  Issue,
  ItemStatus,
  ItemType,
  ItemPriority,
} from '../../../api.service';

@Component({
  selector: 'create-project',
  imports: [],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
})
export class CreateProjectComponent {}

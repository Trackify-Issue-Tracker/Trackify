import { Component, Input } from '@angular/core';

@Component({
  selector: 'infobar',
  standalone: true,
  imports: [],
  templateUrl: './info-bar.component.html',
  styleUrl: './info-bar.component.css',
})
export class InfoBarComponent {
  @Input() title: string = 'Project Manager';
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hoverbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hover-nav-bar.component.html',
  styleUrl: './hover-nav-bar.component.css',
})
export class HoverNavBarComponent {
  navigation = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      url: '#Dashboard',
      svgPaths: [
        'M12.71 2.29a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42A1 1 0 0 0 3 13h1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 1-1 1 1 0 0 0-.29-.71zM6 20v-9.59l6-6 6 6V20z',
      ],
    },
    {
      id: 'projects',
      title: 'Projects',
      url: '#Projects',
      svgPaths: [
        'M7.972 2h-6.972l.714 5h2.021l-.429-3h3.694c1.112 1.388 1.952 2 4.277 2h9.283l-.2 1h2.04l.6-3h-11.723c-1.978 0-2.041-.417-3.305-2zm16.028 7h-24l2 13h20l2-13z',
      ],
    },
    {
      id: '2',
      title: 'Calendar',
      url: '#Calendar',
      svgPaths: [
        'M20 20h-4v-4h4v4zm-6-10h-4v4h4v-4zm6 0h-4v4h4v-4zm-12 6h-4v4h4v-4zm6 0h-4v4h4v-4zm-6-6h-4v4h4v-4zm16-8v22h-24v-22h3v1c0 1.103.897 2 2 2s2-.897 2-2v-1h10v1c0 1.103.897 2 2 2s2-.897 2-2v-1h3zm-2 6h-20v14h20v-14zm-2-7c0-.552-.447-1-1-1s-1 .448-1 1v2c0 .552.447 1 1 1s1-.448 1-1v-2zm-14 2c0 .552-.447 1-1 1s-1-.448-1-1v-2c0-.552.447-1 1-1s1 .448 1 1v2z',
      ],
    },
  ];

  showSettingsBox: boolean = false; // Add this line

  openSettingsBox() {
    this.showSettingsBox = !this.showSettingsBox; // Toggle visibility
  }
}

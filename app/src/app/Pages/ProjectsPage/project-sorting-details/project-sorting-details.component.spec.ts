import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSortingDetailsComponent } from './project-sorting-details.component';

describe('ProjectSortingDetailsComponent', () => {
  let component: ProjectSortingDetailsComponent;
  let fixture: ComponentFixture<ProjectSortingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSortingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectSortingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectlistComponent } from './projectlist.component';

describe('ProjectlistComponent', () => {
  let component: ProjectlistComponent;
  let fixture: ComponentFixture<ProjectlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickprojectdetailsComponent } from './quickprojectdetails.component';

describe('QuickprojectdetailsComponent', () => {
  let component: QuickprojectdetailsComponent;
  let fixture: ComponentFixture<QuickprojectdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickprojectdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuickprojectdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

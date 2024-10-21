import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverNavBarComponent } from './hover-nav-bar.component';

describe('HoverNavBarComponent', () => {
  let component: HoverNavBarComponent;
  let fixture: ComponentFixture<HoverNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoverNavBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoverNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

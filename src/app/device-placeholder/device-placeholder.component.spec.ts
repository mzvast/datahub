import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePlaceholderComponent } from './device-placeholder.component';

describe('DevicePlaceholderComponent', () => {
  let component: DevicePlaceholderComponent;
  let fixture: ComponentFixture<DevicePlaceholderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePlaceholderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTagComponent } from './device-tag.component';

describe('DeviceTagComponent', () => {
  let component: DeviceTagComponent;
  let fixture: ComponentFixture<DeviceTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

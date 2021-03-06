import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceCustomComponent } from './device-custom.component';

describe('DeviceCustomComponent', () => {
  let component: DeviceCustomComponent;
  let fixture: ComponentFixture<DeviceCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

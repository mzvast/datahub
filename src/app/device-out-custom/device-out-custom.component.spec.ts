import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceOutCustomComponent } from './device-out-custom.component';

describe('DeviceOutCustomComponent', () => {
  let component: DeviceOutCustomComponent;
  let fixture: ComponentFixture<DeviceOutCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceOutCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceOutCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

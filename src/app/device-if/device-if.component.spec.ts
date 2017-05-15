import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceIfComponent } from './device-if.component';

describe('DeviceIfComponent', () => {
  let component: DeviceIfComponent;
  let fixture: ComponentFixture<DeviceIfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceIfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceIfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceIntfComponent } from './device-intf.component';

describe('DeviceIntfComponent', () => {
  let component: DeviceIntfComponent;
  let fixture: ComponentFixture<DeviceIntfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceIntfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceIntfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

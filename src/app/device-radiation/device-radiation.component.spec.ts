import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceRadiationComponent } from './device-radiation.component';

describe('DeviceRadiationComponent', () => {
  let component: DeviceRadiationComponent;
  let fixture: ComponentFixture<DeviceRadiationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceRadiationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceRadiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

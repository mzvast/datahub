import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePhaseComponent } from './device-phase.component';

describe('DevicePhaseComponent', () => {
  let component: DevicePhaseComponent;
  let fixture: ComponentFixture<DevicePhaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePhaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

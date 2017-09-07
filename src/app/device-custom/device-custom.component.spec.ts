import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePdwComponent } from './device-custom.component';

describe('DevicePdwComponent', () => {
  let component: DevicePdwComponent;
  let fixture: ComponentFixture<DevicePdwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePdwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePdwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

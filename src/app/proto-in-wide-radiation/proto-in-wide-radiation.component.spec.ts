import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInWideRadiationComponent } from './proto-in-wide-radiation.component';

describe('ProtoInWideRadiationComponent', () => {
  let component: ProtoInWideRadiationComponent;
  let fixture: ComponentFixture<ProtoInWideRadiationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInWideRadiationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInWideRadiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

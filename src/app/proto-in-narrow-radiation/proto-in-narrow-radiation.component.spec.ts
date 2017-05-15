import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInNarrowRadiationComponent } from './proto-in-narrow-radiation.component';

describe('ProtoInNarrowRadiationComponent', () => {
  let component: ProtoInNarrowRadiationComponent;
  let fixture: ComponentFixture<ProtoInNarrowRadiationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInNarrowRadiationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInNarrowRadiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

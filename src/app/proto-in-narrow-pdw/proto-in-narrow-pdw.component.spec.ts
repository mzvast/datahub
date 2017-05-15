import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInNarrowPdwComponent } from './proto-in-narrow-pdw.component';

describe('ProtoInNarrowPdwComponent', () => {
  let component: ProtoInNarrowPdwComponent;
  let fixture: ComponentFixture<ProtoInNarrowPdwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInNarrowPdwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInNarrowPdwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

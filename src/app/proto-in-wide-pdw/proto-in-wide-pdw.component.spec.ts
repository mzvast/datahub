import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInWidePdwComponent } from './proto-in-wide-pdw.component';

describe('ProtoInWidePdwComponent', () => {
  let component: ProtoInWidePdwComponent;
  let fixture: ComponentFixture<ProtoInWidePdwComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInWidePdwComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInWidePdwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInComponent } from './proto-in.component';

describe('ProtoInComponent', () => {
  let component: ProtoInComponent;
  let fixture: ComponentFixture<ProtoInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

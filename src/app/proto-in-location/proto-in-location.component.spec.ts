import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInLocationComponent } from './proto-in-location.component';

describe('ProtoInLocationComponent', () => {
  let component: ProtoInLocationComponent;
  let fixture: ComponentFixture<ProtoInLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

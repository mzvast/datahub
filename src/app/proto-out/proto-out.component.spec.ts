import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoOutComponent } from './proto-out.component';

describe('ProtoOutComponent', () => {
  let component: ProtoOutComponent;
  let fixture: ComponentFixture<ProtoOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

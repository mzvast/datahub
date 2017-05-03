import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoAddrComponent } from './proto-addr.component';

describe('ProtoAddrComponent', () => {
  let component: ProtoAddrComponent;
  let fixture: ComponentFixture<ProtoAddrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoAddrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoAddrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInIntfComponent } from './proto-in-intf.component';

describe('ProtoInIntfComponent', () => {
  let component: ProtoInIntfComponent;
  let fixture: ComponentFixture<ProtoInIntfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInIntfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInIntfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInIfComponent } from './proto-in-if.component';

describe('ProtoInIfComponent', () => {
  let component: ProtoInIfComponent;
  let fixture: ComponentFixture<ProtoInIfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInIfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInIfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

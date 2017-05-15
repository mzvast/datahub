import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInTagComponent } from './proto-in-tag.component';

describe('ProtoInTagComponent', () => {
  let component: ProtoInTagComponent;
  let fixture: ComponentFixture<ProtoInTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

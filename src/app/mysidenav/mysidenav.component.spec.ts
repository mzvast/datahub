import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MysidenavComponent } from './mysidenav.component';

describe('MysidenavComponent', () => {
  let component: MysidenavComponent;
  let fixture: ComponentFixture<MysidenavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MysidenavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MysidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

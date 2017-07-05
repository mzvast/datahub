import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataShowDialogComponent } from './data-show-dialog.component';

describe('DataShowDialogComponent', () => {
  let component: DataShowDialogComponent;
  let fixture: ComponentFixture<DataShowDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataShowDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataShowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

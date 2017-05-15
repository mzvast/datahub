import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoInPhraseComponent } from './proto-in-phrase.component';

describe('ProtoInPhraseComponent', () => {
  let component: ProtoInPhraseComponent;
  let fixture: ComponentFixture<ProtoInPhraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtoInPhraseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtoInPhraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

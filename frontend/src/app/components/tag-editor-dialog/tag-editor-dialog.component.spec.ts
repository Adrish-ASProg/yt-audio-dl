import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TagEditorDialog} from './tag-editor-dialog.component';

describe('TagEditorDialogComponent', () => {
  let component: TagEditorDialog;
  let fixture: ComponentFixture<TagEditorDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagEditorDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagEditorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

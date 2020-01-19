import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FileStatusTableComponent} from './file-status-table.component';

describe('FileStatusTableComponent', () => {
  let component: FileStatusTableComponent;
  let fixture: ComponentFixture<FileStatusTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileStatusTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileStatusTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

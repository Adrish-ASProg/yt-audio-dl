import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FileStatusTableComponent} from './file-status-table.component';
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('FileStatusTableComponent', () => {
    let component: FileStatusTableComponent;
    let fixture: ComponentFixture<FileStatusTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FileStatusTableComponent],
            imports: [
                BrowserAnimationsModule,

                MatTableModule,
                MatCheckboxModule,
                MatPaginatorModule,
                MatSortModule,
                MatIconModule,
                MatButtonModule
            ],
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

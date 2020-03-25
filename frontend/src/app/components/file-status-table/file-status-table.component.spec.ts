import {MatSortModule} from "@angular/material/sort";
import {MatTableModule} from "@angular/material/table";
import {BrowserModule} from "@angular/platform-browser";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatPaginatorModule} from "@angular/material/paginator";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {IonicModule} from "@ionic/angular";

import {FileStatusTableComponent} from './file-status-table.component';
import {SettingsServiceModule} from "../../services/settings/settings-service.module";

import {EllipsisModule} from "ngx-ellipsis";

describe('FileStatusTableComponent', () => {
    let component: FileStatusTableComponent;
    let fixture: ComponentFixture<FileStatusTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FileStatusTableComponent],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,

                IonicModule,

                SettingsServiceModule,

                MatTableModule,
                MatCheckboxModule,
                MatPaginatorModule,
                MatSortModule,
                MatButtonModule,
                MatSnackBarModule,
                MatProgressSpinnerModule,

                EllipsisModule,
                MatTooltipModule
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
